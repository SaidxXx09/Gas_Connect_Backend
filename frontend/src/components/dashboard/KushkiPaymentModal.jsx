import { useState } from 'react';
import { FiCreditCard, FiLock, FiX, FiZap } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const KushkiPaymentModal = ({ order, onClose, onPaid }) => {
  const [form, setForm] = useState({
    name: '', number: '', cvc: '', expiryMonth: '', expiryYear: '', documentNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const publicId = import.meta.env.VITE_KUSHKI_PUBLIC_MERCHANT_ID;
  const testMode = String(import.meta.env.VITE_KUSHKI_TEST_MODE) !== 'false';

  const update = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === 'number') {
      value = value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (['cvc', 'expiryMonth', 'expiryYear', 'documentNumber'].includes(name)) {
      value = value.replace(/\D/g, '');
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const fillUatData = () => {
    if (!testMode) return;
    setForm({
      name: 'Cliente Prueba',
      number: '5451 9515 7492 5480',
      cvc: '123',
      expiryMonth: '12',
      expiryYear: '29',
      documentNumber: '9999999999',
    });
    toast.info('Se completaron datos UAT de prueba. No corresponden a una tarjeta real.');
  };

  const loadKushki = () => new Promise((resolve, reject) => {
    if (window.Kushki) return resolve(window.Kushki);
    const existing = document.querySelector('script[data-kushki-sdk="true"]');

    if (existing) {
      existing.addEventListener('load', () => resolve(window.Kushki), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Kushki.js')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.kushkipagos.com/kushki.min.js';
    script.async = true;
    script.dataset.kushkiSdk = 'true';
    script.onload = () => window.Kushki ? resolve(window.Kushki) : reject(new Error('Kushki.js no está disponible'));
    script.onerror = () => reject(new Error('No se pudo cargar Kushki.js'));
    document.body.appendChild(script);
  });

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return;
    if (!publicId) {
      toast.error('Configura VITE_KUSHKI_PUBLIC_MERCHANT_ID en frontend/.env');
      return;
    }

    setLoading(true);

    try {
      const Kushki = await loadKushki();
      const kushki = new Kushki({ merchantId: publicId, inTestEnvironment: testMode });

      kushki.requestToken({
        amount: Number(order.total).toFixed(2),
        currency: 'USD',
        card: {
          name: form.name.trim(),
          number: form.number.replace(/\s/g, ''),
          cvc: form.cvc,
          expiryMonth: form.expiryMonth,
          expiryYear: form.expiryYear,
        },
      }, async (response) => {
        if (response.code) {
          setLoading(false);
          toast.error(response.message || 'Kushki no pudo generar el token');
          return;
        }

        try {
          const result = await api.post(`/payments/orders/${order._id}/charge`, {
            token: response.token,
            deferred: response.deferred,
            contactDetails: { documentType: 'CI', documentNumber: form.documentNumber.trim() },
          });
          toast.success(result.data.mensaje);
          onPaid(result.data.order);
          onClose();
        } catch (error) {
          toast.error(error.response?.data?.mensaje || error.response?.data?.error || 'No se pudo procesar el pago');
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      setLoading(false);
      toast.error(error.message);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="gc-modal" role="dialog" aria-modal="true">
        <header className="gc-modal__header">
          <div><p className="form-help">Pago seguro con Kushki</p><h3><FiCreditCard /> Pedido {order.codigo}</h3></div>
          <button type="button" className="gc-modal__close" onClick={onClose}><FiX /></button>
        </header>

        <div className="gc-modal__body">
          {!publicId && <div className="config-notice">Falta la credencial pública de Kushki en <strong>frontend/.env</strong>.</div>}

          {testMode && (
            <div className="config-notice" style={{ marginBottom: 15 }}>
              <strong>Ambiente de pruebas UAT</strong>
              <p className="form-help">El autocompletado del navegador puede bloquearse en HTTP. Usa este botón solo para pruebas.</p>
              <button type="button" className="gc-button gc-button--secondary gc-button--small" onClick={fillUatData}>
                <FiZap /> Rellenar datos UAT
              </button>
            </div>
          )}

          <form className="gc-form" onSubmit={submit} autoComplete="on">
            <div className="form-field"><label>Nombre del titular</label><input name="name" value={form.name} onChange={update} autoComplete="cc-name" required /></div>
            <div className="form-field"><label>Número de tarjeta</label><input name="number" value={form.number} onChange={update} inputMode="numeric" autoComplete="cc-number" maxLength="23" placeholder="5451 9515 7492 5480" required /></div>
            <div className="form-row">
              <div className="form-field"><label>Mes</label><input name="expiryMonth" value={form.expiryMonth} onChange={update} inputMode="numeric" autoComplete="cc-exp-month" placeholder="MM" maxLength="2" required /></div>
              <div className="form-field"><label>Año</label><input name="expiryYear" value={form.expiryYear} onChange={update} inputMode="numeric" autoComplete="cc-exp-year" placeholder="YY" maxLength="2" required /></div>
            </div>
            <div className="form-row">
              <div className="form-field"><label>CVV</label><input name="cvc" value={form.cvc} onChange={update} type="password" inputMode="numeric" autoComplete="cc-csc" maxLength="4" required /></div>
              <div className="form-field"><label>Cédula</label><input name="documentNumber" value={form.documentNumber} onChange={update} inputMode="numeric" maxLength="10" required /></div>
            </div>
            <div className="location-box"><span><FiLock /> La tarjeta se tokeniza en Kushki y no se guarda en GasConnect.</span><strong>${Number(order.total).toFixed(2)}</strong></div>
            <button type="submit" className="gc-button gc-button--primary" disabled={loading || !publicId}>{loading ? 'Procesando...' : `Pagar $${Number(order.total).toFixed(2)}`}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default KushkiPaymentModal;
