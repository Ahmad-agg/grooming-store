import { Router } from 'express';
import { pool } from '../db/db.js';
import { setListCache } from '../middleware/cache-headers.js';

export const home = Router();



home.get('/api/home', async (_req, res, next) => {
  try {
    const featuredSql = `
      SELECT id, title, slug, price_cents, currency, rating, thumbnail, created_at
      FROM products
      WHERE is_featured = true
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const catsSql = `
      SELECT c.id, c.slug, c.name, c.hero_image, c.display_order,c.description,
             COALESCE(COUNT(p.id), 0)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.display_order, c.name
    `;

    const statsSql = `
      SELECT
        (SELECT COUNT(*)::int FROM products)   AS product_count,
        (SELECT COUNT(*)::int FROM categories) AS category_count
    `;

    const [featured, cats, stats] = await Promise.all([
      pool.query(featuredSql),
      pool.query(catsSql),
      pool.query(statsSql),
    ]);

    setListCache(res, 60);

    res.json({
      featuredProducts: featured.rows,
      categories: cats.rows,
      stats: stats.rows[0],
    });
  } catch (e) {
    next(e);
  }
});