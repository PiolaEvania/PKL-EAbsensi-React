import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.js';
import Icon from '../Icon.js';

const Sidebar = () => {
  const { logoutAction } = useContext(AuthContext);

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-white shadow sidebar">
      <a
        href="/"
        className="d-flex align-items-center mb-md-0 me-md-auto link-dark text-decoration-none"
      >
        <h1 className="fs-5 text-center text-black">
          Sistem Informasi E-Absensi Peserta Magang
        </h1>
      </a>
      <p className="fs-6 text-center text-muted mb-0">
        Dinas Ketahanan Pangan, Pertanian dan Perikanan Kota Banjarmasin
      </p>

      <hr />

      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <NavLink
            to="/tambah-peserta"
            className="nav-link d-flex align-items-center gap-2"
          >
            <Icon name="person-plus" />
            <span>Tambah Peserta</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/daftar-peserta"
            className="nav-link d-flex align-items-center gap-2"
          >
            <Icon name="people" />
            <span>Daftar Peserta</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/arsip-peserta"
            className="nav-link d-flex align-items-center gap-2"
          >
            <Icon name="archive" />
            <span>Arsip Peserta</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/permintaan-izin"
            className="nav-link d-flex align-items-center gap-2"
          >
            <Icon name="envelope" />
            <span>Permintaan Izin</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/buat-pengumuman"
            className="nav-link d-flex align-items-center gap-2"
          >
            <Icon name="megaphone" />
            <span>Buat Pengumuman</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/daftar-pengumuman"
            className="nav-link d-flex align-items-center gap-2"
          >
            <Icon name="list-task" />
            <span>Daftar Pengumuman</span>
          </NavLink>
        </li>
      </ul>

      <hr />

      <button
        onClick={logoutAction}
        className="btn btn-danger d-flex align-items-center justify-content-center gap-2"
      >
        <Icon name="logout" />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
