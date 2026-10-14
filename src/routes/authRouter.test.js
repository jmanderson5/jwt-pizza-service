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

    const testUser = {
    name: 'Test Diner',
    email: `test${Date.now()}${Math.random()
        .toString(36).slice(2)}@example.com`,
    password: 'password123'
    };

    let authToken;

    test('POST /api/auth registers a new user', async () => {
    const response = await request(app)
        .post('/api/auth')
        .send(testUser);

        if (response.status !== 200) {
            console.error('Regtistration error: ', response.body);
        }

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.token).toBeDefined();

    authToken = response.body.token;
    });

    test('PUT /api/auth logs in a user', async () => {
    const response = await request(app)
        .put('/api/auth')
        .send({
        email: testUser.email,
        password: testUser.password
        });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    });

    test('PUT /api/auth rejects invalid credentials', async () => {
    const response = await request(app)
        .put('/api/auth')
        .send({
        email: testUser.email,
        password: 'wrongpassword'
        });

    expect(response.status).toBe(404);
    });

    test('DELETE /api/auth logs out a user', async () => {
    const response = await request(app)
        .delete('/api/auth')
        .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('logout successful');
    });

});
