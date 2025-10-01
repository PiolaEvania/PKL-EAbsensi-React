import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { Modal, Button } from 'react-bootstrap';

const AnnouncementPopup = () => {
  const [show, setShow] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('announcementsShown');

    if (!hasBeenShown) {
      const fetchAnnouncements = async () => {
        try {
          const response = await api.get('/announcements/active');
          if (response.data && response.data.length > 0) {
            setAnnouncements(response.data);
            setShow(true);
          }
        } catch (error) {
          console.error('Gagal memuat pengumuman:', error);
        } finally {
          sessionStorage.setItem('announcementsShown', 'true');
        }
      };

      fetchAnnouncements();
    }
  }, []);

  const handleClose = () => setShow(false);

  if (!show) {
    return null;
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Pengumuman</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {announcements.map((ann) => (
          <div key={ann._id} className="mb-3">
            <p style={{ whiteSpace: 'pre-wrap' }}>{ann.content}</p>
            <small className="text-muted">
              Berlaku hingga: {new Date(ann.end_date).toLocaleString('id-ID')}
            </small>
            <hr />
          </div>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Tutup
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AnnouncementPopup;
