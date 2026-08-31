const mongoose = require('mongoose');

const errorHandler = require('../../utils/errorHandler');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  it('falls back to 500 for an error with no status code', () => {
    const res = mockRes();

    errorHandler(new Error('kaboom'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'kaboom' });
  });

  it('honours an explicit statusCode on the error', () => {
    const res = mockRes();
    const err = Object.assign(new Error('nope'), { statusCode: 403 });

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'nope' });
  });

  it('uses a generic message when the error carries none', () => {
    const res = mockRes();

    errorHandler(new Error(), {}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Internal Server Error'
    });
  });

  it('maps a mongoose ValidationError to 400', () => {
    const res = mockRes();
    const err = new mongoose.Error.ValidationError();

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });

  it('maps a mongoose CastError to 400 and names the offending path', () => {
    const res = mockRes();
    const err = new mongoose.Error.CastError('ObjectId', 'oops', 'userId');

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid value for userId'
    });
  });

  it('has the four-parameter signature express uses to detect error middleware', () => {
    expect(errorHandler).toHaveLength(4);
  });
});
