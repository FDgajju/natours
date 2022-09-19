const { Router } = require('express');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');
const { protect, restriction } = require('../middleware/auth');
const checkParams = require('../middleware/checkParams');

const router = Router({ mergeParams: true });

router.use(protect); // all routes have this middleware

router
  .route('/')
  .post(restriction('user'), checkParams, createReview)
  .get(getAllReviews);

router.get('/:id', getReview);
router.delete('/:id', restriction('user', 'admin'), deleteReview);
router.patch('/:id', restriction('user', 'admin'), updateReview);

module.exports = router;
