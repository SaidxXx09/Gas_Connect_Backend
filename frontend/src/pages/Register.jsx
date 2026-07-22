import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail, FiPhone, FiUser, FiUsers } from 'react-icons/fi';
import api from '../api/axios';
import useAuthStore from '../context/storeAuth';
import { toast } from 'react-toastify';
import '../styles/Auth.css';
import imagenLogo from '../assets/logo-Photoroom.png';
import imagenRegister from '../assets/Register.webp';
import imagenFondo from '../assets/Fondo_Quito.webp';
import iconBack from '../assets/Navegacion_regresar.webp';

const roles = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'repartidor', label: 'Repartidor' },
  { value: 'administrador', label: 'Administrador' },
];

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const handleRegister = async (data) => {
    try {
      const response = await api.post('/auth/register', {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        role: data.role,
        telefono: data.telefono,
      });

      useAuthStore.getState().setAuth(response.data);
      toast.success('Registro exitoso. Revisa el código enviado a tu correo.');
      navigate('/confirm', { replace: true });
    } catch (error) {
      const message = error?.response?.data?.mensaje || error.message || 'Error al registrar';
      toast.error(message);
    }
  };

  return (
    <main className="auth-container auth-page--register" style={{ backgroundImage: `url(${imagenFondo})` }}>
      <div className="login-card">
        <header className="login-header">
          <button type="button" className="auth-brand-button" onClick={() => navigate('/')} aria-label="Ir al inicio de GasConnect">
            <img src={imagenLogo} alt="Logo de GasConnect" className="login-logo" />
            <span className="auth-brand-copy"><strong>GasConnect</strong><small>Gas a domicilio</small></span>
          </button>
          <h1>Crea tu cuenta</h1>
          <p className="login-intro">Regístrate con tus datos y confirma el código recibido por correo.</p>
        </header>

        <div className="login-grid">
          <section className="login-form-panel" aria-label="Formulario de registro">
            <p className="form-kicker">Datos personales</p>
            <form className="auth-form" onSubmit={handleSubmit(handleRegister)}>
              <div className="field">
                <label htmlFor="register-name">Nombre completo</label>
                <div className="input-shell">
                  <FiUser className="field-icon" />
                  <input id="register-name" type="text" placeholder="Ej. Said Quinto" autoComplete="name" {...register('nombre', {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    pattern: { value: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/, message: 'El nombre no puede contener números ni símbolos' },
                  })} />
                </div>
                {errors.nombre && <span className="error">{errors.nombre.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="register-email">Correo electrónico</label>
                <div className="input-shell">
                  <FiMail className="field-icon" />
                  <input id="register-email" type="email" placeholder="nombre@correo.com" autoComplete="email" {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Introduce un correo válido con @' },
                  })} />
                </div>
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="register-phone">Teléfono</label>
                <div className="input-shell">
                  <FiPhone className="field-icon" />
                  <input id="register-phone" type="tel" inputMode="numeric" placeholder="10 dígitos" autoComplete="tel" maxLength="10" {...register('telefono', {
                    required: 'El teléfono es obligatorio',
                    pattern: { value: /^[0-9]{10}$/, message: 'El teléfono debe tener exactamente 10 números' },
                  })} />
                </div>
                {errors.telefono && <span className="error">{errors.telefono.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="register-role">Rol</label>
                <div className="input-shell">
                  <FiUsers className="field-icon" />
                  <select id="register-role" {...register('role', {
                    required: 'Selecciona un rol',
                    validate: (value) => roles.some((role) => role.value === value) || 'Rol inválido',
                  })}>
                    <option value="">Selecciona tu rol</option>
                    {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                  </select>
                </div>
                {errors.role && <span className="error">{errors.role.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="register-password">Contraseña</label>
                <div className="password-field">
                  <FiLock className="field-icon" />
                  <input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" autoComplete="new-password" {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
                  })} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="error">{errors.password.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creando cuenta...' : 'Crear mi cuenta'}
              </button>
            </form>

            <nav className="login-links"><NavLink to="/login" className="auth-link">¿Ya tienes cuenta? Inicia sesión</NavLink></nav>
            <div className="back-bottom-wrap">
              <button type="button" className="back-button" onClick={() => navigate(-1)}>
                <img src={iconBack} alt="" className="back-icon" /><span>Volver</span>
              </button>
            </div>
          </section>

          <section className="login-image-panel" aria-label="Ilustración de registro">
            <div className="auth-visual-inner">
              <span className="auth-visual-badge">Registro rápido y sencillo</span>
              <img src={imagenRegister} alt="Sparky presentando el registro de GasConnect" className="login-side-image" />
              <p className="auth-visual-copy">Crea tu cuenta, confirma tu correo y empieza a gestionar entregas.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Register;
