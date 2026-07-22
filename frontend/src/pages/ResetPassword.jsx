import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiEye, FiEyeOff, FiKey, FiLock, FiMail } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/Auth.css';
import imagenLogo from '../assets/logo-Photoroom.png';
import imagenReset from '../assets/reset_Password.webp';
import imagenFondo from '../assets/Fondo_Quito.webp';
import iconBack from '../assets/Navegacion_regresar.webp';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: searchParams.get('email') || '' },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.put('/auth/resetpassword', {
        email: data.email.trim().toLowerCase(),
        pin: data.pin,
        newPassword: data.newPassword,
      });
      toast.success('Contraseña actualizada correctamente');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'No se pudo actualizar la contraseña');
    }
  };

  return (
    <main className="auth-container auth-page--reset" style={{ backgroundImage: `url(${imagenFondo})` }}>
      <div className="login-card">
        <header className="login-header">
          <button type="button" className="auth-brand-button" onClick={() => navigate('/')}>
            <img src={imagenLogo} alt="Logo de GasConnect" className="login-logo" />
            <span className="auth-brand-copy"><strong>GasConnect</strong><small>Gas a domicilio</small></span>
          </button>
          <h1>Crea una nueva contraseña</h1>
          <p className="login-intro">Usa el correo y el PIN recibido para verificar la recuperación.</p>
        </header>

        <div className="login-grid reversed">
          <section className="login-image-panel">
            <div className="auth-visual-inner">
              <span className="auth-visual-badge">Recuperación protegida</span>
              <img src={imagenReset} alt="Sparky restableciendo el acceso" className="login-side-image" />
              <p className="auth-visual-copy">El PIN solo funcionará con la cuenta que solicitó la recuperación.</p>
            </div>
          </section>

          <section className="login-form-panel">
            <p className="form-kicker">Nuevo acceso</p>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label htmlFor="reset-email">Correo electrónico</label>
                <div className="input-shell">
                  <FiMail className="field-icon" />
                  <input id="reset-email" type="email" autoComplete="email" {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingresa un correo válido' },
                  })} />
                </div>
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="pin">PIN de 6 dígitos</label>
                <div className="input-shell">
                  <FiKey className="field-icon" />
                  <input id="pin" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength="6" placeholder="123456" {...register('pin', {
                    required: 'El PIN es requerido',
                    pattern: { value: /^\d{6}$/, message: 'El PIN debe contener exactamente 6 números' },
                  })} />
                </div>
                {errors.pin && <span className="error">{errors.pin.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="newPassword">Nueva contraseña</label>
                <div className="password-field">
                  <FiLock className="field-icon" />
                  <input id="newPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Mínimo 6 caracteres" {...register('newPassword', {
                    required: 'La contraseña es requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.newPassword && <span className="error">{errors.newPassword.message}</span>}
              </div>

              <div className="field">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <div className="input-shell">
                  <FiLock className="field-icon" />
                  <input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword', {
                    required: 'Debes confirmar la contraseña',
                    validate: (value) => value === newPassword || 'Las contraseñas no coinciden',
                  })} />
                </div>
                {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </form>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button" onClick={() => navigate('/forgot')}>
                <img src={iconBack} alt="" className="back-icon" /><span>Solicitar otro PIN</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
