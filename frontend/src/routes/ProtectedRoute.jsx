import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../context/storeAuth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user?.emailConfirmed === false) {
    return <Navigate to="/confirm" replace />;
  }

  return children;
};

export default ProtectedRoute;
