const quizController = require('../../controllers/quizController');

// getTips is the one handler that touches neither the database nor req, so it
// can be exercised as a plain function.
const callGetTips = async () => {
  const res = { json: jest.fn() };
  const next = jest.fn();
  await quizController.getTips({}, res, next);
  return { res, next, payload: res.json.mock.calls[0][0] };
};

describe('quizController.getTips', () => {
  it('responds with the static tip list and never calls next', async () => {
    const { res, next, payload } = await callGetTips();

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBeGreaterThan(0);
  });

  it('gives every tip an id, text and icon', async () => {
    const { payload } = await callGetTips();

    payload.forEach((tip) => {
      expect(tip).toEqual({
        id: expect.any(Number),
        text: expect.any(String),
        icon: expect.any(String)
      });
      expect(tip.text.length).toBeGreaterThan(0);
    });
  });

  it('gives every tip a unique id', async () => {
    const { payload } = await callGetTips();

    const ids = payload.map((tip) => tip.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
