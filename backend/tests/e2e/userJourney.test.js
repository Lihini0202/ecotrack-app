const request = require('supertest');

const app = require('../../app');
const db = require('../setup/db');
const { validUser } = require('../setup/factories');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

// Walks the path a real client takes: sign up, sign back in, log activities,
// then read the aggregates the dashboard renders.
describe('new user end-to-end journey', () => {
  it('carries a user from registration through to progress and profile', async () => {
    const credentials = validUser();

    const register = await request(app)
      .post('/api/auth/register')
      .send(credentials);
    expect(register.status).toBe(201);
    const userId = register.body.user.id;

    const login = await request(app).post('/api/auth/login').send({
      email: credentials.email,
      password: credentials.password
    });
    expect(login.status).toBe(200);
    const token = login.body.token;

    const me = await request(app).get('/api/auth/me').set('x-auth-token', token);
    expect(me.status).toBe(200);
    expect(me.body.ecoPoints).toBe(0);

    const activities = [
      { topic: 'Sustainable Travel', action: 'Took the bus instead of driving' },
      { topic: 'Waste Reduction', action: 'Refused single-use packaging' },
      { topic: 'Water Conservation', action: 'Fixed a dripping tap' }
    ];
    for (const activity of activities) {
      const logged = await request(app)
        .post('/api/goals')
        .set('x-auth-token', token)
        .send(activity);
      expect(logged.status).toBe(201);
    }

    const goals = await request(app).get('/api/goals').set('x-auth-token', token);
    expect(goals.status).toBe(200);
    expect(goals.body).toHaveLength(3);

    const progress = await request(app)
      .get('/api/goals/progress')
      .set('x-auth-token', token);
    expect(progress.status).toBe(200);
    expect(progress.body).toEqual({ progress: 10, monthlyGoal: 30 });

    const afterLogging = await request(app)
      .get('/api/auth/me')
      .set('x-auth-token', token);
    expect(afterLogging.body.ecoPoints).toBe(30);

    const profile = await request(app).get(`/api/profile/${userId}`);
    expect(profile.status).toBe(200);
    expect(profile.body.user.email).toBe(credentials.email);
    expect(profile.body.goals).toHaveLength(3);
    expect(profile.body.activity.activities).toHaveLength(3);
  });

  it('keeps two concurrent users completely separated', async () => {
    const alice = await request(app)
      .post('/api/auth/register')
      .send(validUser({ email: 'alice@example.com' }));
    const bob = await request(app)
      .post('/api/auth/register')
      .send(validUser({ email: 'bob@example.com', firstName: 'Bob' }));

    await request(app)
      .post('/api/goals')
      .set('x-auth-token', alice.body.token)
      .send({ topic: 'Sustainable Food', action: 'Grew herbs on the balcony' });

    const bobGoals = await request(app)
      .get('/api/goals')
      .set('x-auth-token', bob.body.token);
    expect(bobGoals.body).toEqual([]);

    const bobMe = await request(app)
      .get('/api/auth/me')
      .set('x-auth-token', bob.body.token);
    expect(bobMe.body.ecoPoints).toBe(0);

    const aliceMe = await request(app)
      .get('/api/auth/me')
      .set('x-auth-token', alice.body.token);
    expect(aliceMe.body.ecoPoints).toBe(10);
  });
});

describe('service endpoints', () => {
  it('serves the root banner', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('EcoTrack Backend is Running');
  });

  it('reports healthy while the database is connected', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'connected' });
  });

  it('counts requests on /metrics', async () => {
    const before = await request(app).get('/metrics');
    await request(app).get('/');
    const after = await request(app).get('/metrics');

    expect(after.body.requestCount).toBeGreaterThan(before.body.requestCount);
    expect(after.body.uptime).toBeGreaterThan(0);
  });

  it('returns the public educational tips without a token', async () => {
    const res = await request(app).get('/api/quiz/tips');

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
