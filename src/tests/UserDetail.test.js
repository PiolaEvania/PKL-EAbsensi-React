import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserDetail from '../pages/UserDetail';
import api from '../services/api';
import Swal from 'sweetalert2';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ userId: 'user123' }),
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
  username: 'budi',
  email: 'budi@example.com',
  phone: '08123456789',
  internship_start: '2025-10-01',
  internship_end: '2025-10-31',
};

const mockFullAttendance = [
  { _id: 'att1', date: '2025-10-01', status: 'Hadir' },
  { _id: 'att2', date: '2025-10-02', status: 'Hadir' },
  ...Array.from({ length: 21 }, (_, i) => ({
    _id: `att${i + 3}`,
    date: `2025-10-${String(i + 3).padStart(2, '0')}`,
    status: 'Tidak Hadir',
  })),
];

const mockIncompleteAttendance = [
  { _id: 'att1', date: '2025-10-01', status: 'Hadir' },
];

describe('UserDetail Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn();
    global.URL.revokeObjectURL = jest.fn();
  });

  test('should render user and attendance data correctly after successful fetch', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({ data: mockFullAttendance });
      }
      return Promise.resolve({ data: mockUser });
    });

    render(<UserDetail />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('@budi')).toBeInTheDocument();
      expect(screen.getByText(/Total Kehadiran:/)).toBeInTheDocument();
      expect(screen.getByText(/Rabu, 1 Oktober 2025/i)).toBeInTheDocument();
    });
  });

  test('should NOT show "Buat/Lengkapi Absensi" button when attendance is complete', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({ data: mockFullAttendance });
      }
      return Promise.resolve({ data: mockUser });
    });

    render(<UserDetail />);

    await waitFor(() => {
      const generateButton = screen.queryByRole('button', {
        name: /Buat\/Lengkapi Absensi/i,
      });
      expect(generateButton).not.toBeInTheDocument();
    });
  });

  test('should SHOW "Buat/Lengkapi Absensi" button when attendance is incomplete', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/history')) {
        return Promise.resolve({ data: mockIncompleteAttendance });
      }
      return Promise.resolve({ data: mockUser });
    });

    render(<UserDetail />);

    await waitFor(() => {
      const generateButton = screen.getByRole('button', {
        name: /Buat\/Lengkapi Absensi/i,
      });
      expect(generateButton).toBeInTheDocument();
    });
  });

  test('should call Swal and api.delete when delete user button is confirmed', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockUser })
      .mockResolvedValueOnce({ data: [] });
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    api.delete.mockResolvedValue({});

    render(<UserDetail />);

    await waitFor(() =>
      expect(screen.getByTitle('Hapus Peserta')).toBeInTheDocument()
    );

    const deleteButton = screen.getByTitle('Hapus Peserta');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hapus Peserta?',
        })
      );
      expect(api.delete).toHaveBeenCalledWith('/users/user123');
      expect(mockNavigate).toHaveBeenCalledWith('/daftar-peserta');
    });
  });

  test('should call export API with "pdf" format when PDF button is clicked', async () => {
    const mockBlob = new Blob(['pdf-content'], { type: 'application/pdf' });
    api.get.mockImplementation((url) => {
      if (url.includes('/export?format=pdf')) {
        return Promise.resolve({ data: mockBlob });
      }
      if (url.includes('/history')) {
        return Promise.resolve({ data: mockFullAttendance });
      }
      return Promise.resolve({ data: mockUser });
    });

    render(<UserDetail />);
    await waitFor(() =>
      expect(screen.getByTitle('Export ke PDF')).toBeInTheDocument()
    );

    const pdfButton = screen.getByTitle('Export ke PDF');
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/users/user123/export?format=pdf',
        expect.objectContaining({ responseType: 'blob' })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  test('should call export API with "xlsx" format when Excel button is clicked', async () => {
    const mockBlob = new Blob(['excel-content'], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    api.get.mockImplementation((url) => {
      if (url.includes('/export?format=xlsx')) {
        return Promise.resolve({ data: mockBlob });
      }
      if (url.includes('/history')) {
        return Promise.resolve({ data: mockFullAttendance });
      }
      return Promise.resolve({ data: mockUser });
    });

    render(<UserDetail />);
    await waitFor(() =>
      expect(screen.getByTitle('Export ke Excel')).toBeInTheDocument()
    );

    const excelButton = screen.getByTitle('Export ke Excel');
    fireEvent.click(excelButton);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        '/users/user123/export?format=xlsx',
        expect.objectContaining({ responseType: 'blob' })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
