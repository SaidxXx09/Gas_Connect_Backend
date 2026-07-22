const express = require('express');
const { chatWithAI } = require('../controllers/chatController');
const { protect, requireConfirmed } = require('../middleware/authMiddleware');
const router = express.Router();
router.post('/', protect, requireConfirmed, chatWithAI);
module.exports = router;
