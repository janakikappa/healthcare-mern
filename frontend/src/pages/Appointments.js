import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAppointments, getDoctorAppointments, getAllAppointments, updateAppointment, cancelAppointment } from '../services/api';
import Navbar from '../components/Navbar';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
);

const Appointments = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [appts,   setAppts]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);
  const [selAppt, setSelAppt] = useState(null);
  const [notes,   setNotes]   = useState('');
  const [prescription, setPrescription] = useState('');

  const fetchAppts = async () => {
    try {
      let res;
      if (user?.role === 'admin')       res = await getAllAppointments();
      else if (user?.role === 'doctor') res = await getDoctorAppointments();
      else                              res = await getMyAppointments();
      setAppts(res.data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppts(); }, [user]);  // eslint-disable-line

  const handleStatus = async (id, status) => {
    try { await updateAppointment(id, { status }); fetchAppts(); }
    catch (e) { alert(e.response?.data?.message || 'Update failed'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try { await cancelAppointment(id); fetchAppts(); }
    catch (e) { alert(e.response?.data?.message || 'Cancel failed'); }
  };

  const handleNotesSave = async () => {
    if (!selAppt) return;
    try { await updateAppointment(selAppt._id, { notes, prescription }); fetchAppts(); setSelAppt(null); }
    catch (e) { alert('Failed to save notes'); }
  };

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];
  const filtered = filter === 'all' ? appts : appts.filter(a => a.status === filter);

  const counts = filters.reduce((acc, f) => {
    acc[f] = f === 'all' ? appts.length : appts.filter(a => a.status === f).length;
    return acc;
  }, {});

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>
              {user?.role === 'doctor' ? '🗓️ My Schedule' :
               user?.role === 'admin'  ? '📊 All Appointments' : '📋 My Appointments'}
            </h1>
            <p style={S.subtitle}>
              {user?.role === 'doctor' ? 'Manage your patient appointments' :
               user?.role === 'admin'  ? 'Monitor and manage all system appointments' :
               'Track and manage your medical appointments'}
            </p>
          </div>
          {user?.role === 'patient' && (
            <button style={S.bookBtn} onClick={() => navigate('/book')}>+ Book New</button>
          )}
        </div>

        {/* Filter Tabs */}
        <div style={S.filterRow}>
          {filters.map(f => (
            <button key={f} style={{ ...S.tab, ...(filter === f ? S.tabActive : {}) }}
              onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ ...S.tabCount, ...(filter === f ? S.tabCountActive : {}) }}>{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={S.loadingWrap}><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}>
            <div style={{ fontSize: 52 }}>📭</div>
            <p style={S.emptyText}>No {filter === 'all' ? '' : filter} appointments found</p>
            {user?.role === 'patient' && (
              <button style={S.emptyBtn} onClick={() => navigate('/book')}>Book an Appointment</button>
            )}
          </div>
        ) : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  {user?.role === 'patient' && <>
                    <th style={S.th}>Doctor</th>
                    <th style={S.th}>Specialization</th>
                    <th style={S.th}>Date</th>
                    <th style={S.th}>Time</th>
                    <th style={S.th}>Symptoms</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Action</th>
                  </>}
                  {user?.role === 'doctor' && <>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Date</th>
                    <th style={S.th}>Time</th>
                    <th style={S.th}>Symptoms</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Actions</th>
                  </>}
                  {user?.role === 'admin' && <>
                    <th style={S.th}>Patient</th>
                    <th style={S.th}>Doctor</th>
                    <th style={S.th}>Specialization</th>
                    <th style={S.th}>Date</th>
                    <th style={S.th}>Time</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Actions</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id} style={S.tr}>
                    {user?.role === 'patient' && <>
                      <td style={S.td}><strong>{a.doctorId?.userId?.name || 'Doctor'}</strong></td>
                      <td style={S.td}><span style={S.specTag}>{a.doctorId?.specialization}</span></td>
                      <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                      <td style={S.td}>{a.timeSlot}</td>
                      <td style={{ ...S.td, maxWidth: 160, color: '#64748b' }}>{a.symptoms?.slice(0, 35)}{a.symptoms?.length > 35 ? '...' : ''}</td>
                      <td style={S.td}><StatusBadge status={a.status} /></td>
                      <td style={S.td}>
                        {a.status !== 'cancelled' && a.status !== 'completed' && (
                          <button style={S.cancelBtn} onClick={() => handleCancel(a._id)}>Cancel</button>
                        )}
                        {a.status === 'cancelled' && <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>}
                      </td>
                    </>}

                    {user?.role === 'doctor' && <>
                      <td style={S.td}>
                        <div style={{ fontWeight: 600 }}>{a.patientId?.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.patientId?.phone}</div>
                      </td>
                      <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                      <td style={S.td}>{a.timeSlot}</td>
                      <td style={{ ...S.td, maxWidth: 180, color: '#64748b' }}>{a.symptoms?.slice(0, 40)}{a.symptoms?.length > 40 ? '...' : ''}</td>
                      <td style={S.td}><StatusBadge status={a.status} /></td>
                      <td style={S.td}>
                        <div style={S.actionBtns}>
                          {a.status === 'pending' && (
                            <button style={S.confirmBtn} onClick={() => handleStatus(a._id, 'confirmed')}>Confirm</button>
                          )}
                          {a.status === 'confirmed' && (
                            <button style={S.completeBtn} onClick={() => handleStatus(a._id, 'completed')}>Complete</button>
                          )}
                          {(a.status === 'confirmed' || a.status === 'completed') && (
                            <button style={S.notesBtn} onClick={() => { setSelAppt(a); setNotes(a.notes || ''); setPrescription(a.prescription || ''); }}>Notes</button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button style={S.cancelBtn} onClick={() => handleCancel(a._id)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </>}

                    {user?.role === 'admin' && <>
                      <td style={S.td}>{a.patientId?.name}<div style={{ fontSize: 11, color: '#94a3b8' }}>{a.patientId?.email}</div></td>
                      <td style={S.td}>{a.doctorId?.userId?.name}</td>
                      <td style={S.td}><span style={S.specTag}>{a.doctorId?.specialization}</span></td>
                      <td style={S.td}>{fmtDate(a.appointmentDate)}</td>
                      <td style={S.td}>{a.timeSlot}</td>
                      <td style={S.td}><StatusBadge status={a.status} /></td>
                      <td style={S.td}>
                        <div style={S.actionBtns}>
                          {a.status === 'pending' && (
                            <button style={S.confirmBtn} onClick={() => handleStatus(a._id, 'confirmed')}>Confirm</button>
                          )}
                          {a.status !== 'cancelled' && a.status !== 'completed' && (
                            <button style={S.cancelBtn} onClick={() => handleCancel(a._id)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctor Notes Modal */}
        {selAppt && (
          <div style={S.overlay}>
            <div style={S.modal}>
              <div style={S.modalHeader}>
                <h3 style={S.modalTitle}>Patient Notes — {selAppt.patientId?.name}</h3>
                <button style={S.modalClose} onClick={() => setSelAppt(null)}>✕</button>
              </div>
              <div style={S.modalBody}>
                <div style={S.field}>
                  <label style={S.label}>Symptoms reported by patient</label>
                  <div style={S.symptomsBox}>{selAppt.symptoms}</div>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Doctor's Notes</label>
                  <textarea style={{ ...S.modalInput, height: 90 }}
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Add your clinical notes here..." />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Prescription</label>
                  <textarea style={{ ...S.modalInput, height: 90 }}
                    value={prescription} onChange={e => setPrescription(e.target.value)}
                    placeholder="e.g. Tab Paracetamol 500mg twice daily for 5 days..." />
                </div>
              </div>
              <div style={S.modalFooter}>
                <button style={S.modalCancel} onClick={() => setSelAppt(null)}>Cancel</button>
                <button style={S.modalSave} onClick={handleNotesSave}>Save Notes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  page:         { minHeight: '100vh', background: '#f8fafc' },
  wrap:         { maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' },
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:        { fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  subtitle:     { fontSize: 14, color: '#64748b' },
  bookBtn:      { padding: '10px 22px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  filterRow:    { display: 'flex', gap: 4, marginBottom: 20, background: '#fff', padding: '6px 8px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', width: 'fit-content' },
  tab:          { padding: '7px 16px', border: 'none', background: 'none', fontSize: 13, fontWeight: 600, color: '#94a3b8', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all .15s' },
  tabActive:    { background: '#6366f1', color: '#fff' },
  tabCount:     { background: '#f1f5f9', color: '#94a3b8', borderRadius: 999, fontSize: 11, padding: '1px 7px', fontWeight: 700 },
  tabCountActive:{ background: 'rgba(255,255,255,0.25)', color: '#fff' },
  loadingWrap:  { display: 'flex', justifyContent: 'center', padding: '80px 0' },
  empty:        { textAlign: 'center', padding: '80px 0' },
  emptyText:    { fontSize: 16, color: '#94a3b8', margin: '12px 0 20px' },
  emptyBtn:     { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  tableWrap:    { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  thead:        { background: '#f8fafc' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' },
  tr:           { borderBottom: '1px solid #f8fafc', transition: 'background .15s' },
  td:           { padding: '14px 16px', fontSize: 14, color: '#334155', verticalAlign: 'middle' },
  specTag:      { background: '#eef2ff', color: '#6366f1', padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  actionBtns:   { display: 'flex', gap: 6, flexWrap: 'wrap' },
  confirmBtn:   { padding: '5px 12px', border: '1.5px solid #22c55e', color: '#16a34a', background: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  completeBtn:  { padding: '5px 12px', border: '1.5px solid #0ea5e9', color: '#0369a1', background: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  notesBtn:     { padding: '5px 12px', border: '1.5px solid #6366f1', color: '#6366f1', background: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  cancelBtn:    { padding: '5px 12px', border: '1.5px solid #fca5a5', color: '#dc2626', background: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500, backdropFilter: 'blur(4px)' },
  modal:        { background: '#fff', borderRadius: 20, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' },
  modalHeader:  { padding: '22px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle:   { fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 700, color: '#0f172a' },
  modalClose:   { border: 'none', background: '#f1f5f9', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 14, color: '#64748b' },
  modalBody:    { padding: '20px 24px' },
  field:        { marginBottom: 16 },
  label:        { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 },
  symptomsBox:  { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 13px', fontSize: 13, color: '#64748b', lineHeight: 1.6 },
  modalInput:   { width: '100%', padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  modalFooter:  { padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  modalCancel:  { padding: '10px 20px', border: '1.5px solid #e2e8f0', borderRadius: 9, background: 'none', fontSize: 14, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  modalSave:    { padding: '10px 24px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};

export default Appointments;