import { useEffect, useState } from 'react';
import { FiCreditCard } from 'react-icons/fi';
import api from '../../api/axios';
import StatusPill from '../../components/dashboard/StatusPill';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/payments').then(({ data }) => setPayments(data)).catch(() => setPayments([])); }, []);
  return <><header className="page-heading"><div><h2>Pagos</h2><p>Historial de transacciones procesadas mediante Kushki y asociadas a los pedidos.</p></div></header><div className="gc-card table-wrap">{payments.length ? <table className="gc-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Monto</th><th>Estado</th><th>Ticket</th><th>Fecha</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment._id}><td>{payment.order?.codigo || 'Pedido'}</td><td>{payment.customer?.nombre || 'Mi cuenta'}</td><td><strong>${Number(payment.amount).toFixed(2)}</strong></td><td><StatusPill value={payment.status === 'approved' ? 'pagado' : payment.status === 'declined' ? 'fallido' : payment.status} /></td><td>{payment.ticketNumber || '—'}</td><td>{new Date(payment.createdAt).toLocaleString('es-EC')}</td></tr>)}</tbody></table> : <div className="empty-state"><FiCreditCard /><p>Aún no hay pagos registrados. El cliente puede pagar desde el detalle de un pedido.</p></div>}</div></>;
};
export default Payments;
