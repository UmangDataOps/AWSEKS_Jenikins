const request = require('supertest');
const app = require('./app');

describe('DevOps API Tests', () => {
  
  describe('Health Check Endpoint', () => {
    test('GET /health should return 200 with health status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });

    test('Health response should contain environment info', async () => {
      const res = await request(app).get('/health');
      expect(res.body).toHaveProperty('environment');
    });
  });

  describe('Main API Endpoint', () => {
    test('GET /api should return 200 with API info', async () => {
      const res = await request(app).get('/api');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Welcome to DevOps API');
      expect(res.body).toHaveProperty('version', '1.0.0');
    });

    test('API response should list available endpoints', async () => {
      const res = await request(app).get('/api');
      expect(res.body.endpoints).toHaveProperty('health');
      expect(res.body.endpoints).toHaveProperty('api');
      expect(res.body.endpoints).toHaveProperty('users');
    });
  });

  describe('Users Endpoint', () => {
    test('GET /api/users should return users list', async () => {
      const res = await request(app).get('/api/users');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.count).toBe(3);
    });

    test('Each user object should have required fields', async () => {
      const res = await request(app).get('/api/users');
      const user = res.body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
    });
  });

  describe('Response Headers', () => {
    test('Responses should include Content-Type', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['content-type']).toMatch(/json/);
    });
  });
});
