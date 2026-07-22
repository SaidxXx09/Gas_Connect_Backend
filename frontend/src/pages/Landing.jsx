import Header from "../components/header/Header"
import Hero from "../components/hero/Hero"
import About from "../components/about/About"
import Services from "../components/services/Services"
import Apepe from "../components/Apepe/Apepe"  // Cambia "apepe" por "Apepe"
import Gallery from "../components/gallery/Gallery"
import Contact from "../components/contact/Contact"
import Footer from "../components/footer/Footer"

const Landing = () => {
    return (
        <>
            <Header />
            <Hero />
            <About />
            <Services />
            <Apepe />
            <Gallery />
            <Contact />
            <Footer />
        </>
    );
};

export default Landing