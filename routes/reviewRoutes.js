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

router
  .route('/')
  .post(protect, restriction('user'), checkParams, createReview)
  .get(getAllReviews);

router.get('/:id', getReview);
router.delete('/:id', deleteReview);
router.patch('/:id', updateReview);

module.exports = router;
