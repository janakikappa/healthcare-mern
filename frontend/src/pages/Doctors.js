import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors, deleteDoctor } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const SPECS = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'General Medicine'];

const specColors = {
  Cardiology:       { bg: '#fef2f2', color: '#dc2626', icon: '🫀' },
  Neurology:        { bg: '#f0fdf4', color: '#16a34a', icon: '🧠' },
  Orthopedics:      { bg: '#fff7ed', color: '#ea580c', icon: '🦴' },
  Dermatology:      { bg: '#fdf4ff', color: '#a21caf', icon: '✨' },
  Pediatrics:       { bg: '#eff6ff', color: '#2563eb', icon: '👶' },
  'General Medicine':{ bg: '#f0fdfa', color: '#0d9488', icon: '🩺' },
};

const Doctors = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [doctors,  setDoctors]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchDoctors = async () => {
    try {
      const { data } = await getAllDoctors();
      setDoctors(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this doctor from the system?')) return;
    try { await deleteDoctor(id); fetchDoctors(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = doctors.filter(d => {
    const name = d.userId?.name?.toLowerCase() || '';
    const spec = d.specialization?.toLowerCase() || '';
    const q    = search.toLowerCase();
    return (specFilter === 'All' || d.specialization === specFilter) &&
           (!q || name.includes(q) || spec.includes(q));
  });

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Our Specialists</h1>
            <p style={S.subtitle}>Browse and connect with our verified medical professionals</p>
          </div>
          {user?.role === 'admin' && (
            <button style={S.addBtn} onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Close' : '+ Add Doctor'}
            </button>
          )}
        </div>

        {/* Add Doctor Form (Admin) */}
        {showForm && user?.role === 'admin' && <AddDoctorForm onSuccess={() => { fetchDoctors(); setShowForm(false); }} />}

        {/* Filters */}
        <div style={S.filters}>
          <input style={S.searchInput} placeholder="🔍  Search by name or specialization…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={S.specPills}>
            {SPECS.map(s => (
              <button key={s} style={{ ...S.pill, ...(specFilter === s ? S.pillActive : {}) }}
                onClick={() => setSpecFilter(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div style={S.loadingWrap}><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div style={S.empty}><div style={{ fontSize: 48 }}>🔍</div><p>No doctors found.</p></div>
        ) : (
          <div style={S.grid}>
            {filtered.map(d => {
              const sc = specColors[d.specialization] || { bg: '#f8fafc', color: '#6366f1', icon: '🩺' };
              return (
                <div key={d._id} style={S.card}>
                  <div style={{ ...S.cardTop, background: `linear-gradient(135deg, ${sc.color}22, ${sc.color}10)` }}>
                    <div style={{ ...S.avatar, background: sc.bg, color: sc.color }}>{sc.icon}</div>
                    <div style={{ ...S.specBadge, background: sc.bg, color: sc.color }}>{d.specialization}</div>
                  </div>
                  <div style={S.cardBody}>
                    <h3 style={S.docName}>{d.userId?.name}</h3>
                    <p style={S.qual}>{d.qualification}</p>
                    <div style={S.docMeta}>
                      <div style={S.metaItem}><span style={S.metaIcon}>🎓</span>{d.experience} yrs exp</div>
                      <div style={S.metaItem}><span style={S.metaIcon}>⭐</span>{d.rating || '4.5'} rating</div>
                      <div style={S.metaItem}><span style={S.metaIcon}>📞</span>{d.userId?.phone || 'N/A'}</div>
                    </div>
                    {d.bio && <p style={S.bio}>{d.bio}</p>}
                    <div style={S.cardFoot}>
                      <div>
                        <div style={S.feeLabel}>Consultation Fee</div>
                        <div style={{ ...S.fee, color: sc.color }}>₹{d.consultationFee}</div>
                      </div>
                      <div style={S.cardBtns}>
                        {user?.role === 'patient' && (
                          <button style={{ ...S.bookBtn, background: sc.color }}
                            onClick={() => { sessionStorage.setItem('preDoc', d._id); navigate('/book'); }}>
                            Book Now
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <button style={S.delBtn} onClick={() => handleDelete(d._id)}>Remove</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const AddDoctorForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ name:'', email:'', password:'doctor@123', phone:'', specialization:'Cardiology', experience:'', consultationFee:'', qualification:'MBBS', bio:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const { createDoctor } = require('../services/api');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try { await createDoctor(form); onSuccess(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to add doctor'); }
    finally { setLoading(false); }
  };

  return (
    <div style={F.wrap}>
      <h3 style={F.title}>Add New Doctor</h3>
      {error && <div style={F.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={F.form}>
        <div style={F.row}>
          <div style={F.field}><label style={F.label}>Full Name</label><input style={F.input} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Dr. Name" /></div>
          <div style={F.field}><label style={F.label}>Email</label><input style={F.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="doctor@email.com" /></div>
        </div>
        <div style={F.row}>
          <div style={F.field}><label style={F.label}>Phone</label><input style={F.input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" /></div>
          <div style={F.field}><label style={F.label}>Specialization</label>
            <select style={F.input} value={form.specialization} onChange={e => set('specialization', e.target.value)}>
              {['Cardiology','Neurology','Orthopedics','Dermatology','Pediatrics','General Medicine'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={F.row}>
          <div style={F.field}><label style={F.label}>Experience (yrs)</label><input style={F.input} type="number" value={form.experience} onChange={e => set('experience', e.target.value)} required placeholder="10" /></div>
          <div style={F.field}><label style={F.label}>Consultation Fee (₹)</label><input style={F.input} type="number" value={form.consultationFee} onChange={e => set('consultationFee', e.target.value)} required placeholder="500" /></div>
        </div>
        <div style={F.field}><label style={F.label}>Qualification</label><input style={F.input} value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="MBBS, MD" /></div>
        <div style={F.field}><label style={F.label}>Bio</label><textarea style={{ ...F.input, height: 70, resize: 'vertical' }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Brief description..." /></div>
        <button style={F.btn} type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Doctor'}</button>
      </form>
    </div>
  );
};

const S = {
  page:        { minHeight: '100vh', background: '#f8fafc' },
  wrap:        { maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' },
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title:       { fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  subtitle:    { fontSize: 14, color: '#64748b' },
  addBtn:      { padding: '10px 22px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  filters:     { marginBottom: 24 },
  searchInput: { width: '100%', padding: '11px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, marginBottom: 14, background: '#fff', outline: 'none', boxSizing: 'border-box' },
  specPills:   { display: 'flex', gap: 8, flexWrap: 'wrap' },
  pill:        { padding: '6px 16px', border: '1.5px solid #e2e8f0', borderRadius: 999, background: '#fff', fontSize: 13, fontWeight: 500, color: '#64748b', cursor: 'pointer', transition: 'all .15s' },
  pillActive:  { background: '#6366f1', borderColor: '#6366f1', color: '#fff', fontWeight: 600 },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: '80px 0' },
  empty:       { textAlign: 'center', padding: '80px 0', color: '#94a3b8' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 },
  card:        { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'all .2s' },
  cardTop:     { padding: '24px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatar:      { width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 },
  specBadge:   { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, letterSpacing: '0.04em' },
  cardBody:    { padding: '0 20px 20px' },
  docName:     { fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 2 },
  qual:        { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  docMeta:     { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  metaItem:    { display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b' },
  metaIcon:    { fontSize: 13 },
  bio:         { fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 14, borderTop: '1px solid #f1f5f9', paddingTop: 12 },
  cardFoot:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 14 },
  feeLabel:    { fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  fee:         { fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800 },
  cardBtns:    { display: 'flex', gap: 8 },
  bookBtn:     { padding: '8px 18px', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  delBtn:      { padding: '8px 14px', border: '1px solid #fca5a5', color: '#dc2626', background: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};

const F = {
  wrap:  { background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, border: '2px solid #6366f1', boxShadow: '0 4px 20px rgba(99,102,241,0.1)' },
  title: { fontFamily: 'Poppins, sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 },
  error: { background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  form:  {},
  row:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { marginBottom: 14 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 },
  input: { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  btn:   { padding: '11px 28px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};

export default Doctors;
