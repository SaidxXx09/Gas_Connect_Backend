import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ConfirmEmail from './pages/ConfirmEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Estas dos pantallas se cargan directamente para evitar páginas blancas
// causadas por chunks antiguos almacenados por la PWA durante el desarrollo.
import RealtimeChat from './pages/dashboard/RealtimeChat';
import AiAssistant from './pages/dashboard/AiAssistant';

const Overview = lazy(() => import('./pages/dashboard/Overview'));
const Orders = lazy(() => import('./pages/dashboard/Orders'));
const OrderDetail = lazy(() => import('./pages/dashboard/OrderDetail'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Users = lazy(() => import('./pages/dashboard/Users'));
const Payments = lazy(() => import('./pages/dashboard/Payments'));

const Loader = () => (
  <div className="app-loader">
    <span className="app-loader__flame">🔥</span>
    <p>Cargando GasConnect...</p>
  </div>
);

function App() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="confirm" element={<ConfirmEmail />} />
          <Route path="confirm/:token" element={<ConfirmEmail />} />
          <Route path="forgot" element={<ForgotPassword />} />
          <Route path="reset" element={<ResetPassword />} />

          <Route
            path="dashboard"
            element={(
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            )}
          >
            <Route index element={<Overview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="messages" element={<RealtimeChat />} />
            <Route path="messages/:orderId" element={<RealtimeChat />} />
            <Route path="assistant" element={<AiAssistant />} />
            <Route path="profile" element={<Profile />} />
            <Route path="payments" element={<Payments />} />
            <Route path="users" element={<Users />} />
          </Route>

          <Route path="crud" element={<Navigate to="/dashboard/orders" replace />} />
          <Route path="create" element={<Navigate to="/dashboard/orders" replace />} />
          <Route path="read" element={<Navigate to="/dashboard/orders" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
