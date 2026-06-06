import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/Auth.css';
import imagenLogo from "../assets/logo-Photoroom.png";
import imagenForgot from "../assets/Forgot_password.png";
import imagenFondo from "../assets/Fondo_Quito.png";
import iconBack from "../assets/Navegacion_regresar.png";

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
    <main className="auth-container" style={{ backgroundImage: `url(${imagenFondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-card">
        <div className="login-header">
          <button type="button" className="logo-button" onClick={() => navigate("/")} aria-label="Ir al inicio">
            <img src={imagenLogo} alt="logotipo_gasconnect" className="login-logo" />
          </button>
          <h1>Recuperar Contraseña</h1>
          <p className="login-intro">Ingresa tu correo para recibir un PIN de recuperación</p>
        </div>

        <div className="login-grid reversed">
          <section className="login-image-panel">
            <img src={imagenForgot} alt="Recuperar contraseña ilustración" className="login-side-image" />
          </section>

          <section className="login-form-panel">
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="Tu correo" 
                  {...register('email', { required: 'El correo es obligatorio' })} 
                />
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <button type="submit" className="btn-primary">Enviar PIN</button>
            </form>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button bottom" onClick={() => navigate(-1)} aria-label="Regresar">
                <img src={iconBack} alt="Regresar" className="back-icon" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
