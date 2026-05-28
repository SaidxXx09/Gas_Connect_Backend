import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import "../styles/Auth.css";

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
        setTimeout(() => navigate('/dashboard'), 2000);
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
    <main className="auth-container" style={{ maxWidth: 520, padding: '2.5rem' }}>
      <h1>Confirmación de cuenta</h1>
      <p style={{ textAlign: 'center', color: '#444', marginBottom: '1.8rem' }}>
        Ingresa el token que te llegó por correo para verificar tu cuenta. Si ya pasó, usa el enlace directo del correo.
      </p>

      <div className="confirm-card">
        <div className="confirm-note">
          <strong>¿Ya iniciaste sesión y tu cuenta no está confirmada?</strong>
          <p>Después de confirmar el token, vuelve a iniciar sesión y podrás entrar normalmente.</p>
        </div>
      </div>

      {token && !status.loading && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem', borderRadius: 12, background: '#f7f7fb', border: '1px solid #e2e2f0' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>
            Se detectó un token desde la URL. Si prefieres, puedes editarlo aquí o usar el token manualmente.
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
    </main>
  );
};

export default ConfirmEmail;
