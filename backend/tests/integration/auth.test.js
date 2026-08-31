const request = require('supertest');
const jwt = require('jsonwebtoken');

const app = require('../../app');
const User = require('../../models/User');
const db = require('../setup/db');
const { validUser, registerUser } = require('../setup/factories');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

describe('POST /api/auth/register', () => {
  it('creates a user and returns a signed token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser());

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        ecoPoints: 0
      }
    });

    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
    expect(decoded.userId).toBe(res.body.user.id);
  });

  it('never returns the password in the response body', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser());

    expect(res.body.user).not.toHaveProperty('password');
    expect(JSON.stringify(res.body)).not.toContain('sup3rsecret');
  });

  it('stores the password as a bcrypt hash, not plaintext', async () => {
    await request(app).post('/api/auth/register').send(validUser());

    const stored = await User.findOne({ email: 'ada@example.com' });
    expect(stored.password).not.toBe('sup3rsecret');
    expect(stored.password).toMatch(/^\$2[aby]\$/);
    await expect(stored.comparePassword('sup3rsecret')).resolves.toBe(true);
  });

  it('lowercases the email before storing it', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser({ email: 'Ada@Example.COM' }));

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('ada@example.com');
  });

  // The schema declares `trim: true`, but express-validator's isEmail() runs
  // against the raw body before mongoose sees it, so surrounding whitespace
  // is rejected at validation rather than trimmed.
  it('rejects an email padded with whitespace', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser({ email: '  ada@example.com  ' }));

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Please include a valid email' })
      ])
    );
  });

  it.each([
    ['missing first name', { firstName: '' }, 'First name is required'],
    ['missing last name', { lastName: '' }, 'Last name is required'],
    ['malformed email', { email: 'not-an-email' }, 'Please include a valid email'],
    ['short password', { password: '12345' }, 'Please enter a password with 6 or more characters']
  ])('rejects a %s with 400 and a field error', async (_label, override, message) => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser(override));

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ msg: message })])
    );
  });

  it('rejects a duplicate email with 400', async () => {
    await registerUser();
    const res = await request(app).post('/api/auth/register').send(validUser());

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'User already exists' });
    expect(await User.countDocuments()).toBe(1);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token and the user for correct credentials', async () => {
    const { payload } = await registerUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      token: expect.any(String),
      user: {
        id: expect.any(String),
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        ecoPoints: 0
      }
    });
  });

  it('rejects a wrong password with 400 and a generic message', async () => {
    const { payload } = await registerUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: 'wrong-password' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('does not reveal whether an unknown email exists', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'sup3rsecret' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('matches the stored account regardless of email casing', async () => {
    await registerUser();

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADA@EXAMPLE.COM', password: 'sup3rsecret' });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('ada@example.com');
  });

  it('rejects a malformed email with a validation error', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'sup3rsecret' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: 'Please include a valid email' })
      ])
    );
  });
});

describe('GET /api/auth/me', () => {
  it('returns the authenticated user without the password field', async () => {
    const { token, user } = await registerUser();

    const res = await request(app).get('/api/auth/me').set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(user.id);
    expect(res.body.email).toBe('ada@example.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('rejects a request with no token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'No token, authorization denied' });
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ userId: '507f1f77bcf86cd799439011' }, 'wrong-secret');

    const res = await request(app).get('/api/auth/me').set('x-auth-token', forged);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Token is not valid' });
  });

  it('rejects an expired token', async () => {
    const { user } = await registerUser();
    const expired = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '-1s'
    });

    const res = await request(app).get('/api/auth/me').set('x-auth-token', expired);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Token is not valid' });
  });
});
