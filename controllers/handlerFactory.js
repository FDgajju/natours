const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const doc = await Model.findByIdAndDelete(id);

    if (!doc) return next(new AppError('No document found with this id', 404));

    return res.status(204).send({
      status: 'success',
      message: 'Operation successful',
      data: null,
    });
  });

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const {
      body: data,
      params: { id },
    } = req;

    const doc = await Model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!doc) {
      return next(new AppError(`Document not found`, 404));
    }

    return res.status(200).send({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { body } = req;
    const doc = await Model.create(body);

    return res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const {
      params: { id },
    } = req;

    let query = Model.findById(id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError(`Document not found`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const { query, params } = req;
    const filter = {};

    if (params.tourId) filter.tour = params.tourId;

    const features = new APIFeatures(Model.find(filter), query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // const doc = await features.query.explain();
    const doc = await features.query;

    return res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc,
      },
    });
  });

module.exports = { deleteOne, updateOne, createOne, getOne, getAll };
