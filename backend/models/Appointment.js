const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patientId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    doctorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: Date,   required: true },
    timeSlot:        { type: String, required: true },
    symptoms:        { type: String, required: true },
    status:          { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes:           { type: String, default: '' },
    prescription:    { type: String, default: '' },
    cancelledBy:     { type: String, default: '' },
    cancelReason:    { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
