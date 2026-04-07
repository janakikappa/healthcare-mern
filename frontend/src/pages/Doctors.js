import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDoctors, deleteDoctor } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const SPECS = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'General Medicine'];

const specColors = {
  Cardiology: { bg: '#fef2f2', color: '#dc2626', icon: '🫀' },
  Neurology: { bg: '#f0fdf4', color: '#16a34a', icon: '🧠' },
  Orthopedics: { bg: '#fff7ed', color: '#ea580c', icon: '🦴' },
  Dermatology: { bg: '#fdf4ff', color: '#a21caf', icon: '✨' },
  Pediatrics: { bg: '#eff6ff', color: '#2563eb', icon: '👶' },
  'General Medicine': { bg: '#f0fdfa', color: '#0d9488', icon: '🩺' },
};

const Doctors = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const { data } = await getAllDoctors();
      setDoctors(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      await deleteDoctor(id);
      fetchDoctors();
    } catch (e) {
      alert('Delete failed');
    }
  };

  const filtered = doctors.filter((d) => {
    const name = d.userId?.name?.toLowerCase() || '';
    const spec = d.specialization?.toLowerCase() || '';
    const q = search.toLowerCase();

    return (
      (specFilter === 'All' || d.specialization === specFilter) &&
      (!q || name.includes(q) || spec.includes(q))
    );
  });

  return (
    <div style={S.page}>
      <Navbar />

      <div style={S.wrap}>
        {/* Header */}
        <div style={S.header}>
          <h1 style={S.title}>Our Specialists</h1>
          <p style={S.subtitle}>Browse and connect with doctors</p>
        </div>

        {/* Search */}
        <input
          style={S.searchInput}
          placeholder="Search doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <div style={S.specPills}>
          {SPECS.map((s) => (
            <button
              key={s}
              style={{ ...S.pill, ...(specFilter === s ? S.activePill : {}) }}
              onClick={() => setSpecFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Doctors */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div style={S.grid}>
            {filtered.map((d) => {
              const sc = specColors[d.specialization] || specColors['General Medicine'];

              return (
                <div key={d._id} style={S.card}>
                  <div style={S.cardTop}>
                    <div style={{ ...S.avatar, background: sc.bg, color: sc.color }}>
                      {sc.icon}
                    </div>
                    <span style={{ color: sc.color }}>{d.specialization}</span>
                  </div>

                  <h3>{d.userId?.name}</h3>
                  <p>{d.qualification}</p>

                  <p>⭐ {d.rating}</p>
                  <p>🎓 {d.experience} years</p>

                  <div style={S.footer}>
                    <b>₹{d.consultationFee}</b>

                    <div style={S.btns}>
                      {user?.role === 'patient' && (
                        <button style={S.bookBtn} onClick={() => navigate('/book')}>
                          Book
                        </button>
                      )}

                      {user?.role === 'admin' && (
                        <button style={S.delBtn} onClick={() => handleDelete(d._id)}>
                          Delete
                        </button>
                      )}
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

const S = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc', // ✅ CLEAN BACKGROUND
  },

  wrap: {
    padding: 20,
    maxWidth: 1200,
    margin: '0 auto',
  },

  header: { marginBottom: 20 },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  subtitle: {
    color: '#64748b',
  },

  searchInput: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    border: '1px solid #ddd',
  },

  specPills: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },

  pill: {
    padding: '6px 12px',
    border: '1px solid #ccc',
    borderRadius: 20,
    cursor: 'pointer',
    background: '#fff',
  },

  activePill: {
    background: '#6366f1',
    color: '#fff',
    borderColor: '#6366f1',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    gap: 20,
  },

  card: {
    background: '#fff',
    padding: 15,
    borderRadius: 12,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  avatar: {
    padding: 10,
    borderRadius: 10,
    fontSize: 18,
  },

  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },

  btns: {
    display: 'flex',
    gap: 10,
  },

  bookBtn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
  },

  delBtn: {
    border: '1px solid red',
    color: 'red',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    background: '#fff',
  },
};

export default Doctors;