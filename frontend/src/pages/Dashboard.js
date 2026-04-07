import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getDoctorAppointments, getAllAppointments } from '../services/api';
import Navbar from '../components/Navbar';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }) => (
  <span style={{
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    background:
      status === 'confirmed' ? '#dcfce7' :
      status === 'pending' ? '#fef3c7' :
      '#e0f2fe',
    color:
      status === 'confirmed' ? '#16a34a' :
      status === 'pending' ? '#d97706' :
      '#0284c7'
  }}>{status}</span>
);

const StatCard = ({ num, label, color, icon }) => (
  <div style={{ ...S.stat, borderTop: `4px solid ${color}` }}>
    <div style={{ ...S.statIcon, background: color + '18', color }}>{icon}</div>
    <div style={{ ...S.statNum, color }}>{num}</div>
    <div style={S.statLabel}>{label}</div>
  </div>
);

const QuickCard = ({ icon, title, desc, btnText, btnColor, onClick }) => (
  <div style={S.qCard}>
    <div style={S.qIcon}>{icon}</div>
    <h3 style={S.qTitle}>{title}</h3>
    <p style={S.qDesc}>{desc}</p>
    <button style={{ ...S.qBtn, background: btnColor || '#6366f1' }} onClick={onClick}>{btnText}</button>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        let res;
        if (user?.role === 'admin') res = await getAllAppointments();
        else if (user?.role === 'doctor') res = await getDoctorAppointments();
        else res = await getMyAppointments();
        setAppts(res.data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const pending = appts.filter(a => a.status === 'pending').length;
  const confirmed = appts.filter(a => a.status === 'confirmed').length;
  const completed = appts.filter(a => a.status === 'completed').length;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={S.page}>
      <Navbar />

      {/* 🔥 HERO SECTION */}
      <div style={S.hero}>
        <div style={S.heroOverlay}></div>

        <div style={S.heroContent}>
          <h1 style={S.greeting}>{greet}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={S.greetSub}>
            {user?.role === 'doctor' ? 'Doctor Dashboard — Manage your patient appointments' :
             user?.role === 'admin' ? 'Admin Dashboard — Full system overview and control' :
             'Patient Dashboard — Your health at a glance'}
          </p>
          <span style={S.rolePill}>{user?.role?.toUpperCase()}</span>
        </div>
      </div>

      <div style={S.wrap}>

        {/* Stats */}
        <div style={S.stats}>
          <StatCard num={appts.length} label="Total Appointments" color="#6366f1" icon="📋" />
          <StatCard num={pending} label="Pending" color="#f59e0b" icon="⏳" />
          <StatCard num={confirmed} label="Confirmed" color="#22c55e" icon="✅" />
          <StatCard num={completed} label="Completed" color="#0ea5e9" icon="🏁" />
        </div>

        {/* Quick Actions */}
        <h2 style={S.sectionTitle}>Quick Actions</h2>
        <div style={S.quickGrid}>
          <QuickCard icon="📅" title="Book Appointment" desc="Schedule a visit" btnText="Book Now" onClick={() => navigate('/book')} />
          <QuickCard icon="👨‍⚕️" title="Find Doctors" desc="Browse specialists" btnText="View Doctors" onClick={() => navigate('/doctors')} />
          <QuickCard icon="📋" title="My Appointments" desc="Manage bookings" btnText="View All" onClick={() => navigate('/appointments')} />
        </div>

        {/* Table */}
        <div style={S.tableCard}>
          <div style={S.tableHeader}>
            <h2>Your Recent Appointments</h2>
            <button style={S.viewAllBtn} onClick={() => navigate('/appointments')}>View All →</button>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center' }}>Loading...</p>
          ) : (
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Doctor</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Time</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {appts.slice(0, 5).map(a => (
                  <tr key={a._id}>
                    <td style={S.td}>{a.doctorId?.userId?.name}</td>
                    <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                    <td style={S.td}>{a.timeSlot}</td>
                    <td style={S.td}><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

const S = {
  page: { minHeight: '100vh', background: '#f1f5f9' },

  hero: {
    height: 260,
    background: `url('/images/hospital.png') center/cover no-repeat`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },

  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.55)'
  },

  heroContent: {
    position: 'relative',
    zIndex: 2,
    color: '#fff',
    padding: '0 40px'
  },

  greeting: {
    fontSize: 34,
    fontWeight: 800,
    marginBottom: 6
  },

  greetSub: {
    fontSize: 15,
    opacity: 0.9,
    marginBottom: 10
  },

  rolePill: {
    background: '#6366f1',
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700
  },

  wrap: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },

  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 },

  stat: {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },

  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },

  statNum: { fontSize: 30, fontWeight: 800 },

  statLabel: { fontSize: 12, color: '#64748b' },

  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16 },

  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 32 },

  qCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
    transition: '0.3s'
  },

  qIcon: { fontSize: 36, marginBottom: 10 },

  qTitle: { fontSize: 16, fontWeight: 700 },

  qDesc: { fontSize: 13, color: '#64748b', marginBottom: 16 },

  qBtn: { padding: '8px 18px', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },

  tableCard: {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
  },

  tableHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 16 },

  viewAllBtn: { background: '#eef2ff', border: 'none', padding: '6px 14px', borderRadius: 8, cursor: 'pointer' },

  table: { width: '100%', borderCollapse: 'collapse' },

  th: { textAlign: 'left', padding: 10, fontSize: 12, color: '#64748b' },

  td: { padding: 12, fontSize: 14 }
};

export default Dashboard;