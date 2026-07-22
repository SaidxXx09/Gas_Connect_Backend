import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import api from "../api/axios";
import useAuthStore from "../context/storeAuth";
import { toast } from "react-toastify";
import "../styles/Auth.css";
import imagenLogo from "../assets/logo-Photoroom.png";
import imagenLogin from "../assets/Login.webp";
import imagenFondo from "../assets/Fondo_Quito.webp";
import iconBack from "../assets/Navegacion_regresar.webp";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const handleLogin = async (data) => {
    const { email, password } = data;

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, emailConfirmed } = res.data;

      if (token) {
        useAuthStore.getState().setAuth(res.data);
      }

      if (!emailConfirmed) {
        toast.info('Tu cuenta aún no está confirmada. Ingresa el último código recibido por correo.');
        navigate('/confirm', { replace: true });
        return;
      }

      if (token) {
        toast.success('Inicio de sesión exitoso');
        navigate('/dashboard');
      } else {
        toast.error('Respuesta inválida del servidor');
      }
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error.message || 'Error al iniciar sesión';
      toast.error(msg);
    }
  };

  return (
    <main className="auth-container auth-page--login" style={{ backgroundImage: `url(${imagenFondo})` }}>
      <div className="login-card">
        <header className="login-header">
          <button type="button" className="auth-brand-button" onClick={() => navigate("/")} aria-label="Ir al inicio de GasConnect">
            <img src={imagenLogo} alt="Logo de GasConnect" className="login-logo" />
            <span className="auth-brand-copy">
              <strong>GasConnect</strong>
              <small>Gas a domicilio</small>
            </span>
          </button>
          <h1>Bienvenido de nuevo</h1>
          <p className="login-intro">Ingresa a tu cuenta y continúa gestionando tus servicios de forma rápida y segura.</p>
        </header>

        <div className="login-grid">
          <section className="login-form-panel" aria-label="Formulario de inicio de sesión">
            <p className="form-kicker">Acceso a tu cuenta</p>

            <form className="auth-form" onSubmit={handleSubmit(handleLogin)}>
              <div className="field">
                <label htmlFor="login-email">Correo electrónico</label>
                <div className="input-shell">
                  <FiMail className="field-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="nombre@correo.com"
                    autoComplete="email"
                    {...register("email", { required: true })}
                  />
                </div>
                {errors.email && <span className="error">El correo es obligatorio</span>}
              </div>

              <div className="field">
                <label htmlFor="login-password">Contraseña</label>
                <div className="password-field">
                  <FiLock className="field-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error">La contraseña es obligatoria</span>
                )}
              </div>

              <button type="submit" className="btn-primary">
                Ingresar a GasConnect
              </button>
            </form>

            <nav className="login-links" aria-label="Opciones de acceso">
              <NavLink to="/forgot" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </NavLink>

              <NavLink to="/register" className="auth-link">
                ¿No tienes cuenta? Regístrate
              </NavLink>
            </nav>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Regresar a la página anterior">
                <img src={iconBack} alt="" className="back-icon" aria-hidden="true" />
                <span>Volver</span>
              </button>
            </div>
          </section>

          <section className="login-image-panel" aria-label="Ilustración de acceso a GasConnect">
            <div className="auth-visual-inner">
              <span className="auth-visual-badge">Servicio confiable y cercano</span>
              <img src={imagenLogin} alt="Sparky junto al camión de entregas GasConnect" className="login-side-image" />
              <p className="auth-visual-copy">Tus pedidos, tu cuenta y la información del servicio en un solo lugar.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;
