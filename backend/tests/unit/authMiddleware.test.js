const jwt = require('jsonwebtoken');

const authMiddleware = require('../../utils/authMiddleware');

// Minimal express doubles: enough surface for the middleware, no HTTP stack.
const mockReq = (token) => ({
  header: (name) => (name === 'x-auth-token' ? token : undefined)
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('attaches userId from a valid token and calls next', () => {
    const token = jwt.sign({ userId: 'abc123' }, process.env.JWT_SECRET);
    const req = mockReq(token);
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe('abc123');
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a missing token with 401 and does not call next', () => {
    const req = mockReq(undefined);
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token, authorization denied'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an empty token string with 401', () => {
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(mockReq(''), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a token signed with a different secret', () => {
    const forged = jwt.sign({ userId: 'abc123' }, 'some-other-secret');
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(mockReq(forged), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a structurally invalid token', () => {
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(mockReq('not.a.jwt'), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign({ userId: 'abc123' }, process.env.JWT_SECRET, {
      expiresIn: '-10s'
    });
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(mockReq(expired), res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});
