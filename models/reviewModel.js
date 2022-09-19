const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, 'review can not be empty.'],
    },

    rating: {
      type: Number,
      required: [true, 'A review must have a rating'],
      min: 1,
      max: 5,
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populating
reviewSchema.pre(/^find/, function (next) {
  this.populate([
    // { path: 'tour', select: 'name' },
    { path: 'user', select: 'name photo' }, // we can populate multiple fields like this
  ]);
  next();
});

const Review = model('Review', reviewSchema);
module.exports = Review;
