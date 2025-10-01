import React, { useState } from 'react';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const formatDateTimeLocal = (date) => {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const Announcement = () => {
  const navigate = useNavigate();

  const getStartDateDefault = () => {
    const date = new Date();
    date.setHours(date.getHours() - 1);
    return formatDateTimeLocal(date);
  };

  const [formData, setFormData] = useState({
    content: '',
    start_date: getStartDateDefault(),
    end_date: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content || !formData.start_date || !formData.end_date) {
      Swal.fire('Error', 'Semua kolom wajib diisi.', 'error');
      return;
    }

    try {
      await api.post('/announcements', formData);
      Swal.fire('Berhasil!', 'Pengumuman baru telah dibuat.', 'success');
      navigate('/daftar-pengumuman');
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
      <h1 className="text-black mb-4">Buat Pengumuman Baru</h1>
      <div className="card p-4 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="content" className="form-label text-black">
                Isi Pengumuman
              </label>
              <textarea
                className="form-control"
                id="content"
                name="content"
                rows="4"
                value={formData.content}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="start_date" className="form-label text-black">
                  Tanggal Mulai Tampil
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="end_date" className="form-label text-black">
                  Tanggal Selesai Tampil
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-2">
              <button type="submit" className="btn btn-primary">
                Terbitkan Pengumuman
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Announcement;
