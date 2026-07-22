import { io } from 'socket.io-client';
import useAuthStore from '../context/storeAuth';

let socket;

export const getSocket = () => {
  const token = useAuthStore.getState().token;

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 700,
    });
  }

  socket.auth = { token };

  if (!socket.connected && token) {
    socket.connect();
  }

  return socket;
};

export const disconnectSocket = () => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = undefined;
};
