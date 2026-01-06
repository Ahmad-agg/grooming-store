import { Router } from 'express';
import { pool } from '../db/db.js';
import { requireAuth } from '../middleware/authz.js';

export const cart = Router();


async function ensureCart(userId) {
  await pool.query(
    `INSERT INTO carts(user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}


cart.get('/api/cart', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    await ensureCart(userId);

    const { rows } = await pool.query(
      `
      SELECT
        ci.product_id,
        ci.qty,
        p.title,
        p.slug,
        p.thumbnail,
        p.price_cents,
        p.currency,
        c.slug AS category_slug,
        c.name AS category_name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE ci.cart_id = $1
      ORDER BY p.title ASC
      `,
      [userId]
    );

    res.json({ data: rows });
  } catch (e) {
    next(e);
  }
});


cart.post('/api/cart/items', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id, qty } = req.body;

    const pid = Number(product_id);
    const q = Number(qty || 1);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'Invalid product_id' } });
    }
    if (!Number.isInteger(q) || q <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'qty must be a positive integer' } });
    }

    await ensureCart(userId);

    await pool.query(
      `
      INSERT INTO cart_items(cart_id, product_id, qty)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty
      `,
      [userId, pid, q]
    );

    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});


cart.patch('/api/cart/items/:productId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pid = Number(req.params.productId);
    const q = Number(req.body.qty);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'Invalid productId' } });
    }
    if (!Number.isInteger(q) || q <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'qty must be >= 1' } });
    }

    const r = await pool.query(
      `UPDATE cart_items SET qty=$3 WHERE cart_id=$1 AND product_id=$2`,
      [userId, pid, q]
    );

    if (!r.rowCount) return res.status(404).json({ error: { code: 404, message: 'Item not found in cart' } });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});


cart.delete('/api/cart/items/:productId', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const pid = Number(req.params.productId);

    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ error: { code: 400, message: 'Invalid productId' } });
    }

    await pool.query(
      `DELETE FROM cart_items WHERE cart_id=$1 AND product_id=$2`,
      [userId, pid]
    );

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
