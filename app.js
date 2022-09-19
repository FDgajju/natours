const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { default: helmet } = require('helmet');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');

const userRoutes = require('./routes/userRoutes.js');
const toursRoutes = require('./routes/tourRoutes');
const reviewRoute = require('./routes/reviewRoutes');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.get('/health', (req, res) => {
  res.status(200).send({ status: 'success', message: 'Health is Good 👍' });
});

// GLOBAL MIDDLEWARES
// Security HTTP headers
app.use(helmet());

// body-parser reading data from body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query inject
app.use(ExpressMongoSanitize());

// Data sanitization against xss
app.use(xssClean());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'averageRating',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// development logging
if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// serving static file
app.use(express.static(`${__dirname}/public`));

app.use('/api/user', userRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/review', reviewRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
