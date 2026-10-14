const request = require('supertest');
const app = require('../service');

describe('JWT Pizza API Tests', () => {

  test('GET /api/order/menu returns pizza menu', async () => {
    const response = await request(app)
      .get('/api/order/menu');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/order requires authentication', async () => {
    const response = await request(app)
      .get('/api/order');

    expect(response.status).toBe(401);
  });

  test('POST /api/auth requires all user fields', async () => {
    const response = await request(app)
      .post('/api/auth')
      .send({
        email: 'test@example.com'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      'name, email, and password are required'
    );
  });

});
