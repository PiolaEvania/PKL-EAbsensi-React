import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditAttendance from '../pages/EditAttendance';
import api from '../services/api';
import Swal from 'sweetalert2';
import * as locationUtils from '../utils/location.js';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ userId: 'user123', attendanceId: 'att1' }),
}));

const mockAttendance = {
  _id: 'att1',
  date: '2025-10-10',
  status: 'Tidak Hadir',
  notes: 'Catatan awal',
  check_in_time: null,
  check_in_latitude: null,
  check_in_longitude: null,
};

describe('EditAttendance Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: mockAttendance });
  });

  test('should pre-fill the form with attendance data after fetch', async () => {
    const { container } = render(<EditAttendance />);

    await waitFor(() => {
      const dateInput = container.querySelector('input[name="date"]');
      const statusSelect = container.querySelector('select[name="status"]');
      const notesTextarea = container.querySelector('textarea[name="notes"]');

      expect(dateInput).toHaveValue('2025-10-10');
      expect(statusSelect).toHaveValue('Tidak Hadir');
      expect(notesTextarea).toHaveValue('Catatan awal');
    });
  });

  test('should call api.put with updated data on submit', async () => {
    api.put.mockResolvedValue({});
    Swal.fire.mockResolvedValue({});

    const { container } = render(<EditAttendance />);

    await waitFor(() =>
      expect(container.querySelector('input[name="date"]')).toBeInTheDocument()
    );

    const notesInput = container.querySelector('textarea[name="notes"]');
    fireEvent.change(notesInput, { target: { value: 'Catatan baru.' } });

    const statusSelect = container.querySelector('select[name="status"]');
    fireEvent.change(statusSelect, { target: { value: 'Izin' } });

    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/users/user123/attendance/att1',
        expect.objectContaining({
          notes: 'Catatan baru.',
          status: 'Izin',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/peserta/user123');
    });
  });

  test('should show a validation error if a weekend date is selected', async () => {
    const { container } = render(<EditAttendance />);
    await waitFor(() =>
      expect(container.querySelector('input[name="date"]')).toBeInTheDocument()
    );

    const dateInput = container.querySelector('input[name="date"]');
    fireEvent.change(dateInput, { target: { value: '2025-10-11' } });

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tanggal Tidak Valid',
        })
      );
    });
  });

  test('should automatically change status to "Di Luar Area" if coordinates are outside radius', async () => {
    jest
      .spyOn(locationUtils, 'getDistanceFromLatLonInMeters')
      .mockReturnValue(200);

    const { container } = render(<EditAttendance />);
    await waitFor(() =>
      expect(
        container.querySelector('select[name="status"]')
      ).toBeInTheDocument()
    );

    const statusSelect = container.querySelector('select[name="status"]');
    const latitudeInput = container.querySelector(
      'input[name="check_in_latitude"]'
    );
    const longitudeInput = container.querySelector(
      'input[name="check_in_longitude"]'
    );

    fireEvent.change(latitudeInput, { target: { value: '-3.4' } });
    fireEvent.change(longitudeInput, { target: { value: '114.7' } });
    fireEvent.change(statusSelect, { target: { value: 'Hadir' } });

    expect(statusSelect).toHaveValue('Di Luar Area');
  });
});
