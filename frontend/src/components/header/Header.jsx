import { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const closeMenu = () => {
    setMenuActive(false);
  };

  return (
    <header className="header">
      <nav className="header__container">


        <div className="header__logo">
          <h1>
            Gas<span className="header__site">Connect</span>
          </h1>
        </div>

        <div className={`header__barra ${menuActive ? "active" : ""}`}>
          <div className="navegacion">
            <a href="#inicio" className="navegacion__link" onClick={closeMenu}>Inicio</a>
            <a href="#nosotros" className="navegacion__link" onClick={closeMenu}>Nosotros</a>
            <a href="#servicios" className="navegacion__link" onClick={closeMenu}>Servicios</a>
            <a href="#contacto" className="navegacion__link" onClick={closeMenu}>Contacto</a>
          </div>

          <div className="buttons">
            <Link to="/login" className="btn btn-login" onClick={closeMenu}>
              Login
            </Link>
            <Link to="/register" className="btn btn-register" onClick={closeMenu}>
              Registro
            </Link>
          </div>
        </div>

        <div className="header__hamburger" onClick={toggleMenu}>
          ☰
        </div>

      </nav>
    </header>
  );
};

export default Header;
