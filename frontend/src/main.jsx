import { createRoot } from 'react-dom/client';
import './normalize.css';
import './index.css';
import App from './App.jsx';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Durante desarrollo eliminamos Service Workers antiguos para evitar que
// Chrome sirva chunks obsoletos y deje rutas del dashboard en blanco.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((registrations) => Promise.all(registrations.map((item) => item.unregister())))
    .catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <App />
    <ToastContainer position="top-right" />
  </AppErrorBoundary>,
);
