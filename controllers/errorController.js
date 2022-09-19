const AppError = require('../utils/appError');

const handleJWTError = (err) =>
  new AppError('Invalid Token! Please log in again.', 401);

const handleJWTExpError = (err) =>
  new AppError('Login session expired please login again.', 401);

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(
    (el, i) => `${i + 1}), ` + el.message
  );

  let message = `There are ${errors.length} Invalid input data. ${errors.join(
    ', '
  )}`;

  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0]; // error message property name message
  const message = `Duplicate field value: ${value} Please use another value.`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {

  return res.status(err.statusCode).send({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .send({ status: err.status, message: err.message });

    // programming or other unknown error: we don't want to leak errors to the client
  } else {
    // 1). Log the error
    console.error('ERROR 💥', err);

    // send the error
    return res
      .status(500)
      .send({ status: 'error', message: 'Something went very wrong!' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'dev') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == 'prod') {
    let error;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleJWTExpError(err);

    sendErrorProd(error ? error : err, res);
  }
};
