const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/doctorController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',       protect, ctrl.getAllDoctors);
router.get('/:id',    protect, ctrl.getDoctorById);
router.post('/',      protect, adminOnly, ctrl.createDoctor);
router.put('/:id',    protect, adminOnly, ctrl.updateDoctor);
router.delete('/:id', protect, adminOnly, ctrl.deleteDoctor);

module.exports = router;
