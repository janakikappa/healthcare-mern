const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/appointmentController');
const { protect, adminOnly, doctorOnly } = require('../middleware/authMiddleware');

router.post('/',       protect, ctrl.bookAppointment);
router.get('/my',      protect, ctrl.getMyAppointments);
router.get('/doctor',  protect, doctorOnly, ctrl.getDoctorAppointments);
router.get('/',        protect, adminOnly, ctrl.getAllAppointments);
router.put('/:id',     protect, ctrl.updateAppointment);
router.delete('/:id',  protect, ctrl.cancelAppointment);

module.exports = router;
