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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      name="name"
                      className="input-group-merged-input"
                      value={formData.name || ''}
                      onChange={handleChange}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="person" />
                    </span>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Username</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      name="username"
                      className="input-group-merged-input"
                      value={formData.username || ''}
                      onChange={handleChange}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="person-badge" />
                    </span>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="email"
                      name="email"
                      className="input-group-merged-input"
                      value={formData.email || ''}
                      onChange={handleChange}
                    />
                    <span className="input-group-text input-group-text-merged">
                      <Icon name="at" />
                    </span>{' '}
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Ubah Password</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      className="input-group-merged-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Kosongkan jika tidak ingin diubah"
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
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Telepon</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      name="phone"
                      className="input-group-text input-group-merged-input"
                      value={formData.phone || ''}
                      onChange={handleChange}
                    />
                    <span className="input-group-text-merged">
                      <Icon name="telephone" />
                    </span>
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
                  />
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
                  />
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
