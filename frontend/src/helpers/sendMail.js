const sendMailToRegister = (userMail, token) => {

    return sendMail(
        userMail,
        'Bienvenido a SMARTVET 🐶 😺',
        `
            <h1>Confirma tu cuenta</h1>
            <p>Hola, haz clic en el siguiente enlace para confirmar tu cuenta:</p>
            <a href="${process.env.URL_FRONTEND}confirm/${token}">
            Confirmar cuenta
            </a>
            <hr>
            <footer>El equipo de SMARTVET te da la más cordial bienvenida.</footer>
        `
    )
}

export default sendMailToRegister
