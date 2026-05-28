import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgotpassword', { email: data.email });
      toast.success('PIN enviado al correo. Ahora ingresa el código y la nueva contraseña.');
      navigate('/reset');
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error.message || 'Error';
      toast.error(msg);
    }
  };

  return (
    <main className="auth-container">
      <h1>Recuperar Contraseña</h1>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="field">
          <label>Email</label>
          <input type="email" placeholder="Tu correo" {...register('email', { required: true })} />
          {errors.email && <span className="error">El correo es obligatorio</span>}
        </div>

        <button type="submit" className="btn-primary">Enviar PIN</button>
      </form>
    </main>
  );
};

export default ForgotPassword;
