const { connect } = require('mongoose');

const db_connection = async (DB) => {
  await connect(DB);
  let message = DB.startsWith('mongodb://127') ? 'local' : 'cluster';
  return `With ${message} DB connection 👍️`;
};

module.exports = db_connection;
