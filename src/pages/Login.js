import React, { useState, useContext } from 'react';
import api from '../services/api.js';
import { AuthContext } from '../context/AuthContext.js';
import Swal from 'sweetalert2';
import { Button } from 'react-bootstrap';
import Icon from '../components/Icon.js';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginAction } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { username, password });
      if (response.data.user.role !== 'admin') {
        Swal.fire('Gagal', 'Halaman ini hanya untuk admin.', 'error');
        return;
      }
      sessionStorage.removeItem('announcementsShown');

      loginAction(response.data.user, response.data.token);
    } catch (error) {
      Swal.fire(
        'Login Gagal',
        error.response?.data?.message || 'Username atau Password salah.',
        'error'
      );
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div
        className="card p-4 shadow"
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div className="card-body">
          <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
            <img
              src="https://images2.imgbox.com/73/0b/cN2ke70I_o.png"
              alt="Logo DKP3 BJM"
              style={{ width: '60px', height: 'auto' }}
            />
            <div>
              <h2 className="text-center fs-5 fw-bold mb-0 text-black">
                Sistem Informasi E-Absensi Peserta Magang
              </h2>
              <p className="text-center fs-6 text-muted mb-0">
                Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Banjarmasin
              </p>
            </div>
          </div>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label text-black">
                Username
              </label>
              <div className="input-group">
                <input
                  type="text"
                  id="username"
                  className="form-control input-group-merged-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <span className="input-group-text">
                  <Icon name="person-badge" />
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label text-black">
                Password
              </label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-control input-group-merged-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  className="input-group-merged-button"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Icon name="eye-slash" />
                  ) : (
                    <Icon name="eye" />
                  )}
                </Button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
