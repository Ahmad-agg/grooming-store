import request from 'supertest';
import app from '../server.js';
import { describe, test, expect } from '@jest/globals';

describe('Catalog API', () => {
  test('GET /api/categories should return an array of categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);

    if (res.body.data.length > 0) {
      const c = res.body.data[0];
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('slug');
      expect(c).toHaveProperty('name');
    }
  });

  test('GET /api/products should return products list with pagination', async () => {
    const res = await request(app)
      .get('/api/products?page=1&limit=4')
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);

    const pg = res.body.pagination || {};
    expect(typeof pg.page).toBe('number');
    expect(typeof pg.limit).toBe('number');
    expect(typeof pg.total).toBe('number');
    if (pg.hasMore !== undefined) {
      expect(typeof pg.hasMore).toBe('boolean');
    }

    if (res.body.data.length > 0) {
      const p = res.body.data[0];
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('title');
      expect(p).toHaveProperty('slug');
      expect(p).toHaveProperty('price_cents');
      expect(p).toHaveProperty('currency');
    }
  });
});