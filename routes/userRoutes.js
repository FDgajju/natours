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
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = new Router();

router.post('/signup', signUp);
router.post('/login', logIn);
router.post('/forget-password', forgetPassword);
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-password', protect, updatePassword);

router.get('/', getAllUsers);

router.patch('/update-details', protect, updateCurrentUser);
router.delete('/delete-profile', protect, deleteCurrentUser);

// Admin routes
router.get('/:id', getUser);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser);

module.exports = router;
