import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const loginAction = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    navigate('/dashboard');
  };

  const logoutAction = () => {
    Swal.fire({
      title: 'Anda yakin ingin logout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0d6efd',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Ya, logout!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
      }
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loginAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
};
