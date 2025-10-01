import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import Swal from 'sweetalert2';
import { Spinner, Button, Card } from 'react-bootstrap';
import SearchInput from '../components/SearchInput.js';
import useDataSearch from '../hooks/useDataSearch.js';

const LeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const leaveRequestFilter = useCallback((request, term) => {
    return (
      request.user_id &&
      request.user_id.name.toLowerCase().includes(term.toLowerCase())
    );
  }, []);

  const { searchTerm, setSearchTerm, filteredData } = useDataSearch(
    requests,
    leaveRequestFilter
  );

  const fetchLeaveRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/leave-requests');
      setRequests(response.data);
    } catch (error) {
      Swal.fire('Error', 'Gagal memuat data permintaan izin.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  const handleApproveLeave = (attendanceId) => {
    Swal.fire({
      title: 'Setujui Izin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, setujui',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0d6efd',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.put(`/attendance/${attendanceId}/approve-leave`);
          Swal.fire('Berhasil', 'Izin telah disetujui.', 'success');
          fetchLeaveRequests();
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menyetujui izin.', 'error');
        }
      }
    });
  };

  const handleRejectLeave = (attendanceId) => {
    Swal.fire({
      title: 'Tolak Izin?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc3545',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/attendance/${attendanceId}/reject-leave`);
          Swal.fire('Berhasil', 'Izin telah ditolak.', 'success');
          fetchLeaveRequests();
        } catch (error) {
          Swal.fire('Gagal', 'Gagal menolak izin.', 'error');
        }
      }
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      );
    }

    if (filteredData.length > 0) {
      return (
        <div>
          {filteredData.map((req) => (
            <Card key={req._id} className="shadow-sm mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h5 className="mb-1 text-black">{req.user_id.name}</h5>
                    <small className="text-muted d-block mb-2">
                      {new Date(req.date.replace(/-/g, '/')).toLocaleDateString(
                        'id-ID',
                        { weekday: 'long', day: 'numeric', month: 'long' }
                      )}
                    </small>
                    <p className="mb-0">
                      <strong>Status:</strong> {req.status}
                    </p>
                    <p className="mb-0">
                      <strong>Catatan:</strong> {req.notes}
                    </p>
                  </div>
                  <div className="d-flex flex-row align-items-center justify-content-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApproveLeave(req._id)}
                    >
                      Terima
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleRejectLeave(req._id)}
                    >
                      Tolak
                    </Button>
                    <Link
                      to={`/peserta/${req.user_id._id}/absensi/${req._id}`}
                      className="btn btn-sm btn-outline-dark"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      );
    }

    if (searchTerm) {
      return (
        <div className="card card-body text-center">
          <p className="mb-0">
            Permintaan izin dari "{searchTerm}" tidak ditemukan.
          </p>
        </div>
      );
    } else {
      return (
        <div className="card card-body text-center">
          <p className="mb-0">Tidak ada permintaan izin yang masuk.</p>
        </div>
      );
    }
  };

  return (
    <>
      <h1 className="text-black mb-4">Daftar Permintaan Izin</h1>
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Cari peserta..."
      />
      {renderContent()}
    </>
  );
};

export default LeaveRequests;
