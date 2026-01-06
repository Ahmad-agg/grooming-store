import express from 'express';
import { pool } from '../db/db.js';
import { requireAuth, requireRole } from '../middleware/authz.js';

export const sellerDashboard = express.Router();

sellerDashboard.use(requireAuth, requireRole('seller', 'admin'));


sellerDashboard.get('/metrics', async (req, res, next) => {
  try {
    const summaryResult = await pool.query(`
      SELECT
        COALESCE(SUM(total_cents), 0)      AS total_sales_cents,
        COUNT(*)::int                      AS orders_count,
        COUNT(DISTINCT user_id)::int       AS customers_count
      FROM orders;
    `);

    const productsResult = await pool.query(`
      SELECT COUNT(*)::int AS products_count
      FROM products;
    `);

    const monthlySalesResult = await pool.query(`
      SELECT
        date_trunc('month', created_at) AS month,
        SUM(total_cents)::bigint        AS total_cents
      FROM orders
      GROUP BY 1
      ORDER BY 1;
    `);

    const ordersTrendResult = await pool.query(`
      SELECT
        date_trunc('month', created_at) AS month,
        COUNT(*)::int                   AS order_count
      FROM orders
      GROUP BY 1
      ORDER BY 1;
    `);

    const categoryDistributionResult = await pool.query(`
      SELECT
        p.title                     AS label,
        SUM(oi.qty)::int            AS items_sold
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      GROUP BY p.id, p.title
      ORDER BY items_sold DESC;
    `);

    const ratingResult = await pool.query(`
      SELECT COALESCE(AVG(rating), 0) AS avg_rating
      FROM products
      WHERE rating IS NOT NULL;
    `);

    const s = summaryResult.rows[0] || {};
    const p = productsResult.rows[0] || {};
    const r = ratingResult.rows[0] || {};

    const totalSalesCents = Number(s.total_sales_cents || 0);
    const ordersCount     = Number(s.orders_count || 0);
    const customersCount  = Number(s.customers_count || 0);
    const productsCount   = Number(p.products_count || 0);
    const avgRating       = Number(r.avg_rating || 0);

    const avgOrderValueCents =
      ordersCount > 0 ? Math.round(totalSalesCents / ordersCount) : 0;

    const catRows = categoryDistributionResult.rows || [];
    const totalItems = catRows.reduce(
      (sum, row) => sum + Number(row.items_sold || 0),
      0
    );

    const categoryDistribution = catRows.map((row) => {
      const items = Number(row.items_sold || 0);
      const percentage =
        totalItems > 0 ? Math.round((items / totalItems) * 100) : 0;
      return {
        label: row.label,       
        items,                 
        percentage,           
      };
    });

    res.json({
      summary: {
        totalSalesCents,
        ordersCount,
        customersCount,
        productsCount,
      },
      charts: {
        monthlySales: monthlySalesResult.rows.map((row) => ({
          month: row.month,                 
          total_cents: Number(row.total_cents),
        })),
        ordersTrend: ordersTrendResult.rows.map((row) => ({
          month: row.month,
          order_count: Number(row.order_count),
        })),
        categoryDistribution,
      },
      customers: {
        totalCustomers: customersCount,
        avgRating,
        avgOrderValueCents,
      },
    });
  } catch (err) {
    next(err);
  }
});


sellerDashboard.get('/orders', async (req, res, next) => {
  try {
    const result = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.total_cents,
        o.status,
        o.created_at,
        u.first_name,
        u.last_name
      FROM orders AS o
      JOIN users  AS u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      LIMIT 20;
      `
    );

    res.json({
      orders: result.rows.map((row) => ({
        id: row.id,
        number: row.order_number,
        customer: `${row.first_name} ${row.last_name}`,
        amount_cents: row.total_cents,
        status: row.status,          
        created_at: row.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});


sellerDashboard.patch('/orders/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id) || 0;
    const { status } = req.body || {};

    const allowedStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: { code: 400, message: 'Invalid order status value.' },
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, order_number, total_cents, status;
      `,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: { code: 404, message: 'Order not found.' },
      });
    }

    const row = result.rows[0];
    res.json({
      order: {
        id: row.id,
        number: row.order_number,
        amount_cents: row.total_cents,
        status: row.status,
      },
    });
  } catch (err) {
    next(err);
  }
});