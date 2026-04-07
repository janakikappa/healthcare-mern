import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await loginUser({ email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const demoAccounts = [
    { label: 'Patient', email: 'patient@medibook.com', pw: 'patient123', color: '#6366f1', icon: '👤' },
    { label: 'Doctor', email: 'meera@medibook.com', pw: 'doctor123', color: '#0ea5e9', icon: '👨‍⚕️' },
    { label: 'Admin', email: 'admin@medibook.com', pw: 'admin123', color: '#f59e0b', icon: '🔑' },
  ];

  return (
    <div style={S.page}>
      {/* Left Panel */}
      <div style={S.left}>
        <div style={S.leftOverlay}></div> {/* ✅ overlay added */}
        <div style={S.leftContent}>
          <div style={S.brand}>
            <div style={S.brandIcon}>🏥</div>
            <h1 style={S.brandName}>MediBook</h1>
            <p style={S.brandTagline}>Healthcare Appointment System</p>
          </div>

          <div style={S.features}>
            {['Book appointments instantly', 'Track your health journey', 'Connect with top doctors', 'Secure & confidential'].map(f => (
              <div key={f} style={S.feature}>
                <div style={S.featureDot}></div>
                <span style={S.featureText}>{f}</span>
              </div>
            ))}
          </div>

          <div style={S.stats}>
            {[['6+', 'Specialists'], ['100%', 'Secure'], ['24/7', 'Support']].map(([n, l]) => (
              <div key={l} style={S.stat}>
                <div style={S.statNum}>{n}</div>
                <div style={S.statLabel}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={S.right}>
        <div style={S.card}>
          <h2 style={S.title}>Welcome back</h2>
          <p style={S.subtitle}>Sign in to your account to continue</p>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Email Address</label>
              <input style={S.input} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div style={S.field}>
              <label style={S.label}>Password</label>
              <input style={S.input} type="password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            <button style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={S.demoSection}>
            <div style={S.demoTitle}>Quick Login (Demo)</div>
            <div style={S.demoGrid}>
              {demoAccounts.map(a => (
                <button key={a.label}
                  style={{ ...S.demoBtn, borderColor: a.color + '40', background: a.color + '08' }}
                  onClick={() => { setEmail(a.email); setPassword(a.pw); }}>
                  <span>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{a.email}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <p style={S.switchText}>
            Don't have an account? <Link to="/register" style={S.switchLink}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { display: 'flex', minHeight: '100vh' },

  // ✅ UPDATED BACKGROUND HERE
  left: {
    flex: 1,
    background: `url('/images/hospital.png') center/cover no-repeat`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    position: 'relative',
    overflow: 'hidden'
  },

  // ✅ OVERLAY ADDED
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.45)'
  },

  leftContent: { position: 'relative', zIndex: 1, color: '#fff' },

  brand: { marginBottom: 48, textAlign: 'center' },
  brandIcon: { fontSize: 64, marginBottom: 16 },
  brandName: { fontFamily: 'Poppins, sans-serif', fontSize: 42, fontWeight: 800, color: '#fff', marginBottom: 8 },
  brandTagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },

  features: { marginBottom: 48 },
  feature: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  featureDot: { width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.6)' },
  featureText: { fontSize: 15, color: 'rgba(255,255,255,0.9)' },

  stats: { display: 'flex', gap: 32 },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 28, fontWeight: 800, color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, background: '#f8fafc' },

  card: { background: '#fff', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },

  title: { fontSize: 28, fontWeight: 700 },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 28 },

  error: { background: '#fef2f2', color: '#dc2626', padding: 10, borderRadius: 8 },

  form: { marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 12 },
  input: { width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc' },

  btn: { width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8 },

  demoSection: { marginTop: 20 },
  demoTitle: { fontSize: 12, marginBottom: 10 },
  demoGrid: { display: 'flex', flexDirection: 'column', gap: 10 },
  demoBtn: { padding: 10, borderRadius: 8, cursor: 'pointer' },

  switchText: { textAlign: 'center', marginTop: 10 },
  switchLink: { color: '#6366f1' }
};

export default Login;