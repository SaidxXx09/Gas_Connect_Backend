import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <section className="contact-section container" id="contacto">
            <div className="contact-grid">
                
                <div className="contact-form-container" data-aos="fade-right">
                    <h2 className="section-title text-center">¿Tienes preguntas? Escríbenos</h2>
                    <form className="contact-form">
                        <input type="text" name="nombre" placeholder="Nombre" required className="input-animate" />
                        <input type="email" name="correo" placeholder="Correo" required className="input-animate" />
                        <input type="tel" name="celular" placeholder="Celular" required className="input-animate" />
                        <textarea name="observaciones" placeholder="Observaciones" rows="5" className="input-animate"></textarea>

                        <label className="checkbox-label">
                            <input type="checkbox" required />
                            Acepto los Términos y condiciones
                        </label>

                        <button type="submit" className="btn btn--primary btn-full-width btn-animate">Enviar Mensaje</button>
                    </form>
                </div>


                <div className="contact-map" data-aos="fade-left" data-aos-delay="200">
                    <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15959.183572836267!2d-78.49079545!3d-0.1806532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a72d5d8836d%3A0x6a0c0e5a917036a1!2sQuito%2C%20Ecuador!5e0!3m2!1ses!2sec!4v1700000000000!5m2!1ses!2sec" 
                        width="600" height="450" 
                        style={{border: 0}} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
        </section>
    );
};

export default Contact;
