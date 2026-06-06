import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../api/axios'
import useAuthStore from '../context/storeAuth'
import { toast } from 'react-toastify'
import '../styles/Auth.css'

const Dashboard = () => {
    const [profile, setProfile] = useState(null)
    const [sectionLoading, setSectionLoading] = useState(false)
    const [activeSection, setActiveSection] = useState(null)
    const [users, setUsers] = useState([])
    const role = useAuthStore((state) => state.role)
    const navigate = useNavigate()
    const { clearToken } = useAuthStore.getState()

    const handleShowProfile = async () => {
        setSectionLoading(true)
        try {
            const res = await api.get('/auth/profile')
            setProfile(res.data)
            setActiveSection('profile')
            toast.success('Perfil cargado')
        } catch (err) {
            console.error('Error loading profile:', err)
            toast.error('No se pudo cargar el perfil')
        } finally {
            setSectionLoading(false)
        }
    }

    const handleResend = async () => {
        try {
            await api.post('/auth/resend-confirmation')
            toast.success('Correo de confirmación reenviado')
        } catch (err) {
            const msg = err?.response?.data?.mensaje || err.message || 'Error al reenviar'
            toast.error(msg)
        }
    }

    const handleRequestGas = () => {
        navigate('/crud')
    }

    const handleViewOrders = () => {
        navigate('/read')
    }

    const handleLoadUsers = async () => {
        setSectionLoading(true)
        try {
            const res = await api.get('/auth/users')
            setUsers(res.data || [])
            setActiveSection('users')
        } catch (err) {
            console.error('Error loading users:', err)
            toast.error('No se pudieron cargar los usuarios')
        } finally {
            setSectionLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')
        if (!confirmDelete) return

        try {
            await api.delete('/auth/profile')
            clearToken()
            toast.success('Cuenta eliminada correctamente')
            navigate('/login')
        } catch (err) {
            const msg = err?.response?.data?.mensaje || err.message || 'Error al eliminar cuenta'
            toast.error(msg)
        }
    }

    const handleForgotPassword = () => {
        navigate('/forgot')
    }

    const handleLogout = () => {
        clearToken()
        toast.success('Sesión cerrada')
        navigate('/login')
    }

    return (
        <main style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <h1 style={{ margin: 0, color: '#ff8c00' }}>Bienvenido a GasConnect</h1>
                        <button
                            className="btn-primary"
                            onClick={handleLogout}
                            style={{ padding: '0.7rem 1.3rem', fontSize: '0.9rem' }}
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                    <div style={{ background: '#f0f2f5', borderRadius: 10, padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 1rem', color: '#333' }}>Acciones</h3>
                        <div style={{ display: 'grid', gap: '0.8rem', marginBottom: '0.8rem' }}>
                            {(role === 'cliente' || role === 'repartidor' || role === 'administrador') && (
                                <button className="btn-primary" onClick={role === 'cliente' ? handleRequestGas : role === 'repartidor' ? handleViewOrders : handleLoadUsers} style={{ minWidth: 180, background: role === 'cliente' ? '#004aad' : role === 'repartidor' ? '#1f7a1f' : '#6d28d9' }}>
                                    {role === 'cliente' ? '🛒 Pedir Gas' : role === 'repartidor' ? '🚚 Ver pedidos' : '👥 Usuarios'}
                                </button>
                            )}
                            <button className="btn-primary" onClick={handleShowProfile} style={{ minWidth: 180, background: '#ff8c00' }}>
                                👁 Mostrar perfil
                            </button>
                            <button className="btn-primary" onClick={handleForgotPassword} style={{ minWidth: 180 }}>
                                🔐 Cambiar contraseña
                            </button>
                            <button className="btn-primary" onClick={handleDeleteAccount} style={{ minWidth: 180, background: '#de3737' }}>
                                🗑 Eliminar cuenta
                            </button>
                        </div>

                        <div style={{ marginTop: '1.5rem', minHeight: 200 }}>
                            {sectionLoading ? (
                                <p>Cargando...</p>
                            ) : (
                                <> 
                                    {activeSection === null && (
                                        <p>Presiona "Mostrar perfil" para cargar tus datos personales.</p>
                                    )}

                                    {activeSection !== null && (
                                        <button className="btn-primary" onClick={() => setActiveSection(null)} style={{ marginBottom: '1rem', background: '#667eea' }}>
                                            ← Volver al dashboard
                                        </button>
                                    )}

                                    {activeSection === 'profile' && profile && (
                                        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 10, border: '1px solid #dde3eb' }}>
                                            <h4 style={{ margin: '0 0 1rem', color: '#333' }}>Detalles de perfil</h4>
                                            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                                                <div><strong>Nombre</strong><p>{profile.nombre}</p></div>
                                                <div><strong>Email</strong><p>{profile.email}</p></div>
                                                <div><strong>Rol</strong><p>{profile.role}</p></div>
                                                <div><strong>Teléfono</strong><p>{profile.telefono || 'No registrado'}</p></div>
                                                <div><strong>Registrado</strong><p>{new Date(profile.createdAt).toLocaleString()}</p></div>
                                                <div><strong>Última actualización</strong><p>{new Date(profile.updatedAt).toLocaleString()}</p></div>
                                            </div>
                                        </div>
                                    )}

                                    {activeSection === 'users' && (
                                        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 10, border: '1px solid #dde3eb' }}>
                                            <h4 style={{ margin: '0 0 1rem', color: '#333' }}>Usuarios registrados</h4>
                                            {users.length === 0 ? (
                                                <p>No hay usuarios para mostrar.</p>
                                            ) : (
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ background: '#f6f8fb' }}>
                                                                <th style={{ textAlign: 'left', padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Nombre</th>
                                                                <th style={{ textAlign: 'left', padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Email</th>
                                                                <th style={{ textAlign: 'left', padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Rol</th>
                                                                <th style={{ textAlign: 'left', padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>Confirmado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {users.map((user) => (
                                                                <tr key={user._id}>
                                                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>{user.nombre}</td>
                                                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>{user.email}</td>
                                                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>{user.role}</td>
                                                                    <td style={{ padding: '0.8rem', borderBottom: '1px solid #e2e8f0' }}>{user.emailConfirmed ? '✅' : '❌'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Dashboard