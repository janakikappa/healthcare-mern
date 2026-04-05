require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User   = require('./models/User');
const Doctor = require('./models/Doctor');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    await Doctor.deleteMany({});
    await User.deleteMany({ role: 'doctor' });
    console.log('🗑️  Cleared old doctors');

    // Create admin if not exists
    const adminExists = await User.findOne({ email: 'admin@medibook.com' });
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      await mongoose.connection.collection('users').insertOne({
        name: 'Admin User', email: 'admin@medibook.com',
        password: bcrypt.hashSync('admin123', salt),
        role: 'admin', phone: '9000000000', isActive: true,
        createdAt: new Date(), updatedAt: new Date()
      });
      console.log('✅ Admin created: admin@medibook.com / admin123');
    }

    const doctorsData = [
      { name: 'Dr. Meera Iyer',    email: 'meera@medibook.com',   phone: '9876543210', spec: 'Cardiology',       exp: 12, fee: 800,  qual: 'MBBS, MD Cardiology',    bio: 'Expert in heart diseases with 12+ years experience.' },
      { name: 'Dr. Arjun Mehta',   email: 'arjun@medibook.com',   phone: '9876543211', spec: 'Neurology',        exp: 9,  fee: 1000, qual: 'MBBS, DM Neurology',     bio: 'Specialist in neurological disorders and brain health.' },
      { name: 'Dr. Sunita Rao',    email: 'sunita@medibook.com',  phone: '9876543212', spec: 'Dermatology',      exp: 7,  fee: 600,  qual: 'MBBS, MD Dermatology',   bio: 'Expert dermatologist treating all skin conditions.' },
      { name: 'Dr. Vikram Singh',  email: 'vikram@medibook.com',  phone: '9876543213', spec: 'Orthopedics',      exp: 15, fee: 900,  qual: 'MBBS, MS Orthopedics',   bio: 'Senior orthopedic surgeon with extensive experience.' },
      { name: 'Dr. Priya Nambiar', email: 'priya@medibook.com',   phone: '9876543214', spec: 'Pediatrics',       exp: 8,  fee: 500,  qual: 'MBBS, MD Pediatrics',    bio: 'Caring pediatrician dedicated to child health.' },
      { name: 'Dr. Ramesh Gupta',  email: 'ramesh@medibook.com',  phone: '9876543215', spec: 'General Medicine', exp: 20, fee: 400,  qual: 'MBBS, MD General Medicine', bio: 'Experienced general physician for all common ailments.' },
    ];

    for (const d of doctorsData) {
      const salt = bcrypt.genSaltSync(10);
      const user = await mongoose.connection.collection('users').insertOne({
        name: d.name, email: d.email, password: bcrypt.hashSync('doctor123', salt),
        role: 'doctor', phone: d.phone, isActive: true,
        createdAt: new Date(), updatedAt: new Date()
      });

      await Doctor.create({
        userId: user.insertedId, specialization: d.spec, experience: d.exp,
        consultationFee: d.fee, qualification: d.qual, bio: d.bio,
        isAvailable: true, rating: (4 + Math.random()).toFixed(1),
        availability: [
          { day: 'Monday',    slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'] },
          { day: 'Tuesday',   slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'] },
          { day: 'Wednesday', slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'] },
          { day: 'Thursday',  slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'] },
          { day: 'Friday',    slots: ['09:00 AM','10:00 AM','11:00 AM','02:00 PM','03:00 PM','04:00 PM'] },
        ],
      });
      console.log(`✅ Created: ${d.name} — ${d.spec}`);
    }

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:   admin@medibook.com   / admin123');
    console.log('   Doctors: meera@medibook.com   / doctor123');
    console.log('            arjun@medibook.com   / doctor123');
    console.log('            sunita@medibook.com  / doctor123');
    console.log('            vikram@medibook.com  / doctor123');
    console.log('            priya@medibook.com   / doctor123');
    console.log('            ramesh@medibook.com  / doctor123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
