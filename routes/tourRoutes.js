const { Router } = require('express');
const reviewRoutes = require('./reviewRoutes');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistance,
} = require('../controllers/tourController');
const { protect, restriction } = require('../middleware/auth');

const router = Router();

// router.param('id', checkId);

router.use('/:tourId/review', reviewRoutes);

router.get('/top-5-cheap', aliasTopTour, getAllTours);
router.get('/tour-stats', getTourStats);
router.get(
  '/monthly-plan/:year',
  protect,
  restriction('admin', 'lead-guid', 'guid'),
  getMonthlyPlan
);

router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithin);
router.get('/distances/:latlng/unit/:unit', getDistance);

router.get('/', getAllTours);
router.post('/', protect, restriction('admin', 'lead-guid'), createTour);

router.get('/:id', getTour);
router.patch('/:id', protect, restriction('admin', 'lead-guid'), updateTour);
router.delete('/:id', protect, restriction('admin', 'lead-guid'), deleteTour);

module.exports = router;
