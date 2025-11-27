import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { Card, Spinner, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import Icon from '../components/Icon.js';

const AttendanceDetail = () => {
  const { userId, attendanceId } = useParams();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const attendanceRes = await api.get(
          `/users/${userId}/attendance/${attendanceId}`
        );
        setAttendance(attendanceRes.data);
        const userRes = await api.get(`/users/${userId}`);
        setUser(userRes.data);
      } catch (error) {
        console.error('Gagal mengambil detail', error);
      }
    };
    fetchDetails();
  }, [userId, attendanceId]);

  const handleDeleteAttendance = () => {
    Swal.fire({
      title: 'Hapus Catatan Absensi?',
      text: 'Anda yakin ingin menghapus data absensi ini? Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${userId}/attendance/${attendanceId}`);
          await Swal.fire(
            'Berhasil',
            'Catatan absensi telah dihapus.',
            'success'
          );
          navigate(`/peserta/${userId}`);
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menghapus catatan absensi.', 'error');
        }
      }
    });
  };

  return (
    <>
      <div className="mb-4">
        <Button
          variant="link"
          className="back-button text-decoration-none p-0"
          onClick={() => navigate(-1)}
        >
          <h1 className="text-black mb-0 d-flex align-items-center">
            <Icon name="chevron-left" className="me-2" />
            Detail Absensi
          </h1>
        </Button>
      </div>

      {!attendance || !user ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <Card className="shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0">{user.name}</h5>
              <small className="text-muted">
                {new Date(attendance.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </small>
            </div>
            <div className="d-flex gap-2">
              <Link
                to={`/peserta/${userId}/absensi/${attendanceId}/edit`}
                className="btn btn-sm btn-outline-primary"
                title="Edit Absensi"
              >
                <Icon name="edit" />
              </Link>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDeleteAttendance}
                title="Hapus Absensi"
              >
                <Icon name="delete" />
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <p>
              <strong>Status:</strong> {attendance.status}
            </p>
            <p>
              <strong>Waktu Check-in:</strong>{' '}
              {attendance.check_in_time
                ? new Date(attendance.check_in_time).toLocaleString('id-ID', {
                    timeZone: 'Asia/Makassar',
                  })
                : '-'}
            </p>
            <p>
              <strong>Lokasi:</strong>{' '}
              {attendance.check_in_latitude
                ? `${attendance.check_in_latitude}, ${attendance.check_in_longitude}`
                : '-'}
            </p>
            <p>
              <strong>IP Address:</strong> {attendance.ip_address || '-'}
            </p>
            <p>
              <strong>Android ID:</strong> {attendance.android_id || '-'}
            </p>
            <p>
              <strong>Catatan:</strong> {attendance.notes || '-'}
            </p>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default AttendanceDetail;
