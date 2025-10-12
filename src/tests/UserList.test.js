import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from '../pages/UserList'; // Sesuaikan path ke komponen
import api from '../services/api';

jest.mock('../services/api.js');

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

describe('UserList Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should display a loading spinner on initial render', () => {
    api.get.mockResolvedValue({ data: [] });

    const { container } = render(<UserList />);

    const spinner = container.querySelector('.spinner-border');
    expect(spinner).toBeInTheDocument();
  });

  test('should render a list of users after a successful API call', async () => {
    const mockUsers = [
      { _id: '1', name: 'Budi Santoso', username: 'budi' },
      { _id: '2', name: 'Ani Lestari', username: 'ani' },
    ];
    api.get.mockResolvedValue({ data: mockUsers });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
      expect(screen.getByText('Ani Lestari')).toBeInTheDocument();
    });
  });

  test('should display "no participants" message when API returns an empty array', async () => {
    api.get.mockResolvedValue({ data: [] });
    render(<UserList />);

    await waitFor(() => {
      expect(
        screen.getByText('Belum ada peserta aktif yang terdaftar.')
      ).toBeInTheDocument();
    });
  });

  test('should display "not found" message when search yields no results', async () => {
    const mockUsers = [{ _id: '1', name: 'Budi Santoso', username: 'budi' }];
    api.get.mockResolvedValue({ data: mockUsers });
    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Charlie' } });

    expect(
      screen.getByText(
        /Peserta dengan nama atau username "Charlie" tidak ditemukan./i
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
  });
});
