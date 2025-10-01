import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      Swal.fire({
        title: 'Sesi Berakhir',
        text: 'Sesi Anda telah berakhir. Silakan login kembali.',
        icon: 'warning',
        confirmButtonText: 'Login Ulang',
      }).then(() => {
        window.location.href = '/login';
      });
    }
    return Promise.reject(error);
  }
);

export default api;
