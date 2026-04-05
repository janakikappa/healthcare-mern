const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/profile',         protect, ctrl.getUserProfile);
router.put('/profile',         protect, ctrl.updateUserProfile);
router.put('/change-password', protect, ctrl.changePassword);
router.get('/',                protect, adminOnly, ctrl.getAllUsers);
router.delete('/:id',          protect, adminOnly, ctrl.deleteUser);

module.exports = router;
