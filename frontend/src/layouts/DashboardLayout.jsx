import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiCreditCard, FiHome, FiLogOut, FiMenu, FiMessageCircle, FiPackage, FiUser, FiUsers, FiX, FiZap } from 'react-icons/fi';
import useAuthStore from '../context/storeAuth';
import api from '../api/axios';
import { disconnectSocket, getSocket } from '../services/socket';
import logo from '../assets/logo-Photoroom.png';
import '../styles/Dashboard.css';

const DashboardLayout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearToken = useAuthStore((state) => state.clearToken);

  useEffect(() => {
    let active = true;

    api.get('/auth/profile')
      .then(({ data }) => {
        if (active) setUser(data);
      })
      .catch(() => {});

    getSocket();

    return () => {
      active = false;
    };
  }, [token, setUser]);

  const items = useMemo(() => {
    const common = [
      { to: '/dashboard', icon: FiHome, label: 'Inicio', end: true },
      { to: '/dashboard/orders', icon: FiPackage, label: role === 'cliente' ? 'Mis pedidos' : 'Pedidos' },
      { to: '/dashboard/messages', icon: FiMessageCircle, label: 'Chat en vivo' },
      { to: '/dashboard/assistant', icon: FiZap, label: 'Sparky IA' },
      { to: '/dashboard/profile', icon: FiUser, label: 'Mi perfil' },
    ];
    if (role === 'cliente' || role === 'administrador') common.splice(2, 0, { to: '/dashboard/payments', icon: FiCreditCard, label: 'Pagos' });
    if (role === 'administrador') common.splice(2, 0, { to: '/dashboard/users', icon: FiUsers, label: 'Usuarios' });
    return common;
  }, [role]);

  const logout = () => {
    disconnectSocket(); clearToken(); navigate('/login');
  };

  return (
    <div className="dashboard-shell">
      <button className="mobile-menu" type="button" onClick={() => setOpen(true)} aria-label="Abrir menú"><FiMenu /></button>
      {open && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
      <aside className={`dashboard-sidebar ${open ? 'is-open' : ''}`}>
        <button type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label="Cerrar menú"><FiX /></button>
        <button type="button" className="sidebar-brand" onClick={() => navigate('/')}>
          <img src={logo} alt="GasConnect" /><span><strong>GasConnect</strong><small>Panel de operaciones</small></span>
        </button>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.avatar?.url ? <img src={user.avatar.url} alt="" /> : (user?.nombre?.[0] || 'G')}</div>
          <div><strong>{user?.nombre || 'Usuario GasConnect'}</strong><span>{role || 'cargando...'}</span></div>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}>
              <item.icon /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-status"><FiActivity /><span>API y tiempo real</span><strong>Conectados</strong></div>
        <button type="button" className="sidebar-logout" onClick={logout}><FiLogOut /> Cerrar sesión</button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div><p>Gas a domicilio en Quito</p><h1>Hola, {user?.nombre?.split(' ')[0] || 'bienvenido'}</h1></div>
          <button type="button" className="topbar-profile" onClick={() => navigate('/dashboard/profile')}>
            <span>{role}</span><div>{user?.avatar?.url ? <img src={user.avatar.url} alt="Perfil" /> : (user?.nombre?.[0] || 'G')}</div>
          </button>
        </header>
        <section className="dashboard-content"><Outlet /></section>
      </main>
    </div>
  );
};
export default DashboardLayout;
