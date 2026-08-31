const request = require('supertest');

const app = require('../../app');
const Goal = require('../../models/Goal');
const Activity = require('../../models/Activity');
const User = require('../../models/User');
const db = require('../setup/db');
const { registerUser } = require('../setup/factories');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

const logActivity = (token, body) =>
  request(app).post('/api/goals').set('x-auth-token', token).send(body);

const aValidActivity = {
  topic: 'Waste Reduction',
  action: 'Composted kitchen scraps'
};

describe('POST /api/goals', () => {
  it('creates a goal and returns it with the default point value', async () => {
    const { token, user } = await registerUser();

    const res = await logActivity(token, aValidActivity);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      _id: expect.any(String),
      userId: user.id,
      topic: 'Waste Reduction',
      action: 'Composted kitchen scraps',
      pointsEarned: 10
    });
    expect(Date.parse(res.body.date)).not.toBeNaN();
  });

  it('mirrors the goal into the user activity document', async () => {
    const { token, user } = await registerUser();

    await logActivity(token, aValidActivity);

    const activity = await Activity.findOne({ userId: user.id });
    expect(activity.activities).toHaveLength(1);
    expect(activity.activities[0]).toMatchObject({
      topic: 'Waste Reduction',
      action: 'Composted kitchen scraps'
    });
    expect(activity.monthlyGoal).toBe(30);
  });

  it('appends to the existing activity document rather than creating a second', async () => {
    const { token, user } = await registerUser();

    await logActivity(token, aValidActivity);
    await logActivity(token, { topic: 'Energy Conservation', action: 'Line-dried laundry' });

    expect(await Activity.countDocuments({ userId: user.id })).toBe(1);
    const activity = await Activity.findOne({ userId: user.id });
    expect(activity.activities).toHaveLength(2);
  });

  it('awards the user 10 eco points per logged activity', async () => {
    const { token, user } = await registerUser();

    await logActivity(token, aValidActivity);
    await logActivity(token, { topic: 'Sustainable Food', action: 'Ate a plant-based meal' });

    const stored = await User.findById(user.id);
    expect(stored.ecoPoints).toBe(20);
  });

  it('rejects a topic outside the allowed enum with 400', async () => {
    const { token } = await registerUser();

    const res = await logActivity(token, { topic: 'Cryptomining', action: 'Nope' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(await Goal.countDocuments()).toBe(0);
  });

  it('rejects a goal with no action with 400', async () => {
    const { token } = await registerUser();

    const res = await logActivity(token, { topic: 'Water Conservation' });

    expect(res.status).toBe(400);
    expect(await Goal.countDocuments()).toBe(0);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/goals').send(aValidActivity);

    expect(res.status).toBe(401);
    expect(await Goal.countDocuments()).toBe(0);
  });
});

describe('GET /api/goals', () => {
  it('returns an empty array for a user with no goals', async () => {
    const { token } = await registerUser();

    const res = await request(app).get('/api/goals').set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns the caller goals newest first', async () => {
    const { token } = await registerUser();
    await logActivity(token, { topic: 'Waste Reduction', action: 'first' });
    await logActivity(token, { topic: 'Waste Reduction', action: 'second' });

    const res = await request(app).get('/api/goals').set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const dates = res.body.map((goal) => Date.parse(goal.date));
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
  });

  it('does not leak goals belonging to another user', async () => {
    const alice = await registerUser({ email: 'alice@example.com' });
    const bob = await registerUser({ email: 'bob@example.com' });
    await logActivity(alice.token, { topic: 'Waste Reduction', action: 'alice only' });

    const res = await request(app).get('/api/goals').set('x-auth-token', bob.token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/goals/activities', () => {
  it('returns an empty default shape before anything is logged', async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .get('/api/goals/activities')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ activities: [], monthlyGoal: 30 });
  });

  it('returns the stored activities once logged', async () => {
    const { token, user } = await registerUser();
    await logActivity(token, aValidActivity);

    const res = await request(app)
      .get('/api/goals/activities')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(user.id);
    expect(res.body.monthlyGoal).toBe(30);
    expect(res.body.activities).toHaveLength(1);
    expect(res.body.activities[0]).toMatchObject({
      topic: 'Waste Reduction',
      action: 'Composted kitchen scraps'
    });
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/goals/activities');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/goals/progress', () => {
  it('reports zero progress before anything is logged', async () => {
    const { token } = await registerUser();

    const res = await request(app)
      .get('/api/goals/progress')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ progress: 0, monthlyGoal: 30 });
  });

  it('reports progress as a percentage of the monthly goal', async () => {
    const { token } = await registerUser();
    await logActivity(token, aValidActivity);
    await logActivity(token, { topic: 'Sustainable Travel', action: 'Cycled to work' });
    await logActivity(token, { topic: 'Energy Conservation', action: 'Unplugged idle devices' });

    const res = await request(app)
      .get('/api/goals/progress')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body.monthlyGoal).toBe(30);
    expect(res.body.progress).toBeCloseTo(10, 5);
  });

  it('caps progress at 100 percent once the goal is exceeded', async () => {
    const { token, user } = await registerUser();
    await Activity.create({
      userId: user.id,
      monthlyGoal: 2,
      activities: [
        { topic: 'Waste Reduction', action: 'a', date: new Date() },
        { topic: 'Waste Reduction', action: 'b', date: new Date() },
        { topic: 'Waste Reduction', action: 'c', date: new Date() }
      ]
    });

    const res = await request(app)
      .get('/api/goals/progress')
      .set('x-auth-token', token);

    expect(res.status).toBe(200);
    expect(res.body.progress).toBe(100);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/goals/progress');
    expect(res.status).toBe(401);
  });
});
