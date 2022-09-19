const { Router } = require('express');

const {
  signUp,
  logIn,
  forgetPassword,
  resetPassword,
  updatePassword,
} = require('../controllers/authController');

const {
  getAllUsers,
  updateCurrentUser,
  deleteCurrentUser,
  deleteUser,
  updateUser,
  createUser,
  getUser,
  getCurrentUser,
} = require('../controllers/userController');
const { protect, restriction } = require('../middleware/auth');

const router = new Router();

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forget-password', forgetPassword);
router.patch('/reset-password/:token', resetPassword);

// after all above auth route runs this middleware
router.use(protect); // this middleware runs for all below routes

router.patch('/update-password', updatePassword);
router.get('/profile', getCurrentUser, getUser);
router.patch('/update-details', updateCurrentUser);
router.delete('/delete-profile', deleteCurrentUser);

router.use(restriction('admin')); // this middleware runs for all below routes
// Admin restricted routes
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);

module.exports = router;
