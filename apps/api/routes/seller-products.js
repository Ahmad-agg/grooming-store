import express from 'express';
import { pool } from '../db/db.js';
import { requireAuth, requireRole } from '../middleware/authz.js';

export const sellerProducts = express.Router();

sellerProducts.use(requireAuth, requireRole('seller', 'admin'));

function slugify(title = '') {
  return title
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  
    .replace(/(^-|-$)+/g, '');    
}


sellerProducts.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.*,
        COALESCE(SUM(oi.qty), 0) AS sales_count
      FROM products AS p
      LEFT JOIN order_items AS oi
        ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY p.id DESC
      `
    );

    res.json({ products: result.rows });
  } catch (err) {
    next(err);
  }
});



sellerProducts.post(
  '/',
  async (req, res, next) => {
    try {
      const { title, price_cents, stock_qty, thumbnail } = req.body || {};

      if (!title || !price_cents) {
        return res.status(400).json({
          error: { code: 400, message: 'Title and price_cents are required.' },
        });
      }

      const slug = slugify(title);

      const result = await pool.query(
        `
        INSERT INTO products
          (title, slug, price_cents, currency, status, stock_qty, thumbnail)
        VALUES
          ($1,   $2,   $3,          $4,       $5,     $6,         $7)
        RETURNING *
        `,
        [
          title,
          slug,
          Number(price_cents),
          'USD',           
          'IN_STOCK',     
          Number(stock_qty || 0),
          thumbnail || null,
        ]
      );

      res.status(201).json({ product: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

sellerProducts.patch('/:id',
  async (req, res, next) => {
    try {
      const id = Number(req.params.id) || 0;
      const { title, price_cents, stock_qty, thumbnail } = req.body || {};

      const newSlug = title ? slugify(title) : null;

      const result = await pool.query(
        `
        UPDATE products
        SET
          title       = COALESCE($1, title),
          slug        = COALESCE($2, slug),
          price_cents = COALESCE($3, price_cents),
          stock_qty   = COALESCE($4, stock_qty),
          thumbnail   = COALESCE($5, thumbnail)
        WHERE id = $6
        RETURNING *
        `,
        [
          title ?? null,
          newSlug, 
          price_cents ?? null,
          stock_qty ?? null,
          thumbnail ?? null,
          id,
        ]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: { code: 404, message: 'Product not found' },
        });
      }

      res.json({ product: result.rows[0] });
    } catch (err) {
      next(err);
    }
  }
);


sellerProducts.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id) || 0;

    const ref = await pool.query(
      'SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1',
      [id]
    );

    if (ref.rowCount > 0) {
      return res.status(409).json({
        error: {
          code: 409,
          message:
            'Cannot delete this product because there are existing orders that include it. You can mark it as OUT_OF_STOCK or DISCONTINUED instead.',
        },
      });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});