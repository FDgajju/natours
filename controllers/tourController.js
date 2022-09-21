// const APIFeatures = require('../utils/apiFeatures');
// const AppError = require('../utils/appError');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');
//

// top 5 best cheap handler
const aliasTopTour = (req, res, next) => {
  try {
    req.query.limit = 5;
    req.query.sort = '-averageRating,price';
    req.query.fields = 'name,price,averageRating,summary,difficulty';

    next();
  } catch (error) {
    return res.status(500).send({ status: 'fail', message: error.message });
  }
};
//

const getAllTours = getAll(Tour);
const getTour = getOne(Tour, { path: 'reviews' });
const createTour = createOne(Tour);
const updateTour = updateOne(Tour); // update tours
const deleteTour = deleteOne(Tour); // delete tour

//

// aggregation handler
const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { averageRating: { $gte: 4 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averageRating: { $avg: '$averageRating' },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { averagePrice: 1 },
    },
  ]);

  return res.status(200).send({ status: 'success', data: { stats } });
});
//

// tour plan handler
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numOfTourStarts: -1 },
    },
    {
      $limit: 6,
    },
  ]);

  return res
    .status(200)
    .send({ status: 'success', result: plan.length, data: { plan } });
});

// get tours within
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  // 34.108633, -118.101430 //lat and lng
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude if order of lat,lng.',
        404
      )
    );

  // mongoose accepts only radius to this is important
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //converting mile or km to radius

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).send({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

const getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude if order of lat,lng.',
        404
      )
    );

  const distances = await Tour.aggregate([
    {
      // geoNear require of our fields contains a geoSpecial Index
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1], // converting string to numbers String * 1 = Number
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  console.log(distances.map((el) => el.distance));
  res.status(200).send({
    status: 'success',
    results: distances.length,
    data: {
      data: distances,
    },
  });
});

module.exports = {
  getDistance,
  getToursWithin,
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
};
