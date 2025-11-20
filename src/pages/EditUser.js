import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import Icon from '../components/Icon.js';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${userId}`);
        const user = res.data;
        setFormData({
          ...user,
          password: '',
          internship_start: user.internship_start
            ? new Date(user.internship_start).toISOString().split('T')[0]
            : '',
          internship_end: user.internship_end
            ? new Date(user.internship_end).toISOString().split('T')[0]
            : '',
        });
      } catch (error) {
        Swal.fire('Error', 'Gagal memuat data user.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Nama Lengkap wajib diisi.';
    else if (!/^[a-zA-Z\s]+$/.test(formData.name))
      newErrors.name = 'Nama hanya boleh berisi huruf dan spasi.';
    else if (formData.name.length > 100)
      newErrors.name = 'Nama maksimal 100 karakter.';

    if (!formData.username) {
      newErrors.username = 'Username wajib diisi.';
    } else {
      const containsValidChars = /^[a-z0-9]+$/.test(formData.username);
      const containsLetter = /[a-z]/.test(formData.username);
      if (!containsValidChars || !containsLetter)
        newErrors.username =
          'Username harus kombinasi huruf kecil atau huruf kecil dengan angka, dan tidak boleh hanya angka.';
      if (formData.username.length > 20)
        newErrors.username = 'Username maksimal 20 karakter.';
    }

    if (
      formData.password &&
      (formData.password.length < 6 || formData.password.length > 10)
    )
      newErrors.password = 'Password harus memiliki 6 hingga 10 karakter.';

    if (!formData.email) newErrors.email = 'Email wajib diisi.';

    if (formData.phone) {
      if (!/^[0-9]+$/.test(formData.phone))
        newErrors.phone = 'Nomor telepon hanya boleh berisi angka.';
      else if (formData.phone.length > 13)
        newErrors.phone = 'Nomor telepon maksimal 13 digit angka.';
    }

    if (!formData.internship_start) {
      newErrors.internship_start = 'Tanggal mulai wajib diisi.';
    } else {
      const startDate = new Date(formData.internship_start + 'T00:00:00');
      if (startDate.getDay() === 0 || startDate.getDay() === 6) {
        newErrors.internship_start =
          'Tanggal mulai tidak boleh jatuh pada hari Sabtu atau Minggu.';
      }
    }

    if (!formData.internship_end) {
      newErrors.internship_end = 'Tanggal selesai wajib diisi.';
    } else {
      const endDate = new Date(formData.internship_end + 'T00:00:00');
      if (endDate.getDay() === 0 || endDate.getDay() === 6) {
        newErrors.internship_end =
          'Tanggal selesai tidak boleh jatuh pada hari Sabtu atau Minggu.';
      }
    }

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
      formData.internship_start &&
      formData.internship_end &&
      new Date(formData.internship_start) > new Date(formData.internship_end)
    ) {
      Swal.fire(
        'Error',
        'Tanggal mulai magang tidak boleh melebihi tanggal selesai.',
        'error'
      );
      return;
    }

    const { password, ...otherData } = formData;
    const payload = { ...otherData };

    if (password) {
      payload.password = password;
    } else {
      delete payload.password;
    }

    try {
      await api.put(`/users/${userId}`, payload);
      await Swal.fire('Berhasil!', 'Data peserta telah diperbarui.', 'success');
      navigate(`/peserta/${userId}`);
    } catch (error) {
      Swal.fire(
        'Gagal',
        error.response?.data?.message || 'Gagal memperbarui data.',
        'error'
      );
    }
  };

  const renderForm = () => {
    if (loading || !formData) {
      return (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      );
    }

    return (
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Nama Lengkap</Form.Label>
                  <div className="input-group has-validation">
                    <Form.Control
                      type="text"
                      name="name"
                      className="input-group-merged-input"
                      value={formData.name || ''}
                      onChange={handleChange}
                      isInvalid={!!errors.name}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="person" />
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <div className="input-group has-validation">
                    <Form.Control
                      type="text"
                      name="username"
                      className="input-group-merged-input"
                      value={formData.username || ''}
                      onChange={handleChange}
                      isInvalid={!!errors.username}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="person-badge" />
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.username}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <div className="input-group has-validation">
                    <Form.Control
                      type="email"
                      name="email"
                      className="input-group-merged-input"
                      value={formData.email || ''}
                      onChange={handleChange}
                      isInvalid={!!errors.email}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="at" />
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Ubah Password</Form.Label>
                  <div className="input-group has-validation">
                    <Form.Control
                      className="input-group-merged-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Kosongkan jika tidak ingin diubah"
                      onChange={handleChange}
                      isInvalid={!!errors.password}
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
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Telepon</Form.Label>
                  <div className="input-group has-validation">
                    <Form.Control
                      type="text"
                      name="phone"
                      className="input-group-merged-input"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      isInvalid={!!errors.phone}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="telephone" />
                    </span>
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role || 'user'}
                    onChange={handleChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Mulai Magang</Form.Label>
                  <Form.Control
                    type="date"
                    name="internship_start"
                    value={formData.internship_start || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.internship_start}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.internship_start}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Selesai Magang</Form.Label>
                  <Form.Control
                    type="date"
                    name="internship_end"
                    value={formData.internship_end || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.internship_end}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.internship_end}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <hr />

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan Perubahan
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    );
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-black mb-0">Edit Peserta</h1>
      </div>
      {renderForm()}
    </>
  );
};

export default EditUser;
