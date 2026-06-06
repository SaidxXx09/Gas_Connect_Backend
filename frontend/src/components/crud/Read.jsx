import React, { useState, useEffect } from 'react';
import './Read.css';
import TruckImage from '../../assets/camion-grande-Photoroom.png';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const Read = () => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        api.get('/orders')
            .then((res) => {
                setPedidos(res.data || []);
            })
            .catch((err) => {
                const msg = err?.response?.data?.mensaje || err.message || 'Error al cargar pedidos';
                toast.error(msg);
            });
    }, []);

    return (
        <div className="read-container">
            <div className="page-header" style={{backgroundColor: '#004AAD', color: '#FF8C00', padding: '20px', textAlign: 'center', width: '100%', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'}}>
                <h1 style={{margin: '0', fontSize: '2.5rem', fontWeight: 'bold', color: '#FF8C00'}}>Mis Pedidos</h1>
            </div>
            {pedidos.length === 0 ? (
                <p>No tienes pedidos registrados.</p>
            ) : (
                <div className="pedidos-grid">
                    {pedidos.map((pedido, index) => (
                        <div key={pedido._id || index} className="pedido-card">
                            <div className="pedido-header">
                                <h3>Pedido #{index + 1}</h3>
                                <span className={`estado ${String(pedido.estado || 'pendiente').toLowerCase()}`}>
                                    {pedido.estado || 'Pendiente'}
                                </span>
                            </div>
                            <div className="pedido-info">
                                <div className="ubicacion">
                                    <h4>Ubicación:</h4>
                                    <p>{pedido.direccionEntrega}</p>
                                    <p>Tel: {pedido.telefono || 'N/A'}</p>
                                </div>
                                <div className="detalles">
                                    <p><strong>Cantidad de tanques:</strong> {pedido.cantidadCilindros}</p>
                                    <p><strong>Fecha de entrega:</strong> {pedido.fechaHoraEntrega ? new Date(pedido.fechaHoraEntrega).toLocaleString() : 'No definida'}</p>
                                    <p className="total-verde"><strong>Total:</strong> ${Number(pedido.total || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="truck-icon" style={{position: 'fixed', bottom: '20px', right: '20px', width: '80px', height: '80px', zIndex: 1000}}>
                <img src={TruckImage} alt="Camión GasConnect" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
            </div>
        </div>
    );
};

export default Read;
