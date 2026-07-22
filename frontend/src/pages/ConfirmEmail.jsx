import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiKey, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import useAuthStore from '../context/storeAuth';
import '../styles/Auth.css';
import imagenLogo from '../assets/logo-Photoroom.png';
import imagenConfirm from '../assets/confirm_account.webp';
import imagenFondo from '../assets/Fondo_Quito.webp';
import iconBack from '../assets/Navegacion_regresar.webp';

const ConfirmEmail = () => {
  const { token: tokenFromUrl } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [code, setCode] = useState(tokenFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const email = useMemo(() => user?.email || '', [user?.email]);

  const confirmCode = useCallback(async (value) => {
    const cleanCode = String(value || '').replace(/\D/g, '').slice(0, 6);

    if (cleanCode.length !== 6) {
      setOk(false);
      setMessage('El código debe contener exactamente 6 números.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/auth/confirm', {
        code: cleanCode,
        email: email || undefined,
      });

      setOk(true);
      setMessage(response.data.mensaje || 'Cuenta confirmada correctamente.');

      if (user) {
        setUser({ ...user, emailConfirmed: true });
      }

      toast.success('Cuenta confirmada correctamente');
      setTimeout(() => navigate(token ? '/dashboard' : '/login', { replace: true }), 700);
    } catch (error) {
      setOk(false);
      setMessage(error.response?.data?.mensaje || 'No se pudo confirmar la cuenta');
    } finally {
      setLoading(false);
    }
  }, [email, navigate, setUser, token, user]);

  useEffect(() => {
    if (tokenFromUrl && /^\d{6}$/.test(tokenFromUrl)) {
      confirmCode(tokenFromUrl);
    }
  }, [confirmCode, tokenFromUrl]);

  const submit = (event) => {
    event.preventDefault();
    confirmCode(code);
  };

  const resend = async () => {
    if (!token) {
      toast.info('Primero inicia sesión para solicitar un código nuevo.');
      navigate('/login');
      return;
    }

    setResending(true);

    try {
      const response = await api.post('/auth/resend-confirmation');
      toast.success(response.data.mensaje || 'Código reenviado');
      setMessage('Se generó un código nuevo. Utiliza únicamente el último correo recibido.');
      setOk(false);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'No se pudo reenviar el código');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="auth-container auth-page--confirm" style={{ backgroundImage: `url(${imagenFondo})` }}>
      <div className="login-card">
        <header className="login-header">
          <button type="button" className="auth-brand-button" onClick={() => navigate('/')}>
            <img src={imagenLogo} alt="Logo de GasConnect" className="login-logo" />
            <span className="auth-brand-copy"><strong>GasConnect</strong><small>Gas a domicilio</small></span>
          </button>
          <h1>Confirma tu cuenta</h1>
          <p className="login-intro">Ingresa el código de seis números enviado a tu correo.</p>
        </header>

        <div className="login-grid reversed">
          <section className="login-image-panel">
            <div className="auth-visual-inner">
              <span className="auth-visual-badge">Un último paso</span>
              <img src={imagenConfirm} alt="Sparky confirmando una cuenta" className="login-side-image" />
              <p className="auth-visual-copy">La confirmación protege tu identidad y habilita los pedidos, pagos y chats.</p>
            </div>
          </section>

          <section className="login-form-panel">
            <p className="form-kicker">Verificación de correo</p>

            {email && (
              <div className="confirm-card confirm-card--detected">
                <p><FiMail /> Código enviado a <strong>{email}</strong></p>
              </div>
            )}

            <form className="auth-form" onSubmit={submit}>
              <div className="field">
                <label htmlFor="confirmation-code">Código de confirmación</label>
                <div className="input-shell">
                  <FiKey className="field-icon" />
                  <input
                    id="confirmation-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength="6"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Confirmar mi cuenta'}
              </button>
            </form>

            <button type="button" className="auth-link auth-link--button" onClick={resend} disabled={resending}>
              {resending ? 'Enviando código nuevo...' : 'Reenviar código de confirmación'}
            </button>

            {message && (
              <div className={`confirm-status ${ok ? 'confirm-status--success' : 'confirm-status--error'}`}>
                <p>{message}</p>
              </div>
            )}

            <div className="back-bottom-wrap">
              <button type="button" className="back-button" onClick={() => navigate('/login')}>
                <img src={iconBack} alt="" className="back-icon" /><span>Volver al inicio de sesión</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ConfirmEmail;
