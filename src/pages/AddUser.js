import React, { useState } from 'react';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import Icon from '../components/Icon.js';

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'user',
    internship_start: '',
    internship_end: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.username ||
      !formData.password ||
      !formData.email ||
      !formData.internship_start ||
      !formData.internship_end
    ) {
      Swal.fire('Error', 'Semua kolom wajib diisi, kecuali telepon.', 'error');
      return;
    }

    try {
      await api.post('/users', formData);
      Swal.fire(
        'Berhasil!',
        `Peserta baru ${formData.name} telah ditambahkan.`,
        'success'
      );
      navigate('/daftar-peserta');
    } catch (error) {
      Swal.fire(
        'Gagal',
        error.response?.data?.message || 'Terjadi kesalahan.',
        'error'
      );
    }
  };

  return (
    <>
      <h1 className="text-black mb-4">Tambah Peserta Baru</h1>
      <div className="card p-4 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="name" className="form-label text-black">
                  Nama Lengkap
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control input-group-merged-input"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="person" />
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="username" className="form-label text-black">
                  Username
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control input-group-merged-input"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="person-badge" />
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="email" className="form-label text-black">
                  Email
                </label>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control input-group-merged-input"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="at" />
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="password" className="form-label text-black">
                  Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control input-group-merged-input"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label text-black">
                  Telepon
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control input-group-merged-input"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="telephone" />
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <label htmlFor="role" className="form-label text-black">
                  Role
                </label>
                <select
                  className="form-select"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="internship_start"
                  className="form-label text-black"
                >
                  Tanggal Mulai Magang
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="internship_start"
                  name="internship_start"
                  value={formData.internship_start}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="internship_end"
                  className="form-label text-black"
                >
                  Tanggal Selesai Magang
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="internship_end"
                  name="internship_end"
                  value={formData.internship_end}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <button type="submit" className="btn btn-primary">
                Simpan Peserta
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUser;
