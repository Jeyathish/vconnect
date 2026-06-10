const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const trackVisitor = require('../middleware/tracker');
const { verifyAny } = require('../middleware/auth');

// Public view (with visitor tracking)
router.get('/:id', trackVisitor, profileController.getProfile);

// Profile creation (authenticated session via verified token cookie)
router.post('/', profileController.uploadMiddleware, profileController.createProfile);

// Profile updates (requires ownership or admin token)
router.put('/:id', verifyAny, profileController.uploadMiddleware, profileController.updateProfile);

// QR generation (requires ownership or admin token)
router.post('/:id/qr', verifyAny, profileController.generateQrCode);

module.exports = router;
