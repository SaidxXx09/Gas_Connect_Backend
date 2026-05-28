const express = require('express');
const router = express.Router();
const { registerUser, loginUser, profileUser, getUsers, deleteProfile, forgotPassword, resetPassword, confirmEmail, resendConfirmation } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend-confirmation', protect, resendConfirmation);
router.get('/profile', protect, profileUser);
router.get('/users', protect, authorize('administrador'), getUsers);
router.delete('/profile', protect, deleteProfile);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.post('/confirm', confirmEmail);
router.get('/confirm/:token', confirmEmail);

module.exports = router;