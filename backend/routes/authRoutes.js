const express = require('express');
const router = express.Router();

const { registerUser, loginUser, forgotPassword, resetPassword, confirmAccount, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword', resetPassword);
router.get('/confirm/:token', confirmAccount);
router.get('/profile', protect, getProfile);

module.exports = router;