/*
Note: DB connection , model and data Object require
*/

const fs = require('fs');
const db_connection = require('../config/db');
const Tour = require('../models/tourModel');

const db_url = 'mongodb://127.0.0.1:27017/natours';

db_connection(db_url);

const data = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(data);
    console.log('Data successfully loaded.');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteAllData = async () => {
  try {
    await Tour.deleteMany({});
    console.log('Data successfully deleted.');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const checkData = async () => {
  try {
    let check = await Tour.find();

    check = check.map((el) => ({
      name: el.name,
      rating: el.averageRating,
      price: el.price,
      locations: el.locations
    }));

    console.log({
      dataLength: check.length,
      data: check.length ? check : 'Empty',
    });
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === 'import') importData();
else if (process.argv[2] === 'delete') deleteAllData();
else if (process.argv[2] === 'find') checkData();
