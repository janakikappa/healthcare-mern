import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'patient', phone: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      const { data } = await registerUser(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const roles = [
    { value: 'patient', label: 'Patient',  desc: 'Book appointments',  icon: '👤', color: '#6366f1' },
    { value: 'doctor',  label: 'Doctor',   desc: 'Manage your schedule', icon: '👨‍⚕️', color: '#0ea5e9' },
    { value: 'admin',   label: 'Admin',    desc: 'Full system access',  icon: '🔑', color: '#f59e0b' },
  ];

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.leftContent}>
          <div style={S.brand}>
            <div style={S.brandIcon}>🏥</div>
            <h1 style={S.brandName}>MediBook</h1>
            <p style={S.brandTagline}>Join thousands of patients and doctors</p>
          </div>
          <div style={S.infoCards}>
            {[
              { icon: '🔒', title: 'Secure', desc: 'JWT + bcrypt encryption' },
              { icon: '⚡', title: 'Fast',   desc: 'Real-time updates' },
              { icon: '📱', title: 'Easy',   desc: 'Simple booking process' },
            ].map(c => (
              <div key={c.title} style={S.infoCard}>
                <div style={S.infoIcon}>{c.icon}</div>
                <div>
                  <div style={S.infoTitle}>{c.title}</div>
                  <div style={S.infoDesc}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <h2 style={S.title}>Create Account</h2>
          <p style={S.subtitle}>Fill in your details to get started</p>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={S.field}>
              <label style={S.label}>Select Role</label>
              <div style={S.roleGrid}>
                {roles.map(r => (
                  <div key={r.value}
                    style={{ ...S.roleCard, ...(form.role === r.value ? { borderColor: r.color, background: r.color + '10' } : {}) }}
                    onClick={() => set('role', r.value)}>
                    <div style={S.roleIcon}>{r.icon}</div>
                    <div style={{ ...S.roleName, ...(form.role === r.value ? { color: r.color } : {}) }}>{r.label}</div>
                    <div style={S.roleDesc}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={S.row}>
              <div style={S.field}>
                <label style={S.label}>Full Name</label>
                <input style={S.input} placeholder="Rahul Sharma"
                  value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div style={S.field}>
                <label style={S.label}>Phone Number</label>
                <input style={S.input} placeholder="+91 9876543210"
                  value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div style={S.field}>
              <label style={S.label}>Email Address</label>
              <input style={S.input} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div style={S.field}>
              <label style={S.label}>Password <span style={{ color: '#94a3b8', fontWeight: 400 }}>(min 6 characters)</span></label>
              <input style={S.input} type="password" placeholder="••••••••"
                value={form.password} onChange={e => set('password', e.target.value)} required />
            </div>

            <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p style={S.switchText}>
            Already have an account? <Link to="/login" style={S.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const S = {
  page:        { display: 'flex', minHeight: '100vh' },
  left:        { flex: '0 0 380px', background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 },
  leftContent: { color: '#fff' },
  brand:       { textAlign: 'center', marginBottom: 40 },
  brandIcon:   { fontSize: 56, marginBottom: 12 },
  brandName:   { fontFamily: 'Poppins, sans-serif', fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 8 },
  brandTagline:{ fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  infoCards:   { display: 'flex', flexDirection: 'column', gap: 14 },
  infoCard:    { background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, backdropFilter: 'blur(10px)' },
  infoIcon:    { fontSize: 24 },
  infoTitle:   { fontSize: 14, fontWeight: 700, color: '#fff' },
  infoDesc:    { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  right:       { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', background: '#f8fafc', overflowY: 'auto' },
  card:        { background: '#fff', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 560, boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.08)' },
  title:       { fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  subtitle:    { fontSize: 14, color: '#64748b', marginBottom: 24 },
  error:       { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 },
  field:       { marginBottom: 14, flex: 1 },
  row:         { display: 'flex', gap: 14 },
  label:       { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, letterSpacing: '0.02em' },
  input:       { width: '100%', padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, color: '#0f172a', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' },
  roleGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 4 },
  roleCard:    { border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all .18s' },
  roleIcon:    { fontSize: 22, marginBottom: 4 },
  roleName:    { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 2 },
  roleDesc:    { fontSize: 10, color: '#94a3b8' },
  btn:         { width: '100%', padding: 13, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  switchText:  { textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 },
  switchLink:  { color: '#6366f1', fontWeight: 600 },
};

export default Register;
