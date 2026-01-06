import request from 'supertest';
import app from '../server.js';
import { describe, test, expect } from '@jest/globals';

describe('Health endpoint', () => {
  test('GET /api/healthz should return ok:true with 200', async () => {
    const res = await request(app)
      .get('/api/healthz')
      .expect(200);

    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('string');
  });
});