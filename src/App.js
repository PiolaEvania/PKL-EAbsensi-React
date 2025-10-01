import React, { useContext } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext.js';
import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import UserList from './pages/UserList.js';
import ArchiveList from './pages/ArchiveList.js';
import AddUser from './pages/AddUser.js';
import UserDetail from './pages/UserDetail.js';
import Announcement from './pages/Announcement.js';
import AnnouncementsList from './pages/AnnouncementsList.js';
import EditUser from './pages/EditUser.js';
import AttendanceDetail from './pages/AttendanceDetail.js';
import EditAttendance from './pages/EditAttendance.js';
import LeaveRequests from './pages/LeaveRequests.js';

const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Dashboard>
              <Routes>
                <Route path="/tambah-peserta" element={<AddUser />} />
                <Route path="/daftar-peserta" element={<UserList />} />
                <Route path="/peserta/:userId" element={<UserDetail />} />
                <Route path="/arsip-peserta" element={<ArchiveList />} />
                <Route path="/buat-pengumuman" element={<Announcement />} />
                <Route
                  path="/daftar-pengumuman"
                  element={<AnnouncementsList />}
                />
                <Route path="/peserta/:userId/edit" element={<EditUser />} />
                <Route
                  path="/peserta/:userId/absensi/:attendanceId"
                  element={<AttendanceDetail />}
                />
                <Route
                  path="/peserta/:userId/absensi/:attendanceId/edit"
                  element={<EditAttendance />}
                />
                <Route path="/permintaan-izin" element={<LeaveRequests />} />
                <Route path="*" element={<Navigate to="/daftar-peserta" />} />
              </Routes>
            </Dashboard>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
