import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditUser from '../pages/EditUser';
import api from '../services/api';
import Swal from 'sweetalert2';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ userId: 'user123' }),
}));

jest.mock('../components/Icon.js', () => {
  const MockIcon = (props) => <svg data-testid={`icon-${props.name}`} />;
  MockIcon.displayName = 'Icon';
  return MockIcon;
});

const mockUser = {
  _id: 'user123',
  name: 'Initial Name',
  username: 'initialuser',
  email: 'initial@example.com',
  phone: '0812345',
  role: 'user',
  internship_start: '2025-10-01',
  internship_end: '2025-10-31',
};

describe('EditUser Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockUser });
  });

  test('should pre-fill the form with user data after successful fetch', async () => {
    const { container } = render(<EditUser />);

    await waitFor(() => {
      const nameInput = container.querySelector('input[name="name"]');
      expect(nameInput).toHaveValue('Initial Name');
    });
  });

  test('should call api.put with updated data and navigate on successful submission', async () => {
    api.put.mockResolvedValue({});
    Swal.fire.mockResolvedValue({});

    const { container } = render(<EditUser />);

    await waitFor(() => {
      const nameInput = container.querySelector('input[name="name"]');
      expect(nameInput).toHaveValue('Initial Name');
    });

    const nameInput = container.querySelector('input[name="name"]');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/users/user123',
        expect.objectContaining({ name: 'Updated Name' })
      );
      expect(Swal.fire).toHaveBeenCalledWith(
        'Berhasil!',
        'Data peserta telah diperbarui.',
        'success'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/peserta/user123');
    });
  });

  test('should show a date validation error if end date is before start date', async () => {
    const { container } = render(<EditUser />);

    await waitFor(() => {
      const nameInput = container.querySelector('input[name="name"]');
      expect(nameInput).toBeInTheDocument();
    });

    const startDateInput = container.querySelector(
      'input[name="internship_start"]'
    );
    const endDateInput = container.querySelector(
      'input[name="internship_end"]'
    );

    fireEvent.change(startDateInput, { target: { value: '2025-12-01' } });
    fireEvent.change(endDateInput, { target: { value: '2025-11-01' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Error',
        'Tanggal mulai magang tidak boleh melebihi tanggal selesai.',
        'error'
      );
      expect(api.put).not.toHaveBeenCalled();
    });
  });
});
