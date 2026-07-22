const nodemailer = require('nodemailer');


const isBrevoConfigured = () =>
  Boolean(
    process.env.BREVO_API_KEY &&
    process.env.BREVO_SENDER_EMAIL
  );

const isSmtpConfigured = () =>
  Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );


const isEmailConfigured = () =>
  isBrevoConfigured() || isSmtpConfigured();


const sendWithBrevo = async ({
  email,
  subject,
  html
}) => {
  const response = await fetch(
    'https://api.brevo.com/v3/smtp/email',
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        Accept: 'application/json',
      },

      body: JSON.stringify({
        sender: {
          name:
            process.env.BREVO_SENDER_NAME ||
            'GasConnect Soporte',

          email:
            process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email,
          },
        ],

        subject,

        htmlContent: html,
      }),
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message =
      data.message ||
      data.code ||
      `Brevo respondió con estado ${response.status}`;

    throw new Error(message);
  }

  console.log('Correo enviado mediante Brevo:', {
    recipient: email,
    messageId: data.messageId,
  });

  return {
    provider: 'brevo',
    messageId: data.messageId,
  };
};


const createSmtpTransporter = () => {
  const port = Number(
    process.env.EMAIL_PORT || 465
  );

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,

    port,

    secure: port === 465,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
};


const sendWithSmtp = async ({
  email,
  subject,
  html
}) => {
  const transporter =
    createSmtpTransporter();

  const info = await transporter.sendMail({
    from: `"${process.env.EMAIL_FROM ||
      'GasConnect Soporte'}" <${process.env.EMAIL_USER}>`,

    to: email,

    subject,

    html,
  });

  console.log('Correo enviado mediante SMTP:', {
    recipient: email,
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
  });

  return {
    provider: 'smtp',
    messageId: info.messageId,
  };
};


const sendEmail = async ({
  email,
  subject,
  html
}) => {
  if (!email) {
    throw new Error(
      'El correo del destinatario es obligatorio'
    );
  }

  if (!subject) {
    throw new Error(
      'El asunto del correo es obligatorio'
    );
  }

  if (isBrevoConfigured()) {
    try {
      return await sendWithBrevo({
        email,
        subject,
        html,
      });
    } catch (error) {
      console.error(
        'Error al enviar mediante Brevo:',
        error.message
      );


      if (!isSmtpConfigured()) {
        throw error;
      }

      console.warn(
        'Intentando el respaldo SMTP...'
      );
    }
  }

  if (isSmtpConfigured()) {
    try {
      return await sendWithSmtp({
        email,
        subject,
        html,
      });
    } catch (error) {
      console.error(
        'Error SMTP al enviar correo:',
        {
          code: error.code,
          command: error.command,
          responseCode: error.responseCode,
          response: error.response,
          message: error.message,
        }
      );

      throw error;
    }
  }

  throw new Error(
    'No existe un servicio de correo configurado'
  );
};

module.exports = {
  sendEmail,
  isEmailConfigured,
};