import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../context/storeAuth'


const PublicRoute = () => {

    const token = useAuthStore((state) => state.token)
    
    return token ? <Navigate to="/dashboard" /> : <Outlet />
}

export default PublicRoute
