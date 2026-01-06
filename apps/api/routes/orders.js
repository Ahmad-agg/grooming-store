import express from 'express';
import { pool } from '../db/db.js';
import { requireAuth } from '../middleware/authz.js';

export const orders = express.Router();

orders.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.total_cents,
        o.currency,
        o.payment_method,
        o.payment_status,
        o.status,          
        o.created_at
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT 50
      `,
      [userId]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    next(err);
  }
});


orders.get('/:id', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.id) || 0;

    const orderRes = await client.query(
      `
      SELECT
        o.*,
        a.first_name,
        a.last_name,
        a.email   AS shipping_email,
        a.phone,
        a.line1,
        a.city,
        a.zip
      FROM orders o
      LEFT JOIN addresses a ON a.id = o.address_id
      WHERE o.id = $1 AND o.user_id = $2
      `,
      [orderId, userId]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ error: { code: 404, message: 'Order not found' } });
    }

    const order = orderRes.rows[0];

    const itemsRes = await client.query(
      `
      SELECT
        oi.product_id,
        oi.title,
        oi.price_cents,
        oi.qty,
        oi.subtotal_cents
      FROM order_items oi
      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
      `,
      [orderId]
    );

    const paymentsRes = await client.query(
      `
      SELECT
        provider,
        provider_payment_id,
        amount_cents,
        currency,
        status,
        created_at
      FROM payments
      WHERE order_id = $1
      ORDER BY created_at DESC
      `,
      [orderId]
    );

    res.json({
      order,
      items: itemsRes.rows,
      payments: paymentsRes.rows,
    });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
});