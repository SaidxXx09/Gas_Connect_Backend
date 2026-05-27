import React, { useState } from 'react';
import './Create.css';
import TruckImage from '../../assets/camion-grande-Photoroom.png';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const Create = () => {
    const [formData, setFormData] = useState({
        callePrincipal: '',
        calleSecundaria: '',
        numeroDomicilio: '',
        referenciaDomiciliaria: '',
        telefono: '',
        cantidadTanques: '',
        fechaHoraEntrega: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [total, setTotal] = useState(0);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const cantidad = parseInt(formData.cantidadTanques);
        const precioPorTanque = 3.5;
        const totalCalculado = cantidad * precioPorTanque;
        const direccionEntrega = `${formData.callePrincipal}, ${formData.calleSecundaria}, ${formData.numeroDomicilio} - ${formData.referenciaDomiciliaria}`;

        // enviar al backend
        api.post('/orders', {
            direccionEntrega,
            cantidadCilindros: cantidad,
            total: totalCalculado
        }).then(() => {
            setTotal(totalCalculado);
            setSubmitted(true);
            toast.success('Pedido creado con éxito');
        }).catch((err) => {
            const msg = err?.response?.data?.mensaje || err.message || 'Error al crear pedido';
            toast.error(msg);
        });
    };

    if (submitted) {
        return (
            <div className="create-container">
                <div className="page-header" style={{backgroundColor: '#004AAD', color: '#FF8C00', padding: '20px', textAlign: 'center', width: '100%', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'}}>
                    <h1 style={{margin: '0', fontSize: '2.5rem', fontWeight: 'bold', color: '#FF8C00'}}>Pedido Realizado con Éxito</h1>
                </div>
                <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px'}}>
                    <p style={{fontSize: '1.2rem', marginBottom: '20px'}}>Total: <span style={{color: '#28a745', fontWeight: 'bold'}}>${total.toFixed(2)}</span></p>
                    <button onClick={() => setSubmitted(false)} style={{padding: '10px 20px', backgroundColor: '#FF8C00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Hacer Otro Pedido</button>
                </div>
                <div className="truck-icon" style={{position: 'fixed', bottom: '20px', right: '20px', width: '80px', height: '80px', zIndex: 1000}}>
                    <img src={TruckImage} alt="Camión GasConnect" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                </div>
            </div>
        );
    }

    return (
        <div className="create-container">
            <div className="page-header" style={{backgroundColor: '#004AAD', color: '#FF8C00', padding: '20px', textAlign: 'center', width: '100%', marginBottom: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'}}>
                <h1 style={{margin: '0', fontSize: '2.5rem', fontWeight: 'bold', color: '#FF8C00'}}>Crear Pedido de Gas</h1>
            </div>
            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                    <label>Calle Principal:</label>
                    <input
                        type="text"
                        name="callePrincipal"
                        value={formData.callePrincipal}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Calle Secundaria:</label>
                    <input
                        type="text"
                        name="calleSecundaria"
                        value={formData.calleSecundaria}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Número de Domicilio:</label>
                    <input
                        type="text"
                        name="numeroDomicilio"
                        value={formData.numeroDomicilio}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Referencia Domiciliaria:</label>
                    <textarea
                        name="referenciaDomiciliaria"
                        value={formData.referenciaDomiciliaria}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Teléfono:</label>
                    <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Cantidad de Tanques de Gas:</label>
                    <input
                        type="number"
                        name="cantidadTanques"
                        value={formData.cantidadTanques}
                        onChange={handleChange}
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Fecha y Hora de Entrega:</label>
                    <input
                        type="datetime-local"
                        name="fechaHoraEntrega"
                        value={formData.fechaHoraEntrega}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-button">Confirmar Pedido</button>
            </form>
            <div className="truck-icon" style={{position: 'fixed', bottom: '20px', right: '20px', width: '80px', height: '80px', zIndex: 1000}}>
                <img src={TruckImage} alt="Camión GasConnect" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
            </div>
        </div>
    );
};

export default Create;
