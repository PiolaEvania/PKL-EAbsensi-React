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
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Nama Lengkap wajib diisi.';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name))
      newErrors.name = 'Nama hanya boleh berisi huruf dan spasi.';

    if (!formData.username) newErrors.username = 'Username wajib diisi.';
    else if (!/^[a-z0-9]+$/.test(formData.username))
      newErrors.username =
        'Username hanya boleh berisi perpaduan huruf kecil dan angka, tanpa spasi.';

    if (!formData.password) newErrors.password = 'Password wajib diisi.';
    else if (formData.password.length < 6 || formData.password.length > 10)
      newErrors.password = 'Password harus memiliki 6 hingga 10 karakter.';

    if (!formData.email) newErrors.email = 'Email wajib diisi.';

    if (formData.phone) {
      if (!/^[0-9]+$/.test(formData.phone))
        newErrors.phone = 'Nomor telepon hanya boleh berisi angka.';
      else if (formData.phone.length > 13)
        newErrors.phone = 'Nomor telepon maksimal 13 digit angka.';
    }

    if (!formData.internship_start)
      newErrors.internship_start = 'Tanggal mulai wajib diisi.';

    if (!formData.internship_end)
      newErrors.internship_end = 'Tanggal selesai wajib diisi.';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});

    if (
      new Date(formData.internship_start) > new Date(formData.internship_end)
    ) {
      Swal.fire(
        'Error',
        'Tanggal mulai magang tidak boleh melebihi tanggal selesai.',
        'error'
      );
      return;
    }

    try {
      await api.post('/users', formData);
      await Swal.fire(
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
                    className={`form-control ${errors.name ? 'is-invalid' : ''} input-group-merged-input`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="person" />
                  </span>
                </div>
                {errors.name && (
                  <small className="text-danger">{errors.name}</small>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="username" className="form-label text-black">
                  Username
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''} input-group-merged-input`}
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="person-badge" />
                  </span>
                </div>
                {errors.username && (
                  <small className="text-danger">{errors.username}</small>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="email" className="form-label text-black">
                  Email
                </label>
                <div className="input-group">
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''} input-group-merged-input`}
                    id="email"
                    name="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="at" />
                  </span>
                </div>
                {errors.email && (
                  <small className="text-danger">{errors.email}</small>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="password" className="form-label text-black">
                  Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-control ${errors.password ? 'is-invalid' : ''} input-group-merged-input`}
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
                {errors.password && (
                  <small className="text-danger">{errors.password}</small>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label text-black">
                  Telepon
                </label>
                <div className="input-group">
                  <input
                    type="text"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''} input-group-merged-input`}
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <span className="input-group-text input-group-text-merged">
                    <Icon name="telephone" />
                  </span>
                </div>
                {errors.phone && (
                  <small className="text-danger">{errors.phone}</small>
                )}
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
                <div>
                  <input
                    type="date"
                    className={`form-control ${errors.internship_start ? 'is-invalid' : ''}`}
                    id="internship_start"
                    name="internship_start"
                    value={formData.internship_start}
                    onChange={handleChange}
                  />
                </div>
                {errors.internship_start && (
                  <small className="text-danger">
                    {errors.internship_start}
                  </small>
                )}
              </div>
              <div className="col-md-6">
                <label
                  htmlFor="internship_end"
                  className="form-label text-black"
                >
                  Tanggal Selesai Magang
                </label>
                <div>
                  <input
                    type="date"
                    className={`form-control ${errors.internship_end ? 'is-invalid' : ''}`}
                    id="internship_end"
                    name="internship_end"
                    value={formData.internship_end}
                    onChange={handleChange}
                  />
                </div>
                {errors.internship_end && (
                  <small className="text-danger">{errors.internship_end}</small>
                )}
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
