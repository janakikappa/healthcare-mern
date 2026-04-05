import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getDoctorAppointments, getAllAppointments } from '../services/api';
import Navbar from '../components/Navbar';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status}</span>
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
  const navigate  = useNavigate();
  const [appts,   setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        let res;
        if (user?.role === 'admin')  res = await getAllAppointments();
        else if (user?.role === 'doctor') res = await getDoctorAppointments();
        else res = await getMyAppointments();
        setAppts(res.data);
      } catch (e) { console.log(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const pending   = appts.filter(a => a.status === 'pending').length;
  const confirmed = appts.filter(a => a.status === 'confirmed').length;
  const completed = appts.filter(a => a.status === 'completed').length;
 
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.greeting}>{greet}, {user?.name?.split(' ')[0]}! 👋</h1>
            <p style={S.greetSub}>
              {user?.role === 'doctor' ? 'Doctor Dashboard — Manage your patient appointments' :
               user?.role === 'admin'  ? 'Admin Dashboard — Full system overview and control' :
               'Patient Dashboard — Your health at a glance'}
            </p>
          </div>
          <div style={S.headerBadge}>
            <span style={S.rolePill}>{user?.role?.toUpperCase()}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={S.stats}>
          <StatCard num={appts.length} label={user?.role === 'doctor' ? 'Total Patients' : 'Total Appointments'} color="#6366f1" icon="📋" />
          <StatCard num={pending}   label="Pending"   color="#f59e0b" icon="⏳" />
          <StatCard num={confirmed} label="Confirmed" color="#22c55e" icon="✅" />
          <StatCard num={completed} label="Completed" color="#0ea5e9" icon="🏁" />
        </div>

        {/* Quick Actions */}
        <h2 style={S.sectionTitle}>Quick Actions</h2>
        <div style={S.quickGrid}>
          {user?.role === 'patient' && <>
            <QuickCard icon="📅" title="Book Appointment" desc="Schedule a visit with a specialist" btnText="Book Now" btnColor="#6366f1" onClick={() => navigate('/book')} />
            <QuickCard icon="👨‍⚕️" title="Find Doctors" desc="Browse our verified specialists" btnText="View Doctors" btnColor="#0ea5e9" onClick={() => navigate('/doctors')} />
            <QuickCard icon="📋" title="My Appointments" desc="View, track and manage your bookings" btnText="View All" btnColor="#f59e0b" onClick={() => navigate('/appointments')} />
          </>}
          {user?.role === 'doctor' && <>
            <QuickCard icon="🗓️" title="Today's Schedule" desc="View your patient appointments" btnText="View Schedule" btnColor="#0ea5e9" onClick={() => navigate('/appointments')} />
            <QuickCard icon="⏳" title={`${pending} Pending`} desc="Appointments waiting for confirmation" btnText="Review Now" btnColor="#f59e0b" onClick={() => navigate('/appointments')} />
            <QuickCard icon="✅" title={`${confirmed} Confirmed`} desc="Upcoming confirmed appointments" btnText="View All" btnColor="#22c55e" onClick={() => navigate('/appointments')} />
          </>}
          {user?.role === 'admin' && <>
            <QuickCard icon="👨‍⚕️" title="Manage Doctors" desc="Add, edit or remove doctors" btnText="Manage" btnColor="#0ea5e9" onClick={() => navigate('/doctors')} />
            <QuickCard icon="📊" title="All Appointments" desc="Monitor all system appointments" btnText="View All" btnColor="#6366f1" onClick={() => navigate('/appointments')} />
            <QuickCard icon="👥" title="Manage Users" desc="View and manage all users" btnText="View Users" btnColor="#f59e0b" onClick={() => navigate('/users')} />
          </>}
        </div>

        {/* Recent Appointments */}
        <div style={S.tableCard}>
          <div style={S.tableHeader}>
            <h2 style={S.tableTitle}>
              {user?.role === 'doctor' ? '🗓️ Your Appointments' :
               user?.role === 'admin'  ? '📊 Recent Appointments' : '📋 Your Recent Appointments'}
            </h2>
            <button style={S.viewAllBtn} onClick={() => navigate('/appointments')}>View All →</button>
          </div>

          {loading ? (
            <div style={S.loadingWrap}><div className="spinner"></div></div>
          ) : appts.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIcon}>📭</div>
              <p style={S.emptyText}>No appointments yet</p>
              {user?.role === 'patient' && (
                <button style={S.emptyBtn} onClick={() => navigate('/book')}>Book Your First Appointment</button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    {user?.role === 'patient' && <><th style={S.th}>Doctor</th><th style={S.th}>Specialization</th><th style={S.th}>Date</th><th style={S.th}>Time</th><th style={S.th}>Status</th></>}
                    {user?.role === 'doctor'  && <><th style={S.th}>Patient</th><th style={S.th}>Date</th><th style={S.th}>Time</th><th style={S.th}>Symptoms</th><th style={S.th}>Status</th></>}
                    {user?.role === 'admin'   && <><th style={S.th}>Patient</th><th style={S.th}>Doctor</th><th style={S.th}>Date</th><th style={S.th}>Time</th><th style={S.th}>Status</th></>}
                  </tr>
                </thead>
                <tbody>
                  {appts.slice(0, 5).map(a => (
                    <tr key={a._id} style={S.tr}>
                      {user?.role === 'patient' && <>
                        <td style={S.td}><strong>{a.doctorId?.userId?.name || 'Doctor'}</strong></td>
                        <td style={S.td}><span style={S.specTag}>{a.doctorId?.specialization}</span></td>
                        <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                        <td style={S.td}>{a.timeSlot}</td>
                        <td style={S.td}><StatusBadge status={a.status} /></td>
                      </>}
                      {user?.role === 'doctor' && <>
                        <td style={S.td}><strong>{a.patientId?.name || 'Patient'}</strong></td>
                        <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                        <td style={S.td}>{a.timeSlot}</td>
                        <td style={{ ...S.td, color: '#64748b', maxWidth: 160 }}>{a.symptoms?.slice(0, 35)}...</td>
                        <td style={S.td}><StatusBadge status={a.status} /></td>
                      </>}
                      {user?.role === 'admin' && <>
                        <td style={S.td}>{a.patientId?.name}</td>
                        <td style={S.td}>{a.doctorId?.userId?.name}</td>
                        <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                        <td style={S.td}>{a.timeSlot}</td>
                        <td style={S.td}><StatusBadge status={a.status} /></td>
                      </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const S = {
  page:       { minHeight: '100vh', background: '#f8fafc' },
  wrap:       { maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' },
  header:     { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting:   { fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  greetSub:   { fontSize: 14, color: '#64748b' },
  headerBadge:{ flexShrink: 0 },
  rolePill:   { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', padding: '6px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' },
  stats:      { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 },
  stat:       { background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 8 },
  statIcon:   { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  statNum:    { fontFamily: 'Poppins, sans-serif', fontSize: 32, fontWeight: 800, lineHeight: 1 },
  statLabel:  { fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  sectionTitle:{ fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  quickGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18, marginBottom: 32 },
  qCard:      { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all .2s', border: '1px solid #f1f5f9' },
  qIcon:      { fontSize: 36, marginBottom: 12 },
  qTitle:     { fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 6 },
  qDesc:      { fontSize: 13, color: '#64748b', marginBottom: 18, lineHeight: 1.5 },
  qBtn:       { padding: '9px 20px', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  tableCard:  { background: '#fff', borderRadius: 16, padding: '24px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' },
  tableHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 20px' },
  tableTitle: { fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a' },
  viewAllBtn: { padding: '6px 16px', background: '#eef2ff', color: '#6366f1', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  table:      { width: '100%', borderCollapse: 'collapse' },
  thead:      { background: '#f8fafc' },
  th:         { padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' },
  tr:         { borderBottom: '1px solid #f8fafc', transition: 'background .15s' },
  td:         { padding: '14px 20px', fontSize: 14, color: '#334155' },
  specTag:    { background: '#eef2ff', color: '#6366f1', padding: '2px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  loadingWrap:{ display: 'flex', justifyContent: 'center', padding: '48px 0' },
  empty:      { textAlign: 'center', padding: '48px 20px' },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyText:  { fontSize: 16, color: '#94a3b8', marginBottom: 16 },
  emptyBtn:   { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default Dashboard;
