import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    // Connect to socket server
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      // Join user's personal room for private notifications
      socket.emit('joinRoom', user._id);
    });

    socket.on('notification', (data) => {
      const icons = {
        enrollment: '🎓',
        review: '⭐',
        payment_success: '💳',
        certificate: '🏆',
        course_approved: '✅',
        course_rejected: '❌',
        system: '🔔',
      };
      const icon = icons[data.type] || '🔔';
      toast(`${icon} ${data.message}`, {
        duration: 5000,
        style: { borderLeft: '4px solid #0ea5e9' },
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  return socketRef.current;
};
