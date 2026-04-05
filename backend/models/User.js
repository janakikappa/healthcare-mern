const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true },
    password:   { type: String, required: true, select: false },
    role:       { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    phone:      { type: String, default: '' },
    gender:     { type: String, enum: ['male', 'female', 'other', ''], default: '' },
    dateOfBirth:{ type: String, default: '' },
    address:    { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    isActive:   { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre('save', function (done) {
  if (!this.isModified('password')) return done();
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return done();
  const salt = bcrypt.genSaltSync(10);
  this.password = bcrypt.hashSync(this.password, salt);
  return done();
});

UserSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compareSync(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
