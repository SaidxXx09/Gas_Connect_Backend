import React from 'react';
import './Gallery.css';
import GalleryLogo from '../../assets/galeria.png';

const Gallery = () => {
    return (
        <section className="gallery bg-dark" id="galeria">
            <div className="container text-center">
                <h2 className="section-title text-light" data-aos="fade-down">
                    Galería de Entregas
                </h2>
                
                <p className="gallery-description" data-aos="fade-up" data-aos-delay="200">
                    Explora nuestra galería para ver a nuestro equipo en acción.
                </p>
                
                <img 
                    className="gallery-image" 
                    src={GalleryLogo} 
                    alt="logotipo de galeria" 
                    data-aos="zoom-in" 
                    data-aos-duration="800"
                    data-aos-delay="400"
                />
            </div>
        </section>
    );
};

export default Gallery;
