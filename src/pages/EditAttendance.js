import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import {
  OFFICE_COORDINATES,
  GEOFENCE_RADIUS_METERS,
  getDistanceFromLatLonInMeters,
} from '../utils/location.js';

const EditAttendance = () => {
  const { userId, attendanceId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, attendanceRes] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/users/${userId}/attendance/${attendanceId}`),
        ]);

        setUser(userRes.data);
        setFormData({
          ...attendanceRes.data,
          date: attendanceRes.data.date,
          check_in_time: formatDateTimeLocal(attendanceRes.data.check_in_time),
        });
      } catch (error) {
        Swal.fire('Error', 'Gagal memuat data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, attendanceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      const selectedDate = new Date(value.replace(/-/g, '/'));
      const day = selectedDate.getDay();

      if (day === 0 || day === 6) {
        Swal.fire({
          icon: 'error',
          title: 'Tanggal Tidak Valid',
          text: 'Anda tidak bisa memilih hari Sabtu atau Minggu.',
        });
        return;
      }
    }

    let updatedData = { ...formData, [name]: value };

    const lat = updatedData.check_in_latitude;
    const lon = updatedData.check_in_longitude;

    const isCoordinateChange =
      name === 'check_in_latitude' || name === 'check_in_longitude';
    const isStatusManuallyChangedToHadir =
      name === 'status' && value === 'Hadir';

    const isStatusOverridable =
      !['Izin', 'Izin Disetujui'].includes(formData.status) ||
      isStatusManuallyChangedToHadir;

    if (
      (isCoordinateChange && isStatusOverridable) ||
      isStatusManuallyChangedToHadir
    ) {
      if (lat && lon) {
        const distance = getDistanceFromLatLonInMeters(
          parseFloat(lat),
          parseFloat(lon),
          OFFICE_COORDINATES.latitude,
          OFFICE_COORDINATES.longitude
        );

        updatedData.status =
          distance > GEOFENCE_RADIUS_METERS ? 'Di Luar Area' : 'Hadir';
      }
    }
    setFormData(updatedData);
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.date) {
      if (user && user.internship_start && user.internship_end) {
        const startDateStr = new Date(user.internship_start)
          .toISOString()
          .split('T')[0];
        const endDateStr = new Date(user.internship_end)
          .toISOString()
          .split('T')[0];

        if (formData.date < startDateStr || formData.date > endDateStr) {
          newErrors.date = 'Tanggal absen harus dalam rentang magang.';
        }
      }
    } else {
      newErrors.date = 'Tanggal absen wajib diisi.';
    }

    if (formData.check_in_time) {
      const checkInDateStr = formData.check_in_time.split('T')[0];
      if (checkInDateStr !== formData.date) {
        newErrors.check_in_time =
          'Tanggal check-in harus sama dengan tanggal absen.';
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

    const payload = {
      ...formData,
      check_in_latitude: formData.check_in_latitude || null,
      check_in_longitude: formData.check_in_longitude || null,
      check_in_time: formData.check_in_time
        ? new Date(formData.check_in_time).toISOString()
        : null,
      notes: formData.notes || null,
    };

    try {
      await api.put(`/users/${userId}/attendance/${attendanceId}`, payload);
      await Swal.fire('Berhasil!', 'Data absensi telah diperbarui.', 'success');
      navigate(`/peserta/${userId}`);
    } catch (error) {
      Swal.fire(
        'Gagal',
        error.response?.data?.message || 'Gagal memperbarui absensi.',
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
        <Card.Header>
          Tanggal:{' '}
          {new Date(formData.date.replace(/-/g, '/')).toLocaleDateString(
            'id-ID',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }
          )}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Tanggal Absen</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.date}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.date}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Waktu Check-in</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="check_in_time"
                    value={formData.check_in_time || ''}
                    onChange={handleChange}
                    isInvalid={!!errors.check_in_time}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.check_in_time}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    name="check_in_latitude"
                    placeholder={String(OFFICE_COORDINATES.latitude)}
                    value={
                      formData.check_in_latitude ||
                      String(OFFICE_COORDINATES.latitude)
                    }
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="any"
                    name="check_in_longitude"
                    placeholder={String(OFFICE_COORDINATES.longitude)}
                    value={
                      formData.check_in_longitude ||
                      String(OFFICE_COORDINATES.longitude)
                    }
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Status Absensi</Form.Label>
              <Form.Select
                name="status"
                value={formData.status || 'Tidak Hadir'}
                onChange={handleChange}
              >
                <option value="Hadir">Hadir</option>
                <option value="Tidak Hadir">Tidak Hadir</option>
                <option value="Di Luar Area">Di Luar Area</option>
                <option value="Izin">Izin</option>
                <option value="Izin Disetujui">Izin Disetujui</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Status akan otomatis menjadi "Di Luar Area" jika koordinat di
                luar radius kantor.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Catatan (Notes)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
              />
            </Form.Group>
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
        <h1 className="text-black mb-0">Edit Absensi</h1>
      </div>
      {renderForm()}
    </>
  );
};

export default EditAttendance;
