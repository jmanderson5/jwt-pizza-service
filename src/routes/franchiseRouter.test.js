
const request = require('supertest');
const app = require('../service');
const { DB, Role } = require('../database/database');

describe('Franchise API Tests', () => {
  let adminToken;
  let franchiseId;

  const unique = `${Date.now()}${Math.random()
    .toString(36).slice(2)}`;

  const admin = {
    name: 'Franchise Test Admin',
    email: `admin${unique}@example.com`,
    password: 'testpassword123',
    roles: [{ role: Role.Admin }]
  };

  beforeAll(async () => {
    // Create an administrator in the test database.
    await DB.addUser(admin);

    const response = await request(app)
      .put('/api/auth')
      .send({
        email: admin.email,
        password: admin.password
      });

    expect(response.status).toBe(200);
    adminToken = response.body.token;
  });

  afterAll(async () => {
    // Remove the test franchise if a test left it behind.
    if (franchiseId) {
      await request(app)
        .delete(`/api/franchise/${franchiseId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });

  test('GET /api/franchise lists franchises', async () => {
    const response = await request(app)
      .get('/api/franchise');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.franchises))
      .toBe(true);
  });

  test('POST /api/franchise rejects unauthorized users', async () => {
    const response = await request(app)
      .post('/api/franchise')
      .send({
        name: 'Unauthorized Franchise',
        admins: []
      });

    expect(response.status).toBe(401);
  });

  test('admin can create, view, and delete a franchise and store', async () => {
    // Create franchise
    const createRes = await request(app)
      .post('/api/franchise')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `TestFranchise${unique}`,
        admins: [{ email: admin.email }]
      });

    expect(createRes.status).toBe(200);
    expect(createRes.body.id).toBeDefined();
    franchiseId = createRes.body.id;

    // Retrieve franchise
    const getRes = await request(app)
      .get(`/api/franchise/${createRes.body.admins[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.body)).toBe(true);

    // Create store
    const storeRes = await request(app)
      .post(`/api/franchise/${franchiseId}/store`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Store' });

    expect(storeRes.status).toBe(200);
    expect(storeRes.body.name).toBe('Test Store');

    // Delete store
    const deleteStoreRes = await request(app)
      .delete(
        `/api/franchise/${franchiseId}/store/${storeRes.body.id}`
      )
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteStoreRes.status).toBe(200);

    // Delete franchise
    const deleteRes = await request(app)
      .delete(`/api/franchise/${franchiseId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    franchiseId = null;
  });
});
