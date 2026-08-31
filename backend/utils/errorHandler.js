// Terminal error middleware. Express identifies it by its four-parameter
// signature, so `_next` must stay even though it is never called.
const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose schema failures are bad client input, not server faults, so
  // they map to 400. An out-of-enum topic is a client error; only genuine
  // faults fall through to 500.
  if (err.name === 'ValidationError') {
    statusCode = 400;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

module.exports = errorHandler;
