import { Navigate } from 'react-router-dom'
import useAuthStore from '../context/storeAuth'

const ProtectedRoute = ({ children }) => {

  const token = useAuthStore(state => state.token)
  
  return token ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
