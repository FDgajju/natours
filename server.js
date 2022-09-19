require('dotenv').config();
const app = require('./app');
const db_connection = require('./config/db');

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const DB = `${process.env.DB_URI}/${process.env.DATABASE}`;

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  const dbCheck = await db_connection(DB);
  console.log(`App running on port ${PORT} ${dbCheck}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection! Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
