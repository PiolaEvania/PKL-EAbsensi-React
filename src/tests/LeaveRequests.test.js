import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeaveRequests from '../pages/LeaveRequests';
import api from '../services/api';
import Swal from 'sweetalert2';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

jest.mock('../components/SearchInput.js', () => {
  const MockSearchInput = ({ searchTerm, onSearchChange, placeholder }) => (
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      data-testid="search-input"
    />
  );
  MockSearchInput.displayName = 'SearchInput';
  return MockSearchInput;
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: (props) => <a href={props.to}>{props.children}</a>,
}));

const mockRequests = [
  {
    _id: 'req1',
    date: '2025-10-08',
    status: 'Izin',
    notes: 'Sakit',
    user_id: { _id: 'user1', name: 'Budi Santoso' },
  },
  {
    _id: 'req2',
    date: '2025-10-09',
    status: 'Izin',
    notes: 'Acara keluarga',
    user_id: { _id: 'user2', name: 'Ani Lestari' },
  },
];

describe('LeaveRequests Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render a list of leave requests after a successful API call', async () => {
    api.get.mockResolvedValue({ data: mockRequests });

    render(<LeaveRequests />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Ani Lestari')).toBeInTheDocument();
    });
  });

  test('should display "no requests" message when API returns an empty array', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(<LeaveRequests />);

    await waitFor(() => {
      expect(
        screen.getByText('Tidak ada permintaan izin yang masuk.')
      ).toBeInTheDocument();
    });
  });

  test('should filter the list when user types in the search input', async () => {
    api.get.mockResolvedValue({ data: mockRequests });
    render(<LeaveRequests />);

    await waitFor(() =>
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Ani' } });

    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
    expect(screen.getByText('Ani Lestari')).toBeInTheDocument();
  });

  test('should call approve leave API and refetch data when "Terima" is clicked and confirmed', async () => {
    api.get.mockResolvedValue({ data: mockRequests });
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    api.put.mockResolvedValue({});

    render(<LeaveRequests />);

    await waitFor(() =>
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
    );

    const approveButtons = screen.getAllByRole('button', { name: /Terima/i });
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/attendance/req1/approve-leave');
      expect(Swal.fire).toHaveBeenCalledWith(
        'Berhasil',
        'Izin telah disetujui.',
        'success'
      );
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });
});
