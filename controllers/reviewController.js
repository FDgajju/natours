const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

const getReview = getOne(Review, [
  { path: 'tour', select: 'name' },
  { path: 'user', select: 'name photo' },
]);

const getAllReviews = getAll(Review);
const createReview = createOne(Review);
const deleteReview = deleteOne(Review);
const updateReview = updateOne(Review);

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  getReview,
};
