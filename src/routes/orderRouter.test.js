const request = require('supertest');
const app = require('../service');

describe('Pizza Order API Tests', () => {
  let token;

  beforeAll(async () => {
    const user = {
      name: 'Order Test User',
      email: `order${Date.now()}@example.com`,
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth')
      .send(user);

    expect(response.status).toBe(200);
    token = response.body.token;
  });

  test('GET /api/order/menu returns an array', async () => {
    const response = await request(app)
      .get('/api/order/menu');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/order returns user orders', async () => {
    const response = await request(app)
      .get('/api/order')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('orders');
    expect(Array.isArray(response.body.orders)).toBe(true);
  });

  test('GET /api/order rejects unauthenticated users', async () => {
    const response = await request(app)
      .get('/api/order');

    expect(response.status).toBe(401);
  });

  test('PUT /api/order/menu rejects non-admin users', async () => {
    const response = await request(app)
      .put('/api/order/menu')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Pizza',
        description: 'Testing',
        image: 'test.png',
        price: 0.01
      });

    expect(response.status).toBe(403);
  });
});
