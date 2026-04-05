import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers, deleteUser } from '../services/api';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await deleteUser(id); fetchUsers(); }
    catch (e) { alert(e.response?.data?.message || 'Delete failed'); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (filter === 'all' || u.role === filter) &&
           (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  const roleColor = { patient: '#6366f1', doctor: '#0ea5e9', admin: '#f59e0b' };
  const roleIcon  = { patient: '👤', doctor: '👨‍⚕️', admin: '🔑' };

  const counts = {
    all: users.length,
    patient: users.filter(u => u.role === 'patient').length,
    doctor:  users.filter(u => u.role === 'doctor').length,
    admin:   users.filter(u => u.role === 'admin').length,
  };

  return (
    <div style={S.page}>
      <Navbar />
      <div style={S.wrap}>
        <div style={S.header}>
          <div>
            <h1 style={S.title}>👥 User Management</h1>
            <p style={S.subtitle}>View and manage all registered users</p>
          </div>
        </div>

        {/* Stats */}
        <div style={S.statsRow}>
          {[['All Users', counts.all, '#6366f1'], ['Patients', counts.patient, '#0ea5e9'], ['Doctors', counts.doctor, '#22c55e'], ['Admins', counts.admin, '#f59e0b']].map(([l, n, c]) => (
            <div key={l} style={{ ...S.stat, borderTop: `3px solid ${c}` }}>
              <div style={{ ...S.statNum, color: c }}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={S.filterRow}>
          <input style={S.searchInput} placeholder="🔍  Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={S.tabs}>
            {['all', 'patient', 'doctor', 'admin'].map(f => (
              <button key={f} style={{ ...S.tab, ...(filter === f ? S.tabActive : {}) }}
                onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={S.loadingWrap}><div className="spinner"></div></div>
        ) : (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr style={S.thead}>
                  <th style={S.th}>User</th>
                  <th style={S.th}>Email</th>
                  <th style={S.th}>Phone</th>
                  <th style={S.th}>Role</th>
                  <th style={S.th}>Joined</th>
                  <th style={S.th}>Status</th>
                  <th style={S.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} style={S.tr}>
                    <td style={S.td}>
                      <div style={S.userCell}>
                        <div style={{ ...S.avatar, background: roleColor[u.role] + '20', color: roleColor[u.role] }}>
                          {roleIcon[u.role]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{u._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>{u.email}</td>
                    <td style={S.td}>{u.phone || '—'}</td>
                    <td style={S.td}>
                      <span style={{ ...S.roleBadge, background: roleColor[u.role] + '15', color: roleColor[u.role] }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={S.td}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={S.td}>
                      <span style={{ ...S.statusBadge, ...(u.isActive ? S.active : S.inactive) }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={S.td}>
                      {u._id !== user._id && (
                        <button style={S.delBtn} onClick={() => handleDelete(u._id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={S.empty}><div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div><p>No users found</p></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  page:        { minHeight: '100vh', background: '#f8fafc' },
  wrap:        { maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' },
  header:      { marginBottom: 24 },
  title:       { fontFamily: 'Poppins, sans-serif', fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  subtitle:    { fontSize: 14, color: '#64748b' },
  statsRow:    { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 },
  stat:        { background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  statNum:     { fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 800 },
  statLabel:   { fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 2 },
  filterRow:   { marginBottom: 18 },
  searchInput: { width: '100%', padding: '11px 16px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, marginBottom: 12, background: '#fff', outline: 'none', boxSizing: 'border-box' },
  tabs:        { display: 'flex', gap: 6 },
  tab:         { padding: '7px 16px', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600, color: '#64748b', cursor: 'pointer' },
  tabActive:   { background: '#6366f1', borderColor: '#6366f1', color: '#fff' },
  loadingWrap: { display: 'flex', justifyContent: 'center', padding: '60px 0' },
  tableWrap:   { background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  thead:       { background: '#f8fafc' },
  th:          { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f1f5f9' },
  tr:          { borderBottom: '1px solid #f8fafc' },
  td:          { padding: '13px 16px', fontSize: 14, color: '#334155' },
  userCell:    { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:      { width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  roleBadge:   { padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  statusBadge: { padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600 },
  active:      { background: '#f0fdf4', color: '#15803d' },
  inactive:    { background: '#fef2f2', color: '#dc2626' },
  delBtn:      { padding: '5px 12px', border: '1.5px solid #fca5a5', color: '#dc2626', background: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  empty:       { textAlign: 'center', padding: '48px', color: '#94a3b8' },
};

export default Users;
