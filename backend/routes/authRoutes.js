const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', ctrl.registerUser);
router.post('/login',    ctrl.loginUser);
router.get('/me',        protect, ctrl.getMe);

module.exports = router;
