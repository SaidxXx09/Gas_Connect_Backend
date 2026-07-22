const express = require('express');
const {
  registerUser, loginUser, confirmEmail, resendConfirmation, forgotPassword, resetPassword,
  profileUser, updateProfile, updatePassword, updateAvatar, deleteProfile,
  getUsers, createUserByAdmin, updateUserByAdmin, deleteUserByAdmin,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/confirm', confirmEmail);
router.get('/confirm/:token', confirmEmail);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.post('/resend-confirmation', protect, resendConfirmation);
router.route('/profile').get(protect, profileUser).put(protect, updateProfile).delete(protect, deleteProfile);
router.put('/profile/password', protect, updatePassword);
router.put('/profile/avatar', protect, updateAvatar);
router.route('/users').get(protect, authorize('administrador'), getUsers).post(protect, authorize('administrador'), createUserByAdmin);
router.route('/users/:id').patch(protect, authorize('administrador'), updateUserByAdmin).delete(protect, authorize('administrador'), deleteUserByAdmin);
module.exports = router;
