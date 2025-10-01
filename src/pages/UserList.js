import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import SearchInput from '../components/SearchInput.js';
import useDataSearch from '../hooks/useDataSearch.js';
import { Spinner } from 'react-bootstrap';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userFilter = useCallback((user, term) => {
    return (
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      user.username.toLowerCase().includes(term.toLowerCase())
    );
  }, []);

  const { searchTerm, setSearchTerm, filteredData } = useDataSearch(
    users,
    userFilter
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users?status=active');
        setUsers(response.data);
      } catch (error) {
        console.error('Gagal mengambil data peserta:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="card card-body text-center">
          <p className="mb-0">Belum ada peserta aktif yang terdaftar.</p>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="card card-body text-center">
          <p className="mb-0">
            Peserta dengan nama atau username "{searchTerm}" tidak ditemukan.
          </p>
        </div>
      );
    }

    return (
      <div>
        {filteredData.map((user) => (
          <div key={user._id} className="card shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 text-black">{user.name}</h5>
                  <small className="text-muted">@{user.username}</small>
                </div>
                <Link
                  to={`/peserta/${user._id}`}
                  className="btn btn-sm btn-outline-primary"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <h1 className="text-black mb-4">Daftar Peserta Aktif</h1>
      <SearchInput
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Cari peserta..."
      />
      {renderContent()}
    </>
  );
};

export default UserList;
