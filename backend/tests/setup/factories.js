const request = require('supertest');
const app = require('../../app');

const validUser = (overrides = {}) => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  password: 'sup3rsecret',
  ...overrides
});

// Registers a user through the real HTTP route and returns the issued token
// alongside the serialised user, so tests exercise auth the way a client does.
async function registerUser(overrides = {}) {
  const payload = validUser(overrides);
  const res = await request(app).post('/api/auth/register').send(payload);
  return { token: res.body.token, user: res.body.user, payload, res };
}

module.exports = { validUser, registerUser };
