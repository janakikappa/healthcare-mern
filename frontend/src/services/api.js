import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5001/api' });

API.interceptors.request.use((config) => {
  const info = JSON.parse(localStorage.getItem('userInfo') || 'null');
  if (info?.token) config.headers.Authorization = `Bearer ${info.token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const registerUser = (d) => API.post('/auth/register', d);
export const loginUser    = (d) => API.post('/auth/login', d);
export const getMe        = ()  => API.get('/auth/me');

// Users
export const getUserProfile    = ()  => API.get('/users/profile');
export const updateUserProfile = (d) => API.put('/users/profile', d);
export const changePassword    = (d) => API.put('/users/change-password', d);
export const getAllUsers        = ()  => API.get('/users');
export const deleteUser        = (id)=> API.delete(`/users/${id}`);

// Doctors
export const getAllDoctors  = ()       => API.get('/doctors');
export const getDoctorById  = (id)    => API.get(`/doctors/${id}`);
export const createDoctor   = (d)     => API.post('/doctors', d);
export const updateDoctor   = (id, d) => API.put(`/doctors/${id}`, d);
export const deleteDoctor   = (id)    => API.delete(`/doctors/${id}`);

// Appointments
export const bookAppointment       = (d)      => API.post('/appointments', d);
export const getMyAppointments     = ()        => API.get('/appointments/my');
export const getDoctorAppointments = ()        => API.get('/appointments/doctor');
export const getAllAppointments    = ()         => API.get('/appointments');
export const updateAppointment    = (id, d)    => API.put(`/appointments/${id}`, d);
export const cancelAppointment    = (id, reason) => API.delete(`/appointments/${id}`, { data: { reason } });

export default API;
