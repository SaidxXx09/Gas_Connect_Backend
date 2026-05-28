import React from 'react';
import './Apepe.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import PhoneImage from '../../assets/telefono-Photoroom.png';
import GooglePlay from '../../assets/googleplay.png';
import AppStore from '../../assets/appstore.png';

const Apepe = () => {
    return (
        <section className="app-promo container" id="app">
            <div className="app-grid">
                <img 
                    src={PhoneImage} 
                    width="300" 
                    height="500" 
                    alt="Teléfono mostrando la aplicación GasConnect" 
                    loading="lazy"
                    className="app-phone-image"
                    data-aos="flip-left"
                    data-aos-duration="1500"
                />

                <div className="app-content" data-aos="fade-left" data-aos-delay="300">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={20}
                        slidesPerView={1}
                        autoplay={{ delay: 4000 }}
                        pagination={{ clickable: true }}
                    >
                        <SwiperSlide>
                            <h2 className="section-title">Descarga la aplicación</h2>
                            <p className="app-description">
                                Con nuestra app, puedes programar la entrega de gas a domicilio fácilmente.
                            </p>
                            <div className="app-buttons">
                                <a href="https://play.google.com/store/games?device=windows" 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   aria-label="Descargar en Google Play"
                                   data-aos="zoom-in"
                                   data-aos-delay="600">
                                    <img src={GooglePlay} alt="Logo Google Play" loading="lazy"/>
                                </a>
                                <a href="https://www.apple.com/la/app-store/" 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   aria-label="Descargar en App Store"
                                   data-aos="zoom-in"
                                   data-aos-delay="800">
                                    <img src={AppStore} alt="Logo App Store" loading="lazy"/>
                                </a>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                </div>
            </div>
        </section>
    );
};

export default Apepe;
