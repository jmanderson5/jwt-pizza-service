
const request = require('supertest');

// Import the Express app using the same approach
// as your existing authRouter.test.js.
const app = require('../service');

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

