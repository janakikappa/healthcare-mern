import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, changePassword } from '../services/api';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    gender: user?.gender || '', bloodGroup: user?.bloodGroup || '', address: user?.address || '',
  });
  const [pwdForm, setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg,  setMsg]          = useState({ type: '', text: '' });
  const [pwdMsg, setPwdMsg]     = useState({ type: '', text: '' });
  const [loading, setLoading]   = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const set    = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setPwd = (k, v) => setPwdForm(f => ({ ...f, [k]: v }));

  const roleColors = { patient: '#6366f1', doctor: '#0ea5e9', admin: '#f59e0b' };
  const roleIcons  = { patient: '👤', doctor: '👨‍⚕️', admin: '🔑' };
  const color = roleColors[user?.role] || '#6366f1';

  const handleProfile = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({ type: '', text: '' });
    try {
      const { data } = await updateUserProfile(form);
      login({ ...user, ...data });
      setMsg({ type: 'ok', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'er', text: err.response?.data?.message || 'Update failed' });
    } finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword)
      return setPwdMsg({ type: 'er', text: 'Passwords do not match' });
    if (pwdForm.newPassword.length < 6)
      return setPwdMsg({ type: 'er', text: 'Password must be at least 6 characters' });
    setPwdLoading(true); setPwdMsg({ type: '', text: '' });
    try {
      await changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      setPwdMsg({ type: 'ok', text: 'Password changed successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ type: 'er', text: err.response?.data?.message || 'Password change failed' });
    } finally { setPwdLoading(false); }
  };

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>

        {/* Profile Header */}
        <div style={{ ...S.heroCard, background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
          <div style={S.heroLeft}>
            <div style={S.avatar}>{roleIcons[user?.role]}</div>
            <div>
              <h1 style={S.heroName}>{user?.name}</h1>
              <p style={S.heroEmail}>{user?.email}</p>
              <div style={S.heroBadges}>
                <span style={S.roleBadge}>{user?.role?.toUpperCase()}</span>
                {user?.phone && <span style={S.infoBadge}>📞 {user.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        <div style={S.grid}>
          {/* Edit Profile */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Edit Profile</h2>
            {msg.text && <div style={msg.type === 'ok' ? S.msgOk : S.msgEr}>{msg.text}</div>}
            <form onSubmit={handleProfile}>
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Full Name</label>
                  <input style={S.input} value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Phone Number</label>
                  <input style={S.input} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
                </div>
              </div>
              <div style={S.row}>
                <div style={S.field}>
                  <label style={S.label}>Gender</label>
                  <select style={S.input} value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={S.field}>
                  <label style={S.label}>Blood Group</label>
                  <select style={S.input} value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                    <option value="">Select blood group</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div style={S.field}>
                <label style={S.label}>Address</label>
                <textarea style={{ ...S.input, height: 80, resize: 'vertical' }}
                  value={form.address} onChange={e => set('address', e.target.value)} placeholder="Your address..." />
              </div>
              <button style={{ ...S.btn, background: color, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Change Password</h2>
            {pwdMsg.text && <div style={pwdMsg.type === 'ok' ? S.msgOk : S.msgEr}>{pwdMsg.text}</div>}
            <form onSubmit={handlePassword}>
              <div style={S.field}>
                <label style={S.label}>Current Password</label>
                <input style={S.input} type="password" value={pwdForm.currentPassword}
                  onChange={e => setPwd('currentPassword', e.target.value)} required placeholder="••••••••" />
              </div>
              <div style={S.field}>
                <label style={S.label}>New Password</label>
                <input style={S.input} type="password" value={pwdForm.newPassword}
                  onChange={e => setPwd('newPassword', e.target.value)} required placeholder="Min 6 characters" />
              </div>
              <div style={S.field}>
                <label style={S.label}>Confirm New Password</label>
                <input style={S.input} type="password" value={pwdForm.confirmPassword}
                  onChange={e => setPwd('confirmPassword', e.target.value)} required placeholder="Repeat new password" />
              </div>
              <button style={{ ...S.btn, background: '#0f172a', opacity: pwdLoading ? 0.7 : 1 }} type="submit" disabled={pwdLoading}>
                {pwdLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            {/* Account Info */}
            <div style={S.infoSection}>
              <h3 style={S.infoTitle}>Account Information</h3>
              {[
                ['Email',     user?.email],
                ['Role',      user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)],
                ['Blood Group', user?.bloodGroup || 'Not set'],
                ['Gender',    user?.gender || 'Not set'],
              ].map(([k, v]) => (
                <div key={k} style={S.infoRow}>
                  <span style={S.infoKey}>{k}</span>
                  <span style={S.infoVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const S = {
  page:        { minHeight: '100vh', background: '#f8fafc' },
  wrap:        { maxWidth: 1100, margin: '0 auto', padding: '32px 24px 48px' },
  heroCard:    { borderRadius: 20, padding: '32px 36px', marginBottom: 28, color: '#fff' },
  heroLeft:    { display: 'flex', alignItems: 'center', gap: 22 },
  avatar:      { width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 },
  heroName:    { fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 },
  heroEmail:   { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  heroBadges:  { display: 'flex', gap: 8, flexWrap: 'wrap' },
  roleBadge:   { background: 'rgba(255,255,255,0.25)', color: '#fff', padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' },
  infoBadge:   { background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '3px 12px', borderRadius: 999, fontSize: 12 },
  grid:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 },
  card:        { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  cardTitle:   { fontFamily: 'Poppins, sans-serif', fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' },
  msgOk:       { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  msgEr:       { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  row:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field:       { marginBottom: 14 },
  label:       { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, letterSpacing: '0.02em' },
  input:       { width: '100%', padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#f9fafb', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' },
  btn:         { width: '100%', padding: 12, color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  infoSection: { marginTop: 24, paddingTop: 20, borderTop: '1px solid #f1f5f9' },
  infoTitle:   { fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 },
  infoRow:     { display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #f8fafc', fontSize: 14 },
  infoKey:     { color: '#94a3b8', fontWeight: 500 },
  infoVal:     { color: '#0f172a', fontWeight: 600 },
};

export default Profile;
