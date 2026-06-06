import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";
import imagenLogo from "../assets/logo-Photoroom.png";
import imagenNotFound from "../assets/not_Found.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <main
      className="auth-container"
      style={{
        backgroundImage: `url(${imagenNotFound})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="notfound-card">
        <div className="notfound-header">
          <button
            type="button"
            className="logo-button notfound-logo-button"
            onClick={() => navigate('/')}
            aria-label="Ir al inicio"
          >
            <img src={imagenLogo} alt="Inicio" className="login-logo" />
          </button>
          <h1>Página no encontrada</h1>
          <p className="login-intro">
            Lo sentimos, no pudimos encontrar esa página. Presiona el logo para volver al inicio.
          </p>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
