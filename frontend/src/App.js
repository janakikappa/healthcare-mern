import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Doctors       from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import Appointments  from './pages/Appointments';
import Profile       from './pages/Profile';
import Users         from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"            element={<Navigate to="/login" replace />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/doctors"     element={<PrivateRoute><Doctors /></PrivateRoute>} />
          <Route path="/book"        element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
          <Route path="/appointments"element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/users"       element={<PrivateRoute role="admin"><Users /></PrivateRoute>} />
          <Route path="*"            element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
