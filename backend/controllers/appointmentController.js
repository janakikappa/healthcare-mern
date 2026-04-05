const Appointment = require('../models/Appointment');
const Doctor      = require('../models/Doctor');

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, timeSlot, symptoms } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const taken = await Appointment.findOne({
      doctorId, appointmentDate: new Date(appointmentDate),
      timeSlot, status: { $ne: 'cancelled' }
    });
    if (taken) return res.status(409).json({ message: 'This slot is already booked. Please choose another.' });

    const appt = await Appointment.create({
      patientId: req.user._id, doctorId,
      appointmentDate: new Date(appointmentDate), timeSlot, symptoms
    });
    res.status(201).json(appt);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMyAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find({ patientId: req.user._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ appointmentDate: -1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const appts = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'name email phone dateOfBirth bloodGroup')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ appointmentDate: 1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllAppointments = async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate('patientId', 'name email phone')
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ appointmentDate: -1 });
    res.json(appts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    appt.status       = req.body.status       || appt.status;
    appt.notes        = req.body.notes        || appt.notes;
    appt.prescription = req.body.prescription || appt.prescription;
    res.json(await appt.save());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    const isOwner = appt.patientId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin' && req.user.role !== 'doctor')
      return res.status(403).json({ message: 'Not authorized' });
    appt.status      = 'cancelled';
    appt.cancelledBy = req.user.role;
    appt.cancelReason = req.body.reason || '';
    await appt.save();
    res.json({ message: 'Appointment cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  bookAppointment, getMyAppointments, getDoctorAppointments,
  getAllAppointments, updateAppointment, cancelAppointment
};
