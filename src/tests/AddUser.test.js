import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddUser from '../pages/AddUser';
import api from '../services/api';
import Swal from 'sweetalert2';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));
jest.mock('../services/api.js');
jest.mock('sweetalert2');

jest.mock('../components/Icon.js', () => {
  const MockIcon = (props) => <svg data-testid={`icon-${props.name}`} />;
  MockIcon.displayName = 'Icon';
  return MockIcon;
});

describe('AddUser Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = (data = {}) => {
    const defaultData = {
      name: 'Budi Santoso',
      username: 'budisan',
      email: 'budi@example.com',
      password: 'password123',
      internship_start: '2025-10-01',
      internship_end: '2025-12-01',
    };
    const formData = { ...defaultData, ...data };

    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: formData.name },
    });
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: formData.username },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: formData.email },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: formData.password },
    });
    fireEvent.change(screen.getByLabelText(/Tanggal Mulai Magang/i), {
      target: { value: formData.internship_start },
    });
    fireEvent.change(screen.getByLabelText(/Tanggal Selesai Magang/i), {
      target: { value: formData.internship_end },
    });
  };

  test('should call api.post and navigate on successful submission', async () => {
    api.post.mockResolvedValue({});
    Swal.fire.mockResolvedValue({});

    render(<AddUser />);
    fillForm();

    const saveButton = screen.getByRole('button', { name: /Simpan Peserta/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users', expect.any(Object));
      expect(Swal.fire).toHaveBeenCalledWith(
        'Berhasil!',
        expect.any(String),
        'success'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/daftar-peserta');
    });
  });

  test('should show an error if a required field is empty', async () => {
    render(<AddUser />);

    fillForm({ name: '' });

    const saveButton = screen.getByRole('button', { name: /Simpan Peserta/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'Semua kolom wajib diisi, kecuali telepon.',
        'error'
      );
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  test('should show a date validation error if end date is before start date', async () => {
    render(<AddUser />);

    fillForm({
      internship_start: '2025-12-01',
      internship_end: '2025-11-01',
    });

    const saveButton = screen.getByRole('button', { name: /Simpan Peserta/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'Tanggal mulai magang tidak boleh melebihi tanggal selesai.',
        'error'
      );
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
