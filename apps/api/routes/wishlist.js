import { Router } from 'express';
import { pool } from '../db/db.js';
import { requireAuth } from '../middleware/authz.js';

export const wishlist = Router();


wishlist.get('/api/wishlist', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const q = `
      SELECT
        p.id, p.title, p.slug, p.thumbnail,
        p.price_cents, p.currency,
        p.rating
      FROM wishlists w
      JOIN products p ON p.id = w.product_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;
    const { rows } = await pool.query(q, [userId]);

    res.json({ items: rows, count: rows.length });
  } catch (e) {
    next(e);
  }
});


wishlist.post('/api/wishlist/:productId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'Invalid productId' } });
    }

    const exists = await pool.query('SELECT 1 FROM products WHERE id=$1', [productId]);
    if (!exists.rowCount) {
      return res.status(404).json({ error: { code: 404, message: 'Product not found' } });
    }

    const toggleQ = `
      WITH ins AS (
        INSERT INTO wishlists(user_id, product_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING 1
      )
      SELECT
        CASE WHEN EXISTS (SELECT 1 FROM ins)
        THEN 'added'
        ELSE 'removed'
        END AS status
    `;
    const { rows } = await pool.query(toggleQ, [userId, productId]);
    const status = rows?.[0]?.status;

    if (status === 'removed') {
      await pool.query('DELETE FROM wishlists WHERE user_id=$1 AND product_id=$2', [userId, productId]);
    }

    res.json({ ok: true, status, product_id: productId });
  } catch (e) {
    next(e);
  }
});


wishlist.delete('/api/wishlist/:productId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'Invalid productId' } });
    }

    await pool.query('DELETE FROM wishlists WHERE user_id=$1 AND product_id=$2', [userId, productId]);
    res.json({ ok: true, status: 'removed', product_id: productId });
  } catch (e) {
    next(e);
  }
});
