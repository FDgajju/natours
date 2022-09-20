const { Schema, model } = require('mongoose');
const { default: slugify } = require('slugify');
const User = require('./userModel');

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name.'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less and equal then 40 characters',
      ],
      minlength: [10, 'A tour name must have more then 10 characters'],
    },

    slug: String,

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },

    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: (easy, medium or difficult)',
      },
      required: [true, 'A tour must have a difficulty'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 4.5,
      min: [1, 'The rating must be above 1'],
      max: [5, 'The rating must be below 5'],
      set: (val) => Math.floor(val * 10) / 10, // 4.66666666 * 10  => 47 / 10 => 4.7
    },

    price: {
      type: Number,
      required: [true, 'Price is required'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },

        message: 'Discount price ( {VALUE} ) could not be grater then price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summery'],
    },

    description: {
      type: String,
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a image cover'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    startDates: [Date],

    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],

    guides: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.index({ price: 1, averageRating: -1 });
tourSchema.index({ slug: 1 });

tourSchema.virtual('derationWeeks').get(function () {
  return this.duration / 7;
});

// virtual population
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
  next();
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() methods
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (el) => await User.findById(el));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// QUERY MIDDLEWARE:
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// AGGREGATION MIDDLEWARE:
tourSchema.pre('aggregate', function (next) {
  const addPL = { $match: { secretTour: { $ne: true } } };
  this.pipeline().unshift(addPL);
  next();
});

const Tour = model('Tour', tourSchema);
module.exports = Tour;
