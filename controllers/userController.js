const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filterObject = require('../utils/filterObject');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

const updateCurrentUser = catchAsync(async (req, res, next) => {
  const { body } = req;

  if (body.password || body.passwordConfirm)
    return next(new AppError('This route is not for updating password', 400));

  // filtered out unwanted fields that are not allow to be updated
  const finalData = filterObject(body, 'name', 'email');
  console.log(finalData);

  const user = await User.findByIdAndUpdate(req.user.id, finalData, {
    new: true,
    runValidators: true,
  });

  return res.status(500).send({
    status: 'success',
    message: 'user successfully updated',
    data: {
      user,
    },
  });
});

const deleteCurrentUser = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $set: { active: false },
  });

  return res.status(204).send({
    status: 'success',
    data: null,
  });
});

// Only for admins
const getAllUsers = getAll(User);
const getUser = getOne(User);
const updateUser = updateOne(User);
const deleteUser = deleteOne(User);

module.exports = {
  getAllUsers,
  getUser,
  updateCurrentUser,
  deleteCurrentUser,
  deleteUser,
  updateUser,
};
