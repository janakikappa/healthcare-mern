const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all required fields' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user  = await User.create({ name, email, password, role: role || 'patient', phone: phone || '' });
    const token = generateToken(user._id);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token });
  } catch (err) {
    console.error(err);
res.status(500).json({ message: err.message });
  }
};

// const registerUser = async (req, res) => {
//   try {
//     console.log("➡️ Incoming request");
//     console.log("BODY:", req.body);

//     const { name, email, password, role, phone } = req.body;

//     if (!name || !email || !password) {
//       console.log("❌ Missing fields");
//       return res.status(400).json({ message: 'Please fill all required fields' });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) {
//       console.log("❌ Email already exists");
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     console.log("⏳ Creating user...");

//     const user = await User.create({
//       name,
//       email,
//       password,
//       role: role || 'patient',
//       phone: phone || ''
//     });

//     console.log("✅ USER CREATED:", user);

//     const token = generateToken(user._id);

//     res.status(201).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       token
//     });

//   } catch (err) {
//     console.error("🔥 REGISTER ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Please enter email and password' });

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated' });

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
const getMe = async (req, res) => {
  try {
    res.json(await User.findById(req.user._id));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
