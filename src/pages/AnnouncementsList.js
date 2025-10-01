import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);

  const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  };

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/announcements/active?timestamp=${new Date().getTime()}`
      );
      setAnnouncements(response.data);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data pengumuman.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleDelete = (announcement) => {
    Swal.fire({
      title: 'Hapus Pengumuman?',
      text: `Anda yakin ingin menghapus pengumuman ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/announcements/${announcement._id}`);
          Swal.fire('Berhasil!', 'Pengumuman telah dihapus.', 'success');
          fetchAnnouncements();
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menghapus pengumuman.', 'error');
        }
      }
    });
  };

  const handleOpenEditModal = (announcement) => {
    setCurrentAnnouncement({
      ...announcement,
      start_date: formatDateTimeLocal(announcement.start_date),
      end_date: formatDateTimeLocal(announcement.end_date),
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setCurrentAnnouncement({
      ...currentAnnouncement,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/announcements/${currentAnnouncement._id}`, {
        content: currentAnnouncement.content,
        start_date: currentAnnouncement.start_date,
        end_date: currentAnnouncement.end_date,
      });
      setShowEditModal(false);
      Swal.fire('Berhasil!', 'Pengumuman berhasil diperbarui.', 'success');
      fetchAnnouncements();
    } catch (error) {
      Swal.fire('Gagal', 'Gagal memperbarui pengumuman.', 'error');
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

    if (announcements.length === 0) {
      return (
        <div className="card card-body text-center">
          <p className="mb-0">
            Tidak ada pengumuman yang sedang aktif saat ini.
          </p>
        </div>
      );
    }

    return (
      <div className="list-group">
        {announcements.map((ann) => (
          <div key={ann._id} className="list-group-item">
            <div className="d-flex w-100 justify-content-between">
              <p className="mb-1" style={{ whiteSpace: 'pre-wrap' }}>
                {ann.content}
              </p>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleOpenEditModal(ann)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(ann)}
                >
                  Hapus
                </Button>
              </div>
            </div>
            <small className="text-muted">
              Aktif dari {new Date(ann.start_date).toLocaleString('id-ID')} s/d{' '}
              {new Date(ann.end_date).toLocaleString('id-ID')}
            </small>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <h1 className="text-black mb-4">Daftar Pengumuman Aktif</h1>
      {renderContent()}

      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Pengumuman</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Isi Pengumuman</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="content"
                value={currentAnnouncement?.content || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mulai Tampil</Form.Label>
              <Form.Control
                type="datetime-local"
                name="start_date"
                value={currentAnnouncement?.start_date || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Selesai Tampil</Form.Label>
              <Form.Control
                type="datetime-local"
                name="end_date"
                value={currentAnnouncement?.end_date || ''}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Perubahan
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AnnouncementsList;
