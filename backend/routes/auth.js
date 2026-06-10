const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User Auth Routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

// Forgot Password Routes
router.post('/forgot-password/send-otp', authController.forgotPasswordSendOtp);
router.post('/forgot-password/verify-otp', authController.forgotPasswordVerifyOtp);
router.post('/forgot-password/reset', authController.forgotPasswordReset);

// Admin Auth Routes
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);
router.get('/admin/me', authController.adminMe);

module.exports = router;
