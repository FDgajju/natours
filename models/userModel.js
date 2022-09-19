const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const genRandomToken = require('../utils/genRandomToken');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
    trim: true,
  },

  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email address.'],
  },

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },

  photo: String,

  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm your password'],
    validate: {
      // only works on Save and create !!
      validator: function (el) {
        return el === this.password; // passwordConfirm === password
      },
      message: 'Password are not the same.',
    },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExp: Date,

  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// pre middleware
userSchema.pre('save', async function (next) {
  // only run if pass modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // delete pass confirm field
  this.passwordConfirm = undefined;
  next();
});

//updating passwordChangedAt property
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// adding methods in document //
userSchema.methods.isCorrectPass = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    ); // return's value in milliseconds and JWTTimestamp is in seconds

    return changedTimeStamp > JWTTimestamp;
  }
  return false;
};

// creating reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = genRandomToken(32);

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExp = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = model('User', userSchema);
module.exports = User;
