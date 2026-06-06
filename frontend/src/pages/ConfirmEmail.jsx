import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";
import imagenLogo from "../assets/logo-Photoroom.png";
import imagenConfirm from "../assets/confirm_account.png";
import imagenFondo from "../assets/Fondo_Quito.png";
import iconBack from "../assets/Navegacion_regresar.png";

const ConfirmEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: !!token, ok: false, message: '' });
  const [tokenInput, setTokenInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (token) {
      setTokenInput(token);
    }
  }, [token]);

  const confirmToken = async (confirmationToken, isFromUrl = false) => {
    setStatus({ loading: true, ok: false, message: '' });
    try {
      const cleanToken = confirmationToken.trim();
      const res = isFromUrl
        ? await api.get(`/auth/confirm/${cleanToken}`)
        : await api.post('/auth/confirm', { token: cleanToken });
      setStatus({ loading: false, ok: true, message: res.data?.mensaje || 'Correo confirmado.' });
      if (res.data?.emailConfirmed) {
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err) {
      const msg = err?.response?.data?.mensaje || err.message || 'Error al confirmar';
      setStatus({ loading: false, ok: false, message: msg });
    }
  };

  useEffect(() => {
    if (!token) return;
    confirmToken(token, true);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setStatus({ loading: false, ok: false, message: 'Por favor ingresa el token recibido por correo.' });
      return;
    }

    setSubmitted(true);
    await confirmToken(tokenInput, false);
  };

  return (
    <main className="auth-container" style={{ backgroundImage: `url(${imagenFondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="login-card">
        <div className="login-header">
          <button type="button" className="logo-button" onClick={() => navigate("/")} aria-label="Ir al inicio">
            <img src={imagenLogo} alt="logotipo_gasconnect" className="login-logo" />
          </button>
          <h1>Confirmación de cuenta</h1>
          <p className="login-intro">Copia el token del correo o ingrésalo manualmente para verificar tu cuenta.</p>
        </div>

        <div className="login-grid">
          <section className="login-image-panel">
            <img src={imagenConfirm} alt="Confirmación de cuenta" className="login-side-image" />
          </section>

          <section className="login-form-panel">
            <div className="confirm-card">
              <div className="confirm-note">
                <strong>Si ya recibiste el token</strong>
                <p>Insértalo a continuación para activar tu cuenta y poder acceder al dashboard.</p>
              </div>
            </div>

            {token && !status.loading && (
              <div className="confirm-card" style={{ marginBottom: '1.5rem', background: '#f7f7fb', border: '1px solid #e2e2f0' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>
                  Se detectó un token desde la URL. Puedes editarlo o usar el token manualmente.
                </p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="token">Token de confirmación</label>
                <input
                  id="token"
                  name="token"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Ingresa el token recibido por correo"
                />
              </div>

              <button className="btn-primary" type="submit" disabled={status.loading}>
                {status.loading ? 'Verificando...' : 'Confirmar token'}
              </button>
            </form>

            <div className="back-bottom-wrap">
              <button type="button" className="back-button bottom" onClick={() => navigate(-1)} aria-label="Regresar">
                <img src={iconBack} alt="Regresar" className="back-icon" />
              </button>
            </div>

            {submitted && !status.loading && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: status.ok ? '#1b5e20' : '#c62828', fontWeight: 700, marginBottom: '1rem' }}>
                  {status.message}
                </p>
                {status.ok ? (
                  <p style={{ color: '#1b5e20', fontSize: '0.95rem' }}>✅ Redirigiendo al dashboard en 2 segundos...</p>
                ) : (
                  <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                    Volver al dashboard
                  </button>
                )}
              </div>
            )}

            {!submitted && !status.loading && token && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#555', fontSize: '0.95rem' }}>
                <p>
                  Si el enlace no funciona, copia y pega el token en el campo anterior.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ConfirmEmail;
