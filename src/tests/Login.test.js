import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from '../pages/Login';
import api from '../services/api';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';

jest.mock('../services/api.js');
jest.mock('sweetalert2');
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('../components/Icon.js', () => {
  const MockIcon = (props) => <svg data-testid={`icon-${props.name}`} />;
  MockIcon.displayName = 'Icon';
  return MockIcon;
});

const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

const mockLoginAction = jest.fn();
const renderLoginComponent = () => {
  return render(
    <AuthContext.Provider value={{ loginAction: mockLoginAction }}>
      <Login />
    </AuthContext.Provider>
  );
};

describe('Login Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should call loginAction and remove session item on successful admin login', async () => {
    const mockAdminResponse = {
      data: {
        token: 'fake-admin-token',
        user: { id: '1', name: 'Admin User', role: 'admin' },
      },
    };
    api.post.mockResolvedValue(mockAdminResponse);

    const removeItemSpy = jest.spyOn(sessionStorage, 'removeItem');

    renderLoginComponent();
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'admin1' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/login', {
        username: 'admin1',
        password: 'password123',
      });
      expect(removeItemSpy).toHaveBeenCalledWith('announcementsShown');
      expect(mockLoginAction).toHaveBeenCalledWith(
        mockAdminResponse.data.user,
        mockAdminResponse.data.token
      );
    });
  });

  test('should show an error alert if the logged-in user is not an admin', async () => {
    const mockUserResponse = {
      data: {
        token: 'fake-user-token',
        user: { id: '2', name: 'Regular User', role: 'user' },
      },
    };
    api.post.mockResolvedValue(mockUserResponse);

    renderLoginComponent();
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Gagal',
        'Halaman ini hanya untuk admin.',
        'error'
      );
      expect(mockLoginAction).not.toHaveBeenCalled();
    });
  });

  test('should show an error alert on login failure from API', async () => {
    const apiError = { response: { data: { message: 'Invalid credentials' } } };
    api.post.mockRejectedValue(apiError);

    renderLoginComponent();
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: 'admin1' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        'Login Gagal',
        'Invalid credentials',
        'error'
      );
    });
  });

  test('should toggle password visibility when eye icon is clicked', () => {
    renderLoginComponent();
    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleButton = screen.getByRole('button', { name: '' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
