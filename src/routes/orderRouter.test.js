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

    test('admin can add a pizza to the menu', async () => {
    const { DB, Role } = require('../database/database');

    const unique = `${Date.now()}${Math.random()
        .toString(36).slice(2)}`;

    const admin = {
        name: 'Menu Test Admin',
        email: `menu${unique}@example.com`,
        password: 'testpassword123',
        roles: [{ role: Role.Admin }]
    };

    // Create an administrator
    await DB.addUser(admin);

    // Log in as administrator
    const loginRes = await request(app)
        .put('/api/auth')
        .send({
        email: admin.email,
        password: admin.password
        });

    expect(loginRes.status).toBe(200);
    const adminToken = loginRes.body.token;

    const pizza = {
        title: `Test Pizza ${unique}`,
        description: 'Created by Jest',
        image: 'test.png',
        price: 0.01
    };

    // Add pizza to menu
    const addRes = await request(app)
        .put('/api/order/menu')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pizza);

    expect(addRes.status).toBe(200);
    expect(addRes.body).toEqual(
        expect.arrayContaining([
        expect.objectContaining({
            title: pizza.title,
            description: pizza.description
        })
        ])
    );

    // Verify the new pizza persisted in MySQL
    const menuRes = await request(app)
        .get('/api/order/menu');

    expect(menuRes.status).toBe(200);
    expect(menuRes.body.some(
        item => item.title === pizza.title
    )).toBe(true);
    });
    
});
