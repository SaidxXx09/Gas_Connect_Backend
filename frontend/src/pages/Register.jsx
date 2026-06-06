import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import "../styles/Auth.css";
import imagenLogo from "../assets/logo-Photoroom.png";
import imagenRegister from "../assets/Register.png";
import imagenFondo from "../assets/Fondo_Quito.png";
import iconBack from "../assets/Navegacion_regresar.png";

const roles = [
  { value: "cliente", label: "Cliente" },
  { value: "repartidor", label: "Repartidor" },
  { value: "administrador", label: "Administrador" }
];

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const handleRegister = async (data) => {
    try {
      await api.post('/auth/register', {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        role: data.role,
        telefono: data.telefono
      });
      toast.success('Registro exitoso');
      navigate('/login');
    } catch (error) {
      const msg = error?.response?.data?.mensaje || error.message || 'Error al registrar';
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
          <h1>Registro</h1>
          <p className="login-intro">Crea tu cuenta para acceder al servicio</p>
        </div>

        <div className="login-grid">
          <section className="login-form-panel">
            <form className="auth-form" onSubmit={handleSubmit(handleRegister)}>
              <div className="field">
                <label>Nombre</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  {...register("nombre", {
                    required: 'El nombre es obligatorio',
                    minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                    pattern: {
                      value: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/,
                      message: 'El nombre no puede contener números ni símbolos'
                    }
                  })}
                />
                {errors.nombre && <span className="error">{errors.nombre.message}</span>}
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Tu correo"
                  {...register("email", {
                    required: 'El correo es obligatorio',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Introduce un correo válido con @'
                    }
                  })}
                />
                {errors.email && <span className="error">{errors.email.message}</span>}
              </div>

              <div className="field">
                <label>Teléfono</label>
                <input
                  type="tel"
                  placeholder="10 dígitos"
                  {...register("telefono", {
                    required: 'El teléfono es obligatorio',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'El teléfono debe tener exactamente 10 números'
                    }
                  })}
                />
                {errors.telefono && <span className="error">{errors.telefono.message}</span>}
              </div>

              <div className="field">
                <label>Rol</label>
                <select
                  {...register("role", {
                    required: 'Selecciona un rol',
                    validate: value => roles.some(role => role.value === value) || 'Rol inválido'
                  })}
                >
                  <option value="">Selecciona tu rol</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && <span className="error">{errors.role.message}</span>}
              </div>

              <div className="field">
                <label>Contraseña</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    {...register("password", {
                      required: 'La contraseña es obligatoria',
                      minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
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
                {errors.password && <span className="error">{errors.password.message}</span>}
              </div>

              <button type="submit" className="btn-primary">
                Registrarse
              </button>
            </form>

            <div className="login-links">
              <NavLink to="/login" className="auth-link">
                ¿Ya tienes cuenta? Inicia sesión
              </NavLink>
            </div>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button bottom" onClick={() => navigate(-1)} aria-label="Regresar">
                <img src={iconBack} alt="Regresar" className="back-icon" />
              </button>
            </div>
          </section>

          <section className="login-image-panel">
            <img src={imagenRegister} alt="Registro ilustración" className="login-side-image" />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Register;
