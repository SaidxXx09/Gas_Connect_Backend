import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import api from '../api/axios';
import { toast } from 'react-toastify';
import '../styles/Auth.css';
import imagenLogo from '../assets/logo-Photoroom.png';
import imagenForgot from '../assets/Forgot_password.webp';
import imagenFondo from '../assets/Fondo_Quito.webp';
import iconBack from '../assets/Navegacion_regresar.webp';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const email = data.email.trim().toLowerCase();
      await api.post('/auth/forgotpassword', { email });
      toast.success('PIN generado. Revisa tu correo electrónico.');
      navigate(`/reset?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'No se pudo iniciar la recuperación');
    }
  };

  return (
    <main className="auth-container auth-page--forgot" style={{ backgroundImage: `url(${imagenFondo})` }}>
      <div className="login-card">
        <header className="login-header">
          <button type="button" className="auth-brand-button" onClick={() => navigate('/')}>
            <img src={imagenLogo} alt="Logo de GasConnect" className="login-logo" />
            <span className="auth-brand-copy"><strong>GasConnect</strong><small>Gas a domicilio</small></span>
          </button>
          <h1>Recupera tu acceso</h1>
          <p className="login-intro">Ingresa el correo asociado a tu cuenta y recibirás un PIN válido durante 15 minutos.</p>
        </header>

        <div className="login-grid reversed">
          <section className="login-image-panel">
            <div className="auth-visual-inner">
              <span className="auth-visual-badge">Te ayudamos a volver</span>
              <img src={imagenForgot} alt="Sparky ayudando a recuperar una contraseña" className="login-side-image" />
              <p className="auth-visual-copy">El PIN se relaciona con el correo para evitar que se cambie la contraseña de otra cuenta.</p>
            </div>
          </section>

          <section className="login-form-panel">
            <p className="form-kicker">Recuperación de cuenta</p>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label htmlFor="forgot-email">Correo electrónico</label>
                <div className="input-shell">
                  <FiMail className="field-icon" />
                  <input id="forgot-email" type="email" placeholder="nombre@correo.com" autoComplete="email" {...register('email', {
                    required: 'El correo es obligatorio',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Ingresa un correo válido' },
                  })} />
                </div>
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Generando PIN...' : 'Enviar PIN de recuperación'}
              </button>
            </form>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button" onClick={() => navigate('/login')}>
                <img src={iconBack} alt="" className="back-icon" /><span>Volver</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
