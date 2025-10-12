import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnnouncementsList from '../pages/AnnouncementsList';
import api from '../services/api';
import Swal from 'sweetalert2';

jest.mock('../services/api.js');
jest.mock('sweetalert2');

const mockAnnouncements = [
  {
    _id: 'ann1',
    content: 'Ini adalah pengumuman pertama.',
    start_date: '2025-10-01T10:00:00.000Z',
    end_date: '2025-10-31T10:00:00.000Z',
  },
  {
    _id: 'ann2',
    content: 'Ini adalah pengumuman kedua.',
    start_date: '2025-11-01T10:00:00.000Z',
    end_date: '2025-11-30T10:00:00.000Z',
  },
];

describe('AnnouncementsList Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render a list of announcements after a successful API call', async () => {
    api.get.mockResolvedValue({ data: mockAnnouncements });
    render(<AnnouncementsList />);

    await waitFor(() => {
      expect(
        screen.getByText('Ini adalah pengumuman pertama.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Ini adalah pengumuman kedua.')
      ).toBeInTheDocument();
    });
  });

  test('should call delete API and refetch data when delete is confirmed', async () => {
    api.get.mockResolvedValue({ data: mockAnnouncements });
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    api.delete.mockResolvedValue({});

    render(<AnnouncementsList />);

    await waitFor(() =>
      expect(
        screen.getByText('Ini adalah pengumuman pertama.')
      ).toBeInTheDocument()
    );

    const deleteButtons = screen.getAllByRole('button', { name: /Hapus/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/announcements/ann1');
      expect(Swal.fire).toHaveBeenCalledWith(
        'Berhasil!',
        'Pengumuman telah dihapus.',
        'success'
      );
      expect(api.get).toHaveBeenCalledTimes(2);
    });
  });

  test('should open edit modal with pre-filled data when edit button is clicked', async () => {
    api.get.mockResolvedValue({ data: mockAnnouncements });
    render(<AnnouncementsList />);
    await waitFor(() =>
      expect(
        screen.getByText('Ini adalah pengumuman pertama.')
      ).toBeInTheDocument()
    );

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('content-input')).toHaveValue(
        'Ini adalah pengumuman pertama.'
      );
    });
  });

  test('should call update API when edit form is submitted', async () => {
    api.get.mockResolvedValue({ data: mockAnnouncements });
    Swal.fire.mockResolvedValue({});
    api.put.mockResolvedValue({});
    render(<AnnouncementsList />);

    await waitFor(() =>
      expect(
        screen.getByText('Ini adalah pengumuman pertama.')
      ).toBeInTheDocument()
    );

    const editButtons = screen.getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const contentInput = screen.getByTestId('content-input');
    fireEvent.change(contentInput, { target: { value: 'Konten diperbarui.' } });

    const saveButton = screen.getByRole('button', {
      name: /Simpan Perubahan/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/announcements/ann1',
        expect.objectContaining({ content: 'Konten diperbarui.' })
      );
      expect(Swal.fire).toHaveBeenCalledWith(
        'Berhasil!',
        'Pengumuman berhasil diperbarui.',
        'success'
      );
    });
  });
});
