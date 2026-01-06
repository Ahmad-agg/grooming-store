import { Router } from 'express';
import { pool } from '../db/db.js';

export const about = Router();


about.get('/api/about', async (req, res, next) => {
  try {
    const [metrics, values, team] = await Promise.all([
      pool.query(
        'SELECT id, label, value FROM about_metrics ORDER BY sort_order, id'
      ),
      pool.query(
        'SELECT id, title, text FROM about_values ORDER BY sort_order, id'
      ),
      pool.query(
        'SELECT id, name, role, blurb, avatar_url FROM about_team ORDER BY sort_order, id'
      ),
    ]);

    res.json({
      data: {
        metrics: metrics.rows,
        values:  values.rows,
        team:    team.rows,
      }
    });
  } catch (e) { next(e); }
});

about.get('/api/about/metrics', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, label, value FROM about_metrics ORDER BY sort_order, id'
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
});

about.get('/api/about/values', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, text FROM about_values ORDER BY sort_order, id'
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
});

about.get('/api/about/team', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, role, blurb, avatar_url FROM about_team ORDER BY sort_order, id'
    );
    res.json({ data: rows });
  } catch (e) { next(e); }
});
