import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../api/axios";
import useAuthStore from "../context/storeAuth";
import { toast } from "react-toastify";
import "../styles/Auth.css";

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
      const { token, role } = res.data;
      if (token) {
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setRole(role || null);
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
    <main className="auth-container">
      <h1>Iniciar Sesión</h1>

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
              {showPassword ? "🙈" : "👁️"}
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

      <NavLink to="/register" className="auth-link">
        ¿No tienes cuenta? Regístrate
      </NavLink>
    </main>
  );
};

export default Login;
