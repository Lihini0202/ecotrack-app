const request = require('supertest');

const app = require('../../app');
const User = require('../../models/User');
const Goal = require('../../models/Goal');
const db = require('../setup/db');
const { registerUser } = require('../setup/factories');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

const logActivity = (token) =>
  request(app)
    .post('/api/goals')
    .set('x-auth-token', token)
    .send({ topic: 'Waste Reduction', action: 'Composted kitchen scraps' });

describe('GET /api/profile/:userId', () => {
  it('returns the caller profile with related data and no password', async () => {
    const { token, user } = await registerUser();
    await logActivity(token);

    const res = await request(app)
      .get(`/api/profile/${user.id}`)
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({
      _id: user.id,
      email: 'ada@example.com'
    });
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.goals).toHaveLength(1);
    expect(res.body.quizScores).toEqual([]);
    expect(res.body.activity.activities).toHaveLength(1);
  });

  it('requires a token', async () => {
    const { user } = await registerUser();

    const res = await request(app).get(`/api/profile/${user.id}`);

    expect(res.status).toBe(401);
  });

  it('refuses to return another user profile', async () => {
    const alice = await registerUser({ email: 'alice@example.com' });
    const bob = await registerUser({ email: 'bob@example.com' });

    const res = await request(app)
      .get(`/api/profile/${alice.user.id}`)
      .set('x-auth-token', bob.token);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Forbidden' });
  });
});

describe('PUT /api/profile/:userId', () => {
  it('updates the allowed fields and returns the new document', async () => {
    const { token, user } = await registerUser();

    const res = await request(app)
      .put(`/api/profile/${user.id}`)
      .set('x-auth-token', token)
      .send({
        firstName: 'Augusta',
        lastName: 'King',
        phone: '0771234567',
        address: '12 Marylebone'
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      firstName: 'Augusta',
      lastName: 'King',
      phone: '0771234567',
      address: '12 Marylebone'
    });
    expect(res.body).not.toHaveProperty('password');
  });

  it('ignores fields outside the allow-list', async () => {
    const { token, user } = await registerUser();

    const res = await request(app)
      .put(`/api/profile/${user.id}`)
      .set('x-auth-token', token)
      .send({
        firstName: 'Augusta',
        ecoPoints: 999999,
        email: 'attacker@example.com',
        password: 'plaintext-injection'
      });

    expect(res.status).toBe(200);

    const stored = await User.findById(user.id);
    expect(stored.firstName).toBe('Augusta');
    expect(stored.ecoPoints).toBe(0);
    expect(stored.email).toBe('ada@example.com');
    // The password must still be the original bcrypt hash, not the
    // attacker-supplied string. findByIdAndUpdate skips the pre-save hook,
    // so an unfiltered update would have stored this in plaintext.
    expect(stored.password).not.toBe('plaintext-injection');
    await expect(stored.comparePassword('sup3rsecret')).resolves.toBe(true);
  });

  it('rejects a body with nothing updatable in it', async () => {
    const { token, user } = await registerUser();

    const res = await request(app)
      .put(`/api/profile/${user.id}`)
      .set('x-auth-token', token)
      .send({ ecoPoints: 999999 });

    expect(res.status).toBe(400);
  });

  it('requires a token', async () => {
    const { user } = await registerUser();

    const res = await request(app)
      .put(`/api/profile/${user.id}`)
      .send({ firstName: 'Nope' });

    expect(res.status).toBe(401);
    expect((await User.findById(user.id)).firstName).toBe('Ada');
  });

  it('refuses to update another user', async () => {
    const alice = await registerUser({ email: 'alice@example.com' });
    const bob = await registerUser({ email: 'bob@example.com' });

    const res = await request(app)
      .put(`/api/profile/${alice.user.id}`)
      .set('x-auth-token', bob.token)
      .send({ firstName: 'Hacked' });

    expect(res.status).toBe(403);
    expect((await User.findById(alice.user.id)).firstName).toBe('Ada');
  });
});

describe('DELETE /api/profile/:userId', () => {
  it('deletes the caller and their related data', async () => {
    const { token, user } = await registerUser();
    await logActivity(token);

    const res = await request(app)
      .delete(`/api/profile/${user.id}`)
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'User and related data deleted' });
    expect(await User.findById(user.id)).toBeNull();
    expect(await Goal.countDocuments({ userId: user.id })).toBe(0);
  });

  it('requires a token', async () => {
    const { user } = await registerUser();

    const res = await request(app).delete(`/api/profile/${user.id}`);

    expect(res.status).toBe(401);
    expect(await User.findById(user.id)).not.toBeNull();
  });

  it('refuses to delete another user', async () => {
    const alice = await registerUser({ email: 'alice@example.com' });
    const bob = await registerUser({ email: 'bob@example.com' });

    const res = await request(app)
      .delete(`/api/profile/${alice.user.id}`)
      .set('x-auth-token', bob.token);

    expect(res.status).toBe(403);
    expect(await User.findById(alice.user.id)).not.toBeNull();
  });
});
