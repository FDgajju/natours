const { Schema, model } = require('mongoose');
const Tour = require('./tourModel');

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

// tour and user combination always unique
reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // and this prevent user to review multiple times

// populating
reviewSchema.pre(/^find/, function (next) {
  this.populate([
    // { path: 'tour', select: 'name' },
    { path: 'user', select: 'name photo' }, // we can populate multiple fields like this
  ]);
  next();
});

// static method
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const states = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: 'tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (states.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: states[0].nRating,
      averageRating: states[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      averageRating: 4.5,
    });
  }
};

// when posting reviews it aggregates the avgRating
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

// when we update or delete ir aggregates the avgRating
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = model('Review', reviewSchema);
module.exports = Review;
