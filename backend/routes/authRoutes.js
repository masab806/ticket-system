const express = require('express');
const { signup , verifyEmail , login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);

router.get('/verify-email/:token', verifyEmail);

router.post('/login', login);

router.get("/profile", verifyToken, getProfile)

module.exports = router;