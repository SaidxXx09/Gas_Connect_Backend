import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../api/axios";
import useAuthStore from "../context/storeAuth";
import { toast } from "react-toastify";
import "../styles/Auth.css";
import imagenLogo from "../assets/logo-Photoroom.png";
import imagenLogin from "../assets/Login.png";
import imagenFondo from "../assets/Fondo_Quito.png";
import iconBack from "../assets/Navegacion_regresar.png";

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
      const { token, role, emailConfirmed } = res.data;

      if (token) {
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setRole(role || null);
      }

      if (!emailConfirmed) {
        toast.info('Tu cuenta aún no está confirmada. Copia el token del correo y pégalo en la pantalla de confirmación.');
        navigate('/confirm');
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
    <main className="auth-container" style={{ backgroundImage: `url(${imagenFondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-card">

        <div className="login-header">
          <button type="button" className="logo-button" onClick={() => navigate("/")} aria-label="Ir al inicio"> 
            <img src={imagenLogo} alt="logotipo_gasconnect" className="login-logo" />
          </button>
          <h1>Bienvenido</h1>
          <p className="login-intro">Inicia sesión para continuar en tu cuenta</p>
        </div>

        <div className="login-grid">
          <section className="login-form-panel">
            <form className="auth-form" onSubmit={handleSubmit(handleLogin)}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Tu correo"
                  {...register("email", { required: true })}
                />
                {errors.email && <span className="error">El correo es obligatorio</span>}
              </div>

              <div className="field">
                <label>Contraseña</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    {...register("password", { required: true })}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? "🙈" : "🧐"}
                  </button>
                </div>
                {errors.password && (
                  <span className="error">La contraseña es obligatoria</span>
                )}
              </div>

              <button type="submit" className="btn-primary">
                Ingresar
              </button>
            </form>

            <div className="login-links">
              <NavLink to="/forgot" className="forgot-link">
                ¿Olvidaste tu contraseña?
              </NavLink>

              <NavLink to="/register" className="auth-link">
                ¿No tienes cuenta? Regístrate
              </NavLink>
            </div>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button bottom" onClick={() => navigate(-1)} aria-label="Regresar">
                <img src={iconBack} alt="Regresar" className="back-icon" />
              </button>
            </div>
          </section>

          <section className="login-image-panel">
            <img src={imagenLogin} alt="Login ilustración" className="login-side-image" />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;
