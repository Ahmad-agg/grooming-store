import express from 'express';
import { pool } from '../db/db.js';
import { requireAuth } from '../middleware/authz.js';

export const checkout = express.Router();

function generateOrderNumber() {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${rand}`;
}

checkout.post('/', requireAuth, async (req, res, next) => {
  const client = await pool.connect();

  try {
    const userId = req.user.id;

    const {
      shipping,            
      payment_method,       
      payment_status,      
      stripe_payment_intent_id,
    } = req.body || {};

    if (
      !shipping ||
      !shipping.first_name ||
      !shipping.last_name ||
      !shipping.email ||
      !shipping.line1 ||
      !shipping.city
    ) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Missing shipping information',
        },
      });
    }

    const cartRes = await client.query(
      `
      SELECT
      ci.product_id,
      ci.qty,
      p.title,
      p.price_cents,
      p.currency
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id =$1
      `,
      [userId]
    );

    const items = cartRes.rows;

    if (items.length === 0) {
      return res.status(400).json({
        error: { code: 400, message: 'Cart is empty' },
      });
    }

    const currency = items[0].currency || 'USD';
    const subtotal = items.reduce(
      (acc, it) => acc + (it.price_cents || 0) * (it.qty || 0),
      0
    );
    const shipping_cents = 0;                  
    const tax_cents = Math.round(subtotal * 0.08); 
    const total_cents = subtotal + shipping_cents + tax_cents;

    await client.query('BEGIN');

    const addrRes = await client.query(
      `
      INSERT INTO addresses
        (user_id, first_name, last_name, email, phone, line1, city, zip)
      VALUES
        ($1,     $2,         $3,        $4,    $5,   $6,   $7,  $8)
      RETURNING id
      `,
      [
        userId,
        shipping.first_name,
        shipping.last_name,
        shipping.email,
        shipping.phone || null,
        shipping.line1,
        shipping.city,
        shipping.zip || null,
      ]
    );
    const addressId = addrRes.rows[0].id;

    const orderNumber = generateOrderNumber();
    const orderRes = await client.query(
      `
      INSERT INTO orders
        (user_id,
         order_number,
         address_id,
         subtotal_cents,
         shipping_cents,
         tax_cents,
         total_cents,
         currency,
         payment_method,
         payment_status)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        userId,
        orderNumber,
        addressId,
        subtotal,
        shipping_cents,
        tax_cents,
        total_cents,
        currency,
        payment_method || 'COD',
        payment_status || 'pending',
      ]
    );
    const order = orderRes.rows[0];

    const insertItemsSql = `
      INSERT INTO order_items
        (order_id, product_id, title, price_cents, qty, subtotal_cents)
      VALUES
        ($1,       $2,         $3,    $4,          $5,  $6)
    `;

    for (const it of items) {
      const rowSubtotal = (it.price_cents || 0) * (it.qty || 0);
      await client.query(insertItemsSql, [
        order.id,
        it.product_id,
        it.title,
        it.price_cents,
        it.qty,
        rowSubtotal,
      ]);
    }

    if (payment_method === 'CARD') {
      await client.query(
        `
        INSERT INTO payments
          (order_id,
           provider,
           provider_payment_id,
           amount_cents,
           currency,
           status)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        `,
        [
          order.id,
          'stripe',
          stripe_payment_intent_id || null,
          total_cents,
          currency,
          payment_status || 'pending',
        ]
      );
    }

    await client.query(
      `
        DELETE FROM cart_items
        WHERE cart_id = $1
      `,
      [userId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      order: {
        id: order.id,
        order_number: order.order_number,
        total_cents: order.total_cents,
        currency: order.currency,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
      },
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
    }
    next(err);
  } finally {
    client.release();
  }
});