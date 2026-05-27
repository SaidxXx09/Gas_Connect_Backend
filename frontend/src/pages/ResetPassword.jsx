import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const ResetPassword = () => {
  const { pin: paramPin } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { pin: paramPin || '' }
  });

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await api.put('/auth/resetpassword', { pin: data.pin, newPassword: data.newPassword });
      toast.success('Contraseña actualizada');
      navigate('/login');
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error.message || 'Error';
      toast.error(msg);
    }
  };

  return (
    <main className="auth-container">
      <h1>Restablecer Contraseña</h1>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label>PIN</label>
          <input type="text" {...register('pin', { required: true, minLength: 6, maxLength: 6 })} />
          {errors.pin && <span className="error">PIN inválido</span>}
        </div>

        <div className="field">
          <label>Nueva Contraseña</label>
          <input type="password" {...register('newPassword', { required: true, minLength: 6 })} />
          {errors.newPassword && <span className="error">Mínimo 6 caracteres</span>}
        </div>

        <div className="field">
          <label>Confirmar Contraseña</label>
          <input type="password" {...register('confirmPassword', { required: true, minLength: 6 })} />
          {errors.confirmPassword && <span className="error">Mínimo 6 caracteres</span>}
        </div>

        <button type="submit" className="btn-primary">Actualizar Contraseña</button>
      </form>
    </main>
  );
};

export default ResetPassword;
