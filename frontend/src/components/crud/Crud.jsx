import React from 'react';
import { Link } from 'react-router-dom';
import './Crud.css';

const Crud = () => {
    return (
        <div className="crud-container">
            <h1>Gestión de Pedidos</h1>
            <div className="crud-buttons">
                <Link to="/create" className="crud-button">
                    <button>Crear Pedido</button>
                </Link>
                <Link to="/read" className="crud-button">
                    <button>Leer Pedidos</button>
                </Link>
                <button className="crud-button">Actualizar Pedido</button>
                <button className="crud-button">Eliminar Pedido</button>
            </div>
        </div>
    );
};

export default Crud;
