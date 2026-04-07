const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email']
    },

    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient'
    },

    phone: { type: String, default: '' },

    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: ''
    },

    dateOfBirth: { type: Date },

    address: { type: String, default: '' },

    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);