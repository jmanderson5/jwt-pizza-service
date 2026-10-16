
const request = require('supertest');

// Import the Express app using the same approach
// as your existing authRouter.test.js.
const app = require('../service');

const { DB, Role } = require('../database/database');
const { setAuth } = require('./authRouter');

describe('User API', () => {
  describe('GET /api/user', () => {

    test('list users unauthorized', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });

    test('diner cannot list users', async () => {
        const testUser = {
            name: 'regular diner',
            email: `diner${Date.now()}@test.com`,
            password: 'password123',
        };

        const registerRes = await request(app)
            .post('/api/auth')
            .send(testUser);

        expect(registerRes.status).toBe(200);

        const response = await request(app)
            .get('/api/user?page=1&limit=10')
            .set(
            'Authorization',
            `Bearer ${registerRes.body.token}`
            );

        expect(response.status).toBe(403);
    });

  });
});

test('database lists users', async () => {
  const { DB } = require('../database/database');

  const result = await DB.listUsers(1, 10, '');

  expect(Array.isArray(result.users)).toBe(true);
  expect(typeof result.more).toBe('boolean');

  for (const user of result.users) {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(Array.isArray(user.roles)).toBe(true);
    expect(user).not.toHaveProperty('password');
  }
});

test('admin can list and filter users', async () => {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;

  const admin = await DB.addUser({
    name: `Admin ${unique}`,
    email: `admin-${unique}@test.com`,
    password: 'test-password',
    roles: [{ role: Role.Admin }],
  });

  const token = await setAuth(admin);

  // Create two users with a shared searchable name
  const firstName = `Search${unique} Alpha`;
  const secondName = `Search${unique} Beta`;

  for (const name of [firstName, secondName]) {
    const response = await request(app)
      .post('/api/auth')
      .send({
        name,
        email: `${Math.random().toString(36).slice(2)}@test.com`,
        password: 'test-password',
      });

    expect(response.status).toBe(200);
  }

  const auth = { Authorization: `Bearer ${token}` };

  // Filter to our two new users
  const response = await request(app)
    .get(`/api/user?page=1&limit=10&name=Search${unique}`)
    .set(auth);

  expect(response.status).toBe(200);
  expect(response.body.users).toHaveLength(2);
  expect(response.body.more).toBe(false);

  for (const user of response.body.users) {
    expect(user.name).toContain(`Search${unique}`);
    expect(user).toHaveProperty('email');
    expect(Array.isArray(user.roles)).toBe(true);
    expect(user).not.toHaveProperty('password');
  }

  // Test first page
  const page1 = await request(app)
    .get(`/api/user?page=1&limit=1&name=Search${unique}`)
    .set(auth);

  expect(page1.status).toBe(200);
  expect(page1.body.users).toHaveLength(1);
  expect(page1.body.more).toBe(true);

  // Test second page
  const page2 = await request(app)
    .get(`/api/user?page=2&limit=1&name=Search${unique}`)
    .set(auth);

  expect(page2.status).toBe(200);
  expect(page2.body.users).toHaveLength(1);
  expect(page2.body.more).toBe(false);

  expect(page1.body.users[0].id)
    .not.toBe(page2.body.users[0].id);
});


