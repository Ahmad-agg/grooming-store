import request from 'supertest';
import app from '../server.js';
import { describe, test, expect } from '@jest/globals';

describe('Home API', () => {
  test('GET /api/home should return featured products, categories and stats', async () => {
    const res = await request(app)
      .get('/api/home')
      .expect(200);

    expect(res.body).toHaveProperty('featuredProducts');
    expect(res.body).toHaveProperty('categories');
    expect(res.body).toHaveProperty('stats');

    expect(Array.isArray(res.body.featuredProducts)).toBe(true);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(typeof res.body.stats).toBe('object');

    const stats = res.body.stats || {};
    if (stats.product_count !== undefined) {
      expect(typeof stats.product_count).toBe('number');
    }
    if (stats.category_count !== undefined) {
      expect(typeof stats.category_count).toBe('number');
    }
  });
});