import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { Spinner, Button, Card } from 'react-bootstrap';
import Icon from '../components/Icon.js';

const countWeekdays = (startDate, endDate) => {
  let count = 0;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return count;
};

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get(`/users/${userId}`);
      const attendanceRes = await api.get(
        `/users/${userId}/attendance/history`
      );
      setUser(userRes.data);
      setAttendance(attendanceRes.data);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data peserta.', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleDeleteUser = () => {
    Swal.fire({
      title: 'Hapus Peserta?',
      text: `Anda yakin ingin menghapus ${user?.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/users/${userId}`);
          await Swal.fire(
            'Berhasil!',
            `${user.name} telah dihapus.`,
            'success'
          );
          navigate('/daftar-peserta');
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menghapus peserta.', 'error');
        }
      }
    });
  };

  const handleGenerateAttendance = () => {
    Swal.fire({
      title: 'Buat Jadwal Absensi?',
      text: `Ini akan membuat semua entri absensi untuk ${user?.name}. Lanjutkan?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, buat!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post(`/users/${userId}/attendance/generate`);
          Swal.fire('Berhasil!', 'Jadwal absensi berhasil dibuat.', 'success');
          fetchUserData();
        } catch (error) {
          Swal.fire(
            'Gagal',
            error.response?.data?.message || 'Terjadi kesalahan.',
            'error'
          );
        }
      }
    });
  };

  const handleApproveLeave = (attendanceId) => {
    Swal.fire({
      title: 'Setujui Izin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, setujui',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0d6efd',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/attendance/${attendanceId}/approve-leave`);
          Swal.fire('Berhasil', 'Izin telah disetujui', 'success');
          fetchUserData();
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menyetujui izin.', 'error');
        }
      }
    });
  };

  const handleRejectLeave = (attendanceId) => {
    Swal.fire({
      title: 'Tolak Izin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc3545',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/attendance/${attendanceId}/reject-leave`);
          Swal.fire('Berhasil', 'Izin telah ditolak', 'success');
          fetchUserData();
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menolak izin.', 'error');
        }
      }
    });
  };

  const handleExport = async (format) => {
    try {
      Swal.fire({
        title: 'Mempersiapkan file...',
        text: `Mohon tunggu sebentar, laporan ${format.toUpperCase()} sedang dibuat.`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await api.get(
        `/users/${userId}/export?format=${format}`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const filename = `Laporan Absensi - ${user.name}.${format}`;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      Swal.close();
    } catch (error) {
      Swal.fire(
        'Error',
        `Gagal membuat laporan ${format.toUpperCase()}.`,
        'error'
      );
      console.error(`Export error for ${format}:`, error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      );
    }

    if (!user) {
      return <p className="text-center">Peserta tidak ditemukan.</p>;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isFinished = new Date(user.internship_end) < today;
    const expectedAttendanceCount = countWeekdays(
      user.internship_start,
      user.internship_end
    );
    const isAttendanceIncomplete =
      attendance.length !== expectedAttendanceCount;
    const presentCount = attendance.filter((a) => a.status === 'Hadir').length;

    return (
      <>
        <Card className="shadow-sm mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0 text-black">{user.name}</h2>
              <p className="text-muted mb-0">@{user.username}</p>
            </div>
            <div className="d-flex gap-2">
              <Link
                to={`/peserta/${userId}/edit`}
                className="btn btn-sm btn-outline-primary"
                title="Edit Info Peserta"
              >
                <Icon name="edit" />
              </Link>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDeleteUser}
                title="Hapus Peserta"
              >
                <Icon name="delete" />
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <p>
              <strong>Status:</strong>{' '}
              {isFinished ? (
                <span className="badge bg-secondary">Selesai</span>
              ) : (
                <span className="badge bg-success">Aktif</span>
              )}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Telepon:</strong> {user.phone || '-'}
            </p>
            <p>
              <strong>Mulai Magang:</strong>{' '}
              {new Date(user.internship_start).toLocaleDateString('id-ID')}
            </p>
            <p>
              <strong>Selesai Magang:</strong>{' '}
              {new Date(user.internship_end).toLocaleDateString('id-ID')}
            </p>
          </Card.Body>
          {isAttendanceIncomplete && (
            <Card.Footer className="bg-white d-flex flex-wrap gap-2">
              <button
                onClick={handleGenerateAttendance}
                className="btn btn-dark"
              >
                Buat/Lengkapi Absensi
              </button>
            </Card.Footer>
          )}
        </Card>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="text-black mb-0">Riwayat Absensi</h3>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">Export:</small>
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => handleExport('xlsx')}
              title="Export ke Excel"
            >
              <Icon name="excel" />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => handleExport('pdf')}
              title="Export ke PDF"
            >
              <Icon name="pdf" />
            </Button>
          </div>
        </div>
        <p className="text-muted">
          Total Kehadiran: {presentCount} dari {attendance.length} hari kerja.
        </p>

        <div className="list-group">
          {attendance.length > 0 ? (
            attendance.map((att) => (
              <div
                key={att._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <p className="mb-1 fw-bold text-black">
                    {new Date(att.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="mb-1">
                    Status: <span className="fw-semibold">{att.status}</span>
                  </p>
                  {att.notes &&
                    (att.status === 'Izin' ||
                      att.status === 'Izin Disetujui') && (
                      <small className="text-muted d-block">
                        <strong>Catatan:</strong> {att.notes}
                      </small>
                    )}
                </div>
                <div className="d-flex gap-2">
                  {att.status === 'Izin' && (
                    <>
                      <button
                        onClick={() => handleApproveLeave(att._id)}
                        className="btn btn-sm btn-primary"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => handleRejectLeave(att._id)}
                        className="btn btn-sm btn-danger"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  <Link
                    to={`/peserta/${userId}/absensi/${att._id}`}
                    className="btn btn-sm btn-outline-dark"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>Belum ada data absensi. Klik "Buat Absensi" untuk memulai.</p>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="mb-4">
        <Button
          variant="link"
          className="text-decoration-none p-0"
          onClick={() => navigate(-1)}
        >
          <h1 className="text-black mb-0 d-flex align-items-center">
            <span className="fw-bold me-2" style={{ fontSize: '1.5rem' }}>
              &lt;
            </span>
            Detail Peserta
          </h1>
        </Button>
      </div>
      {renderContent()}
    </>
  );
};

export default UserDetail;
