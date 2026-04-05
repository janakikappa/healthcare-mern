import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = {
    patient: [
      { path: '/dashboard',    label: 'Dashboard', icon: '⊞' },
      { path: '/doctors',      label: 'Doctors',   icon: '👨‍⚕️' },
      { path: '/book',         label: 'Book',       icon: '📅' },
      { path: '/appointments', label: 'My Appointments', icon: '📋' },
      { path: '/profile',      label: 'Profile',    icon: '👤' },
    ],
    doctor: [
      { path: '/dashboard',    label: 'Dashboard',  icon: '⊞' },
      { path: '/appointments', label: 'My Schedule',icon: '🗓️' },
      { path: '/profile',      label: 'Profile',    icon: '👤' },
    ],
    admin: [
      { path: '/dashboard',    label: 'Dashboard',  icon: '⊞' },
      { path: '/doctors',      label: 'Doctors',    icon: '👨‍⚕️' },
      { path: '/appointments', label: 'Appointments',icon: '📋' },
      { path: '/users',        label: 'Users',      icon: '👥' },
      { path: '/profile',      label: 'Profile',    icon: '👤' },
    ],
  };

  const links = navLinks[user?.role] || navLinks.patient;
  const roleColor = { patient: '#6366f1', doctor: '#0ea5e9', admin: '#f59e0b' };
  const roleIcon  = { patient: '👤', doctor: '👨‍⚕️', admin: '🔑' };

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {/* Logo */}
        <div style={S.logo} onClick={() => navigate('/dashboard')}>
          <div style={S.logoIcon}>🏥</div>
          <span style={S.logoText}>MediBook</span>
        </div>

        {/* Links */}
        <div style={S.links}>
          {links.map(l => (
            <button
              key={l.path}
              style={{
                ...S.link,
                ...(location.pathname === l.path ? S.linkActive : {})
              }}
              onClick={() => navigate(l.path)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div style={S.right}>
          <div
            style={{ ...S.userChip, background: roleColor[user?.role] + '15', borderColor: roleColor[user?.role] + '30' }}
            onClick={() => setOpen(!open)}
          >
            <span style={{ fontSize: 14 }}>{roleIcon[user?.role]}</span>
            <span style={{ ...S.userName, color: roleColor[user?.role] }}>{user?.name}</span>
            <span style={{ ...S.roleBadge, background: roleColor[user?.role] }}>{user?.role}</span>
            <span style={{ color: roleColor[user?.role], fontSize: 10 }}>▼</span>
          </div>

          {open && (
            <div style={S.dropdown}>
              <div style={S.dropItem} onClick={() => { navigate('/profile'); setOpen(false); }}>
                👤 My Profile
              </div>
              <div style={{ ...S.dropItem, color: '#ef4444' }} onClick={handleLogout}>
                🚪 Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const S = {
  nav:       { background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  inner:     { maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', gap: 32 },
  logo:      { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 },
  logoIcon:  { width: 36, height: 36, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  logoText:  { fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 20, color: '#6366f1' },
  links:     { display: 'flex', gap: 2, flex: 1 },
  link:      { padding: '6px 14px', border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#64748b', borderRadius: 8, transition: 'all .18s', cursor: 'pointer' },
  linkActive:{ background: '#eef2ff', color: '#6366f1', fontWeight: 600 },
  right:     { position: 'relative', flexShrink: 0 },
  userChip:  { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid', borderRadius: 999, cursor: 'pointer', userSelect: 'none' },
  userName:  { fontSize: 13, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roleBadge: { fontSize: 10, fontWeight: 700, color: '#fff', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' },
  dropdown:  { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden', zIndex: 200 },
  dropItem:  { padding: '12px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'background .15s', color: '#334155' },
};

export default Navbar;
