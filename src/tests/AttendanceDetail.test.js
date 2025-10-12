import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttendanceDetail from '../pages/AttendanceDetail';
import api from '../services/api';
import Swal from 'sweetalert2';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ userId: 'user123', attendanceId: 'att1' }),
  Link: (props) => <a href={props.to}>{props.children}</a>,
}));

jest.mock('../components/Icon.js', () => {
  const MockIcon = (props) => <svg data-testid={`icon-${props.name}`} />;
  MockIcon.displayName = 'Icon';
  return MockIcon;
});

const mockUser = {
  _id: 'user123',
  name: 'Budi Santoso',
};

const mockAttendance = {
  _id: 'att1',
  date: '2025-10-08',
  status: 'Hadir',
  notes: 'Tugas Selesai',
  check_in_time: '2025-10-08T00:30:00.000Z',
  check_in_latitude: -3.3,
  check_in_longitude: 114.61,
  ip_address: '127.0.0.1',
};

describe('AttendanceDetail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockImplementation((url) => {
      if (url.includes('/attendance/')) {
        return Promise.resolve({ data: mockAttendance });
      }
      if (url.includes('/users/')) {
        return Promise.resolve({ data: mockUser });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  test('should render attendance details after successful fetch', async () => {
    render(<AttendanceDetail />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Hadir')).toBeInTheDocument();
      expect(screen.getByText(/Rabu, 8 Oktober 2025/i)).toBeInTheDocument();
      expect(screen.getByText('Tugas Selesai')).toBeInTheDocument();
    });
  });

  test('should call delete API and navigate when delete is confirmed', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    api.delete.mockResolvedValue({});

    render(<AttendanceDetail />);

    await waitFor(() =>
      expect(screen.getByTitle('Hapus Absensi')).toBeInTheDocument()
    );

    const deleteButton = screen.getByTitle('Hapus Absensi');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hapus Catatan Absensi?',
        })
      );
      expect(api.delete).toHaveBeenCalledWith('/users/user123/attendance/att1');
      expect(mockNavigate).toHaveBeenCalledWith('/peserta/user123');
    });
  });

  test('should not call delete API when delete is cancelled', async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: false });

    render(<AttendanceDetail />);

    await waitFor(() =>
      expect(screen.getByTitle('Hapus Absensi')).toBeInTheDocument()
    );

    const deleteButton = screen.getByTitle('Hapus Absensi');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalled();
    });

    expect(api.delete).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
