import { Router } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { validateProductsQuery } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authz.js';
import { setListCache } from '../middleware/cache-headers.js';
import { pool } from '../db/db.js';



export const catalog = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = rel => path.join(__dirname, '..', 'data', rel);

function readJSON(file) {
  const p = dataPath(file);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

catalog.get('/api/categories', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.slug,
        c.name,
        c.hero_image,
        c.description,
        COALESCE(COUNT(p.id), 0)::int AS product_count
      FROM categories c
      LEFT JOIN products p
        ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    setListCache(res, 60);
    res.json({ data: rows });
  } catch (e) { next(e); }
});


catalog.get('/api/products', validateProductsQuery, async (req, res, next) => {
  try {
    const { page, limit } = req.pagination;    
    const { q, category } = req.filters;        
    const { min, max } = req.price || {};        
    const offset = (page - 1) * limit;          

    const sortMap = {
      newest: 'created_at DESC',
      price_asc: 'price_cents ASC',
      price_desc: 'price_cents DESC',
      rating_desc: 'rating DESC NULLS LAST'
    };
    const orderBy = sortMap[req.sort];           

    const where = [];
    const params = [];
    let i = 1;

    if (q) {
      where.push(`(LOWER(title) LIKE $${i} OR LOWER(description) LIKE $${i})`);
      params.push(`%${q.toLowerCase()}%`);
      i++;
    }

    if (category) {
      where.push(`category_id = (SELECT id FROM categories WHERE slug = $${i})`);
      params.push(category);
      i++;
    }

    const hasMin = min !== undefined && min !== null && String(min).trim() !== '';
    const hasMax = max !== undefined && max !== null && String(max).trim() !== '';

    if (hasMin) {
      const minCents = Math.round(Number(min) * 100);
      if (Number.isFinite(minCents) && minCents >= 0) {
        where.push(`price_cents >= $${i}`);
        params.push(minCents);
        i++;
      }
    }

    if (hasMax) {
      const maxCents = Math.round(Number(max) * 100);
      if (Number.isFinite(maxCents) && maxCents >= 0) {
        where.push(`price_cents <= $${i}`);
        params.push(maxCents);
        i++;
      }
    }


    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalSql = `SELECT COUNT(*)::int AS total FROM products ${whereSql}`;
    const totalResult = await pool.query(totalSql, params);
    const total = totalResult.rows[0].total;

    const dataSql = `
      SELECT id, title, slug, price_cents, currency, rating, thumbnail, category_id, created_at,description
      FROM products
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT $${i} OFFSET $${i + 1}
    `;
    const dataParams = [...params, limit, offset];
    const { rows } = await pool.query(dataSql, dataParams);

    setListCache(res, 120);
    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        hasMore: offset + rows.length < total
      }
    });
  } catch (e) {
    next(e);
  }
});



catalog.get('/api/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const { rows } = await pool.query(
      `SELECT p.id, p.title, p.slug, p.description, p.price_cents, p.currency,
              p.rating, p.thumbnail, p.category_id, p.created_at,
              c.slug  AS category_slug,
              c.name  AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: { code: 404, message: 'Product not found' } });
    }
    const product = rows[0];

    const rel = await pool.query(
      `SELECT id, title, slug, price_cents, currency, rating, thumbnail
       FROM products
       WHERE category_id = $1 AND id <> $2
       ORDER BY rating DESC NULLS LAST, created_at DESC
       LIMIT 8`,
      [product.category_id, product.id]
    );

    res.json({ data: product, related: rel.rows });
  } catch (e) { next(e); }
});



catalog.get('/api/products/slug/:slug', async (req, res, next) => {
  try {
    const slug = req.params.slug;

    const { rows } = await pool.query(
      `SELECT p.id, p.title, p.slug, p.description, p.price_cents, p.currency,
              p.rating, p.thumbnail, p.category_id, p.created_at,
              c.slug  AS category_slug,
              c.name  AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1
       LIMIT 1`,
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: { code: 404, message: 'Product not found' } });
    }
    const product = rows[0];

    const rel = await pool.query(
      `SELECT id, title, slug, price_cents, currency, rating, thumbnail
       FROM products
       WHERE category_id = $1 AND id <> $2
       ORDER BY rating DESC NULLS LAST, created_at DESC
       LIMIT 8`,
      [product.category_id, product.id]
    );

    res.json({ data: product, related: rel.rows });
  } catch (e) { next(e); }
});


catalog.get('/api/products/:id/reviews', async (req, res, next) => {
  const productId = Number(req.params.id) || 0;

  try {
    const statsRes = await pool.query(
      `
      SELECT
        COALESCE(AVG(r.rating),0) AS avg_rating,
        COUNT(*)::int            AS reviews_count
      FROM reviews r
      WHERE r.product_id = $1;
      `,
      [productId]
    );

    const stats = statsRes.rows[0] || {
      avg_rating: 0,
      reviews_count: 0,
    };

    const rowsRes = await pool.query(
      `
      SELECT
        r.id              AS review_id,
        r.user_id         AS user_id,
        r.rating,
        r.created_at      AS review_created,
        u.first_name,
        u.last_name,
        c.id              AS comment_id,
        c.comment,
        c.created_at      AS comment_created
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      LEFT JOIN review_comments c ON c.review_id = r.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC, c.created_at ASC;
      `,
      [productId]
    );

    const map = new Map();

    for (const row of rowsRes.rows) {
      if (!map.has(row.review_id)) {
        map.set(row.review_id, {
          id: row.review_id,
          user_id: row.user_id,
          user_name: `${row.first_name} ${row.last_name}`,
          rating: row.rating,
          created_at: row.review_created,
          comments: [],
        });
      }

      if (row.comment_id) {
        map.get(row.review_id).comments.push({
          id: row.comment_id,
          comment: row.comment,
          created_at: row.comment_created,
        });
      }
    }

    res.json({
      averageRating: Number(stats.avg_rating || 0),
      count: stats.reviews_count || 0,
      stats,
      reviews: Array.from(map.values()),
    });
  } catch (err) {
    next(err);
  }
});

catalog.post(
  '/api/products/:id/reviews',
  requireAuth,
  async (req, res, next) => {
    const userId = req.user.id;
    const productId = Number(req.params.id) || 0;
    let { rating, comment } = req.body || {};

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query(
        `
        SELECT id, rating
        FROM reviews
        WHERE user_id = $1 AND product_id = $2
        `,
        [userId, productId]
      );
      const existing = existingRes.rows[0];

      let review;

      if (!existing) {
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          await client.query('ROLLBACK');
          return res.status(400).json({
            error: {
              code: 400,
              message: 'Rating 1-5 is required for first review.',
            },
          });
        }

        const reviewRes = await client.query(
          `
          INSERT INTO reviews(user_id, product_id, rating)
          VALUES ($1,$2,$3)
          RETURNING id, user_id, product_id, rating, created_at, updated_at;
          `,
          [userId, productId, rating]
        );
        review = reviewRes.rows[0];
      } else {
       
        let newRating = existing.rating;

        if (rating !== undefined && rating !== null) {
          if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            await client.query('ROLLBACK');
            return res.status(400).json({
              error: { code: 400, message: 'Invalid rating value.' },
            });
          }
          newRating = rating;
        }

        const reviewRes = await client.query(
          `
          UPDATE reviews
          SET rating = $1, updated_at = now()
          WHERE id = $2
          RETURNING id, user_id, product_id, rating, created_at, updated_at;
          `,
          [newRating, existing.id]
        );
        review = reviewRes.rows[0];
      }

      let commentRow = null;
      if (comment && String(comment).trim()) {
        const commentRes = await client.query(
          `
          INSERT INTO review_comments(review_id, user_id, comment)
          VALUES ($1,$2,$3)
          RETURNING id, comment, created_at;
          `,
          [review.id, userId, String(comment).trim()]
        );
        commentRow = commentRes.rows[0];
      }

      const statsRes = await client.query(
        `
        SELECT
          COALESCE(AVG(r.rating), 0) AS avg_rating,
          COUNT(*)::int              AS reviews_count
        FROM reviews r
        WHERE r.product_id = $1;
        `,
        [productId]
      );

      const averageRating = Number(statsRes.rows[0]?.avg_rating || 0);
      const count = Number(statsRes.rows[0]?.reviews_count || 0);

      await client.query(
        `
        UPDATE products
        SET rating = $1
        WHERE id = $2;
        `,
        [averageRating, productId]
      );

      await client.query('COMMIT');

      res.json({
        review,
        comment: commentRow,
        averageRating,
        count,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  }
);



catalog.get('/api/search', async (req, res, next) => {
  try {
    const rawQ = (req.query.q || '').trim();

    if (!rawQ) {
      return res.json({ query: '', results: [] });
    }

    const { rows } = await pool.query(
      `
      SELECT
        p.id,
        p.title,
        p.slug,
        p.price_cents,
        p.currency,
        p.thumbnail,
        p.rating,
        ts_rank_cd(
          p.search_vector,
          websearch_to_tsquery('english', $1)
        ) AS rank
      FROM products p
      WHERE p.search_vector @@ websearch_to_tsquery('english', $1)
      ORDER BY rank DESC, p.created_at DESC
      LIMIT 50;
      `,
      [rawQ]
    );

    res.json({
      query: rawQ,
      results: rows,
    });
  } catch (err) {
    next(err);
  }
});