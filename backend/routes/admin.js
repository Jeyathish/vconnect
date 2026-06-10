const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

// Protect all admin routes
router.use(verifyAdmin);

// Dashboard overview
router.get('/dashboard', adminController.getDashboardStats);

// Profile administration
router.get('/profiles', adminController.getProfiles);
router.get('/profiles/export', adminController.exportProfilesCSV);
router.delete('/profiles/:id', adminController.deleteProfile);

// Visitor logging
router.get('/visitor-logs', adminController.getVisitorLogs);

// Admin User Management CRUD
router.get('/users', adminController.getAdminUsers);
router.post('/users', adminController.createAdminUser);
router.put('/users/:id', adminController.updateAdminUser);
router.delete('/users/:id', adminController.deleteAdminUser);

// Password updates
router.post('/change-password', adminController.changeAdminPassword);

// User status toggling (admin_users status active/inactive)
router.post('/users/:id/toggle-status', adminController.toggleAdminUserStatus);

module.exports = router;
