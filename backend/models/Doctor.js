const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema(
  {
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization:  { type: String, required: true },
    qualification:   { type: String, default: 'MBBS' },
    experience:      { type: Number, required: true },
    consultationFee: { type: Number, required: true },
    bio:             { type: String, default: '' },
    rating:          { type: Number, default: 4.5 },
    isAvailable:     { type: Boolean, default: true },
    availability: [{
      day:   { type: String },
      slots: [{ type: String }]
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', DoctorSchema);
