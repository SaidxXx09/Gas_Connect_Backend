import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.put('/auth/resetpassword', { 
        pin: data.pin, 
        newPassword: data.newPassword 
      });
      toast.success('Contraseña actualizada correctamente');
      navigate('/login');
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error.message || 'Error al actualizar contraseña';
      toast.error(msg);
    }
  };

  return (
    <main className="auth-container" style={{ maxWidth: 450 }}>
      <h1>Restablecer Contraseña</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Ingresa el PIN que recibiste por correo y establece tu nueva contraseña.
      </p>

      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label htmlFor="pin">PIN de 6 dígitos</label>
          <input 
            id="pin"
            type="text" 
            placeholder="Ej: 123456"
            {...register('pin', { 
              required: 'El PIN es requerido',
              minLength: { value: 6, message: 'El PIN debe tener 6 dígitos' },
              maxLength: { value: 6, message: 'El PIN debe tener 6 dígitos' },
              pattern: { value: /^\d{6}$/, message: 'El PIN debe contener solo números' }
            })} 
          />
          {errors.pin && <span className="error">{errors.pin.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="newPassword">Nueva Contraseña</label>
          <div className="password-field">
            <input 
              id="newPassword"
              type={showPassword ? "text" : "password"} 
              placeholder="Mínimo 6 caracteres"
              {...register('newPassword', { 
                required: 'La contraseña es requerida',
                minLength: { value: 6, message: 'Mínimo 6 caracteres' }
              })} 
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.newPassword && <span className="error">{errors.newPassword.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input 
            id="confirmPassword"
            type="password" 
            placeholder="Repite tu nueva contraseña"
            {...register('confirmPassword', { 
              required: 'Debes confirmar la contraseña',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
              validate: (value) => value === newPassword || 'Las contraseñas no coinciden'
            })} 
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
        </div>

        <button type="submit" className="btn-primary">Actualizar Contraseña</button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
        ¿Recordaste tu contraseña? <a href="/login" style={{ color: '#004aad', fontWeight: 600, textDecoration: 'none' }}>Inicia sesión</a>
      </p>
    </main>
  );
};

export default ResetPassword;
