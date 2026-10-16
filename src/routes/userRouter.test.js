
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

    test('authenticated user can list users', async () => {
        const testUser = {
            name: 'list user tester',
            email: `list${Date.now()}@test.com`,
            password: 'password123',
        };

        // Register a user
        const registerRes = await request(app)
            .post('/api/auth')
            .send(testUser);

        expect(registerRes.status).toBe(200);

        const token = registerRes.body.token;

        // Request the users list
        const response = await request(app)
            .get('/api/user?page=1&limit=10')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.users)).toBe(true);
        expect(typeof response.body.more).toBe('boolean');
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
