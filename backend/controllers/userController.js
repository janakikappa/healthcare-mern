const User = require('../models/User');

const getUserProfile = async (req, res) => {
  try {
    res.json(await User.findById(req.user._id));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, gender, dateOfBirth, address, bloodGroup } = req.body;
    user.name        = name        || user.name;
    user.phone       = phone       || user.phone;
    user.gender      = gender      || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.address     = address     || user.address;
    user.bloodGroup  = bloodGroup  || user.bloodGroup;
    res.json(await user.save());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user.matchPassword(req.body.currentPassword))
      return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllUsers = async (req, res) => {
  try {
    res.json(await User.find().sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getUserProfile, updateUserProfile, changePassword, getAllUsers, deleteUser };
