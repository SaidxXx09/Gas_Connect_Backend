import { useEffect } from "react";
import Typed from "typed.js";
const Girl = () => {
    useEffect(() => {
        const typed = new Typed("#typed", {
            strings: [
                "a donde nos sea posible.",
                "a tu hogar.",
                "a tu negocio.",
                "cuando lo necesites."
            ],
            typeSpeed: 80,
            loop: true,
            showCursor: false
        })

        return () => typed.destroy();
    }, [])
    
    return (
        <main>
            <h2 id="typed"></h2>
        </main>
    )
}

export default Girl