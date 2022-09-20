/*
Note: DB connection , model and data Object require
*/

const fs = require('fs');
const db_connection = require('../config/db');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');

const db_url = 'mongodb://127.0.0.1:27017/natours';

db_connection(db_url);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`, 'utf-8')
);

const importData = async (models, dataArray) => {
  try {
    const createAsync = models.map(async (Model, i) => {
      return await Model.create(dataArray[i], { validateBeforeSave: false });
    });

    const createdData = await Promise.all(createAsync);
    console.log(`${createdData.length} collections just imported.`);

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteAllData = async (...models) => {
  try {
    const deleteAsync = models.map(async (Model, i) => {
      return await Model.deleteMany({});
    });

    const deletedData = await Promise.all(deleteAsync);
    console.log(deletedData);

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const checkData = async (Model) => {
  try {
    let check = await Model.find();

    check = check.map((el) => el._id);

    console.log({
      dataLength: check.length,
      data: check.length ? check : 'Empty',
    });
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === 'import')
  importData([User, Tour, Review], [users, tours, reviews]);
else if (process.argv[2] === 'delete') deleteAllData(User, Tour, Review);
else if (process.argv[2] === 'find') checkData(Tour);
