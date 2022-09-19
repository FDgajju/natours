const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP_IN,
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == 'prod') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // remove the password from output
  user.password = undefined; // because we don't need to send password in response

  return res.status(statusCode).send({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

// sign up function
exports.signUp = catchAsync(async (req, res, next) => {
  const {
    body: { name, email, role, photo, password, passwordConfirm },
  } = req;

  const userData = {
    name,
    email,
    role,
    photo,
    password,
    passwordConfirm,
  };

  const newUser = await User.create(userData);

  createAndSendToken(newUser, 201, res);
});

// login function
exports.logIn = catchAsync(async (req, res, next) => {
  const {
    body: { email, password },
  } = req;

  // 1) check email amd password is exist
  // 2) check if user exist && password is correct
  // 3) if every thing ok

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  //const isUserVerified = await user?.isCorrectPass(password, user.password); //await bcrypt.compare(password, user.password);

  if (!user || !(await user.isCorrectPass(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createAndSendToken(user, 200, res);
});

// forget password
exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // 1). Get user based on POSted email
  const user = await User.findOne({ email });

  if (!user) return next(new AppError('No user found with this email', 500));

  // 2). Generate a random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3). Sent it to user's email
  const resetURL = `${req.protocol}//${req.get(
    'host'
  )}/api/user/reset-password/${resetToken}`;

  const message = `Forgot your password? submit a patch request with your new password and 
  passwordConfirm to: ${resetURL}.\nIf you did'nt forget your password, please ignore this
  email!`;

  const isMailSend = await sendEmail({
    user: email,
    subject: 'your password token',
    message,
  });

  if (!isMailSend.status) {
    user.passwordResetToken = undefined;
    user.passwordResetExp = undefined;

    await user.save({ validateBeforeSave: false });
    console.log(isMailSend.error);
    return next(
      new AppError('There was an error sending the mail. Try again later!', 500)
    );
  }

  res.status(200).send({ status: 'success', message: 'token send to email!' });
});

//reset password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token: resetToken } = req.params;

  // 1. get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExp: { $gt: Date.now() },
  });

  // 2. if token has not expire and there is user , set new password
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  const { password, passwordConfirm } = req.body;

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExp = undefined;
  await user.save();

  createAndSendToken(user, 200, res);
});

// update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user from collection
  const {
    user: { id },
    body: { currentPassword, password, passwordConfirm },
  } = req;

  const user = await User.findById(id).select('+password');

  // 2. check if posted current password is correct
  if (!(await user.isCorrectPass(currentPassword, user.password)))
    return next(
      new AppError('Your current password is Incorrect, please Try again!', 401)
    );

  // 3. if so, update the password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save(); // User.findOneAndUpdate will not work as intended!

  // 4. Log in user, send JWT
  createAndSendToken(user, 200, res);
});
