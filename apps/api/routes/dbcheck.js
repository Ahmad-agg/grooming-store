import { Router } from 'express';
import { pool } from '../db/db.js';

export const dbcheck = Router();

dbcheck.get('/dbcheck', async (req, res, next) => {
  try {
    const r = await pool.query('SELECT 1 AS ok');
    res.json({ db: 'ok', result: r.rows[0] });
  } catch (e) {
    next(e);
  }
});
