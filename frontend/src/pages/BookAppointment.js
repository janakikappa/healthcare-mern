import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors, bookAppointment } from '../services/api';
import Navbar from '../components/Navbar';

const SLOTS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

const specColors = {
  Cardiology:       '#dc2626', Neurology: '#16a34a', Orthopedics: '#ea580c',
  Dermatology:      '#a21caf', Pediatrics: '#2563eb', 'General Medicine': '#0d9488',
};

const BookAppointment = () => {
  const navigate = useNavigate();
  const [doctors,  setDoctors]  = useState([]);
  const [selDoc,   setSelDoc]   = useState('');
  const [date,     setDate]     = useState('');
  const [selSlot,  setSelSlot]  = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState({ type: '', text: '' });
  const [step,     setStep]     = useState(1);

  useEffect(() => {
    getAllDoctors().then(r => setDoctors(r.data)).catch(console.log);
    const pre = sessionStorage.getItem('preDoc');
    if (pre) { setSelDoc(pre); sessionStorage.removeItem('preDoc'); setStep(2); }
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  const selDoctorObj = doctors.find(d => d._id === selDoc);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selDoc)    return setMsg({ type: 'er', text: 'Please select a doctor.' });
    if (!date)      return setMsg({ type: 'er', text: 'Please select a date.' });
    if (!selSlot)   return setMsg({ type: 'er', text: 'Please select a time slot.' });
    if (!symptoms.trim()) return setMsg({ type: 'er', text: 'Please describe your symptoms.' });

    setLoading(true); setMsg({ type: '', text: '' });
    try {
      await bookAppointment({ doctorId: selDoc, appointmentDate: date, timeSlot: selSlot, symptoms });
      setMsg({ type: 'ok', text: '✅ Appointment booked successfully! Redirecting...' });
      setTimeout(() => navigate('/appointments'), 1500);
    } catch (err) {
      setMsg({ type: 'er', text: err.response?.data?.message || 'Booking failed. Please try again.' });
    } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <div style={S.header}>
          <button style={S.backBtn} onClick={() => navigate('/dashboard')}>← Back</button>
          <div>
            <h1 style={S.title}>Book an Appointment</h1>
            <p style={S.subtitle}>Schedule a consultation with a specialist in 3 easy steps</p>
          </div>
        </div>

        {/* Steps indicator */}
        <div style={S.steps}>
          {[['1', 'Choose Doctor'], ['2', 'Pick Date & Time'], ['3', 'Confirm']].map(([n, l], i) => (
            <React.Fragment key={n}>
              <div style={S.stepItem}>
                <div style={{ ...S.stepNum, ...(step >= i + 1 ? S.stepActive : {}) }}>{n}</div>
                <div style={{ ...S.stepLabel, ...(step >= i + 1 ? { color: '#6366f1' } : {}) }}>{l}</div>
              </div>
              {i < 2 && <div style={{ ...S.stepLine, ...(step > i + 1 ? S.stepLineActive : {}) }}></div>}
            </React.Fragment>
          ))}
        </div>

        <div style={S.layout}>
          {/* Left - Form */}
          <div style={S.formCard}>
            {msg.text && (
              <div style={msg.type === 'ok' ? S.msgOk : S.msgEr}>{msg.text}</div>
            )}

            {/* Step 1: Doctor Selection */}
            <div style={S.section}>
              <h3 style={S.sectionTitle}>Step 1: Select Doctor</h3>
              <div style={S.doctorGrid}>
                {doctors.map(d => {
                  const color = specColors[d.specialization] || '#6366f1';
                  return (
                    <div key={d._id}
                      style={{ ...S.docOption, ...(selDoc === d._id ? { borderColor: color, background: color + '08' } : {}) }}
                      onClick={() => { setSelDoc(d._id); setStep(2); }}>
                      <div style={{ ...S.docOptIcon, background: color + '15', color }}>{d.userId?.name?.[0] || '👨‍⚕️'}</div>
                      <div style={S.docOptInfo}>
                        <div style={{ ...S.docOptName, ...(selDoc === d._id ? { color } : {}) }}>{d.userId?.name}</div>
                        <div style={S.docOptSpec}>{d.specialization} · ₹{d.consultationFee}</div>
                      </div>
                      {selDoc === d._id && <div style={{ ...S.checkMark, color }}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date & Slot */}
            <div style={S.section}>
              <h3 style={S.sectionTitle}>Step 2: Choose Date & Time</h3>
              <div style={S.field}>
                <label style={S.label}>Appointment Date</label>
                <input style={S.input} type="date" value={date} min={today}
                  onChange={e => { setDate(e.target.value); setSelSlot(''); }} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Available Time Slots</label>
                <div style={S.slotsGrid}>
                  {SLOTS.map(slot => (
                    <div key={slot}
                      style={{ ...S.slot, ...(selSlot === slot ? S.slotActive : {}) }}
                      onClick={() => { setSelSlot(slot); setStep(3); }}>
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Symptoms */}
            <div style={S.section}>
              <h3 style={S.sectionTitle}>Step 3: Describe Symptoms</h3>
              <textarea style={{ ...S.input, height: 100, resize: 'vertical' }}
                placeholder="e.g. Persistent headache, mild fever for 3 days, fatigue..."
                value={symptoms} onChange={e => setSymptoms(e.target.value)} />
              <div style={S.charCount}>{symptoms.length}/500 characters</div>
            </div>

            <button style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? '⏳ Booking your appointment...' : '✅ Confirm Appointment'}
            </button>
          </div>

          {/* Right - Summary */}
          <div style={S.summaryCard}>
            <h3 style={S.summaryTitle}>Booking Summary</h3>
            {selDoctorObj ? (
              <div>
                <div style={S.summaryDoc}>
                  <div style={S.summaryAvatar}>{selDoctorObj.userId?.name?.[0] || '👨‍⚕️'}</div>
                  <div>
                    <div style={S.summaryDocName}>{selDoctorObj.userId?.name}</div>
                    <div style={S.summaryDocSpec}>{selDoctorObj.specialization}</div>
                  </div>
                </div>
                <div style={S.summaryItems}>
                  {[
                    ['Qualification', selDoctorObj.qualification],
                    ['Experience',    `${selDoctorObj.experience} years`],
                    ['Fee',           `₹${selDoctorObj.consultationFee}`],
                    ['Date',          date || 'Not selected'],
                    ['Time',          selSlot || 'Not selected'],
                  ].map(([k, v]) => (
                    <div key={k} style={S.summaryItem}>
                      <span style={S.summaryKey}>{k}</span>
                      <span style={S.summaryVal}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={S.summaryTotal}>
                  <span>Total Amount</span>
                  <span style={S.summaryAmt}>₹{selDoctorObj.consultationFee}</span>
                </div>
              </div>
            ) : (
              <div style={S.summaryEmpty}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>👨‍⚕️</div>
                <p>Select a doctor to see booking summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const S = {
  page:         { minHeight: '100vh', background: '#f8fafc' },
  wrap:         { maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' },
  header:       { display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 },
  backBtn:      { padding: '8px 16px', border: '1.5px solid #e2e8f0', borderRadius: 9, background: '#fff', fontSize: 14, cursor: 'pointer', fontWeight: 500, flexShrink: 0, marginTop: 4 },
  title:        { fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  subtitle:     { fontSize: 14, color: '#64748b' },
  steps:        { display: 'flex', alignItems: 'center', marginBottom: 28, background: '#fff', padding: '16px 24px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  stepItem:     { display: 'flex', alignItems: 'center', gap: 8 },
  stepNum:      { width: 28, height: 28, borderRadius: '50%', background: '#e2e8f0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  stepActive:   { background: '#6366f1', color: '#fff' },
  stepLabel:    { fontSize: 13, fontWeight: 600, color: '#94a3b8' },
  stepLine:     { flex: 1, height: 2, background: '#e2e8f0', margin: '0 12px' },
  stepLineActive:{ background: '#6366f1' },
  layout:       { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' },
  formCard:     { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  msgOk:        { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '11px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 },
  msgEr:        { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '11px 14px', borderRadius: 9, fontSize: 13, marginBottom: 16 },
  section:      { marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f1f5f9' },
  sectionTitle: { fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 14 },
  doctorGrid:   { display: 'flex', flexDirection: 'column', gap: 10 },
  docOption:    { display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 11, cursor: 'pointer', transition: 'all .18s' },
  docOptIcon:   { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, flexShrink: 0 },
  docOptInfo:   { flex: 1 },
  docOptName:   { fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 1 },
  docOptSpec:   { fontSize: 12, color: '#94a3b8' },
  checkMark:    { fontSize: 18, fontWeight: 700 },
  field:        { marginBottom: 16 },
  label:        { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '0.02em' },
  input:        { width: '100%', padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f9fafb' },
  slotsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 },
  slot:         { padding: '10px 6px', border: '1.5px solid #e2e8f0', borderRadius: 9, textAlign: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', color: '#64748b' },
  slotActive:   { background: '#6366f1', borderColor: '#6366f1', color: '#fff' },
  charCount:    { fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 },
  submitBtn:    { width: '100%', padding: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  summaryCard:  { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'sticky', top: 88 },
  summaryTitle: { fontFamily: 'Poppins, sans-serif', fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' },
  summaryDoc:   { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  summaryAvatar:{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 },
  summaryDocName:{ fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 700, color: '#0f172a' },
  summaryDocSpec:{ fontSize: 12, color: '#94a3b8' },
  summaryItems: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  summaryItem:  { display: 'flex', justifyContent: 'space-between', fontSize: 13 },
  summaryKey:   { color: '#94a3b8', fontWeight: 500 },
  summaryVal:   { color: '#0f172a', fontWeight: 600 },
  summaryTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14, fontSize: 14, fontWeight: 700, color: '#0f172a' },
  summaryAmt:   { fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, color: '#6366f1' },
  summaryEmpty: { textAlign: 'center', padding: '32px 16px', color: '#94a3b8', fontSize: 14 },
};

export default BookAppointment;
