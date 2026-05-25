import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false, loading: false };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    default: return state;
  }
};

const initialState = {
  user: JSON.parse(localStorage.getItem('shUser')) || null,
  token: localStorage.getItem('shToken') || null,
  isAuthenticated: !!localStorage.getItem('shToken'),
  loading: false,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth header when token changes
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('shToken', state.token);
      localStorage.setItem('shUser', JSON.stringify(state.user));
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('shToken');
      localStorage.removeItem('shUser');
    }
  }, [state.token, state.user]);

  const register = async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.post('/auth/register', data);
      dispatch({ type: 'REGISTER_SUCCESS', payload: res.data });
      toast.success('Registration successful! Welcome to StudentHub 🎉');
      return { success: true, role: res.data.user.role };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const login = async (data) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await api.post('/auth/login', data);
      dispatch({ type: 'LOGIN_SUCCESS', payload: res.data });
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}! 👋`);
      return { success: true, role: res.data.user.role };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
    localStorage.setItem('shUser', JSON.stringify({ ...state.user, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ ...state, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
