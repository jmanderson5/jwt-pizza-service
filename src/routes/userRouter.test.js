
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

  });
});
