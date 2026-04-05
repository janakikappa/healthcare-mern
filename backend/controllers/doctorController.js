const Doctor = require('../models/Doctor');
const User   = require('../models/User');

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true })
      .populate('userId', 'name email phone');
    res.json(doctors);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience, consultationFee, qualification, bio } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });

    const user   = await User.create({ name, email, password: password || 'doctor@123', role: 'doctor', phone: phone || '' });
    const doctor = await Doctor.create({
      userId: user._id, specialization, experience, consultationFee,
      qualification: qualification || 'MBBS', bio: bio || '',
      availability: [
        { day: 'Monday',    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Tuesday',   slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Thursday',  slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
        { day: 'Friday',    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'] },
      ],
    });
    const populated = await Doctor.findById(doctor._id).populate('userId', 'name email phone');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    Object.assign(doctor, req.body);
    res.json(await doctor.save());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndDelete(doctor.userId);
    await doctor.deleteOne();
    res.json({ message: 'Doctor removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getAllDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
