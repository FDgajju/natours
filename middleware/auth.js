const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');

const protect = catchAsync(async (req, res, next) => {
  // 1) get the token if its there
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError("You're not logged in! please log in to get access 🙏", 401)
    );

  //2) need to validate the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decode);
  // 3) check if user is exist
  const currentUser = await User.findById(decode.id);

  if (!currentUser) {
    return next(
      new AppError('The user belong to this token is no longer exist', 401)
    );
  }

  // 4) check if user changed password after the token issued
  // TODO ----
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password! please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

const restriction = (...roles) => {
  // roles ['admin', 'lead-guide']
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this acton.', 403)
      );
    }

    next();
  };
};

module.exports = { protect, restriction };
