import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Announcement from '../pages/Announcement';
import api from '../services/api';
import Swal from 'sweetalert2';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Announcement Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = (data = {}) => {
    const defaultData = {
      content: 'Ini adalah konten pengumuman tes.',
      start_date: '2025-10-10T10:00',
      end_date: '2025-10-11T10:00',
    };
    const formData = { ...defaultData, ...data };

    fireEvent.change(screen.getByLabelText(/Isi Pengumuman/i), {
      target: { value: formData.content },
    });
    fireEvent.change(screen.getByLabelText(/Tanggal Mulai Tampil/i), {
      target: { value: formData.start_date },
    });
    fireEvent.change(screen.getByLabelText(/Tanggal Selesai Tampil/i), {
      target: { value: formData.end_date },
    });
  };

  test('should call api.post and navigate on successful submission', async () => {
    api.post.mockResolvedValue({});
    Swal.fire.mockResolvedValue({});

    render(<Announcement />);
    fillForm();

    const submitButton = screen.getByRole('button', {
      name: /Terbitkan Pengumuman/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/announcements', {
        content: 'Ini adalah konten pengumuman tes.',
        start_date: '2025-10-10T10:00',
        end_date: '2025-10-11T10:00',
      });
      expect(Swal.fire).toHaveBeenCalledWith(
        'Berhasil!',
        'Pengumuman baru telah dibuat.',
        'success'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/daftar-pengumuman');
    });
  });

  test('should show an error if a required field is empty on submit', async () => {
    render(<Announcement />);
    fillForm({ content: '' });

    const submitButton = screen.getByRole('button', {
      name: /Terbitkan Pengumuman/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'Semua kolom wajib diisi.',
        'error'
      );
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
