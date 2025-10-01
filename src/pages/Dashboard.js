import React from 'react';
import Sidebar from '../components/layout/Sidebar.js';
import AnnouncementPopup from '../components/AnnouncementPopup.js';

const Dashboard = ({ children }) => {
  return (
    <div className="d-flex">
      <div className="sidebar-container">
        <Sidebar />
      </div>
      <main className="content-container flex-grow-1 p-4">
        <AnnouncementPopup />
        {children}
      </main>
    </div>
  );
};

export default Dashboard;
