const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

const queryGroq = async ({ messages }) => {
  if (!process.env.GROQ_API_KEY) {
    const error = new Error('GROQ_API_KEY no está configurada');
    error.status = 503;
    throw error;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    const error = new Error('messages es obligatorio');
    error.status = 400;
    throw error;
  }

  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
        messages,
        temperature: 0.35,
        max_completion_tokens: 600,
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch (error) {
    const requestError = new Error(
      error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'Groq tardó demasiado en responder'
        : `No se pudo conectar con Groq: ${error.message}`,
    );
    requestError.status = error.name === 'TimeoutError' || error.name === 'AbortError' ? 504 : 502;
    throw requestError;
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Groq rechazó la solicitud');
    error.status = response.status;
    throw error;
  }

  const text = payload?.choices?.[0]?.message?.content;
  if (!text) {
    const error = new Error('Groq no devolvió una respuesta de texto');
    error.status = 502;
    throw error;
  }

  return text.trim();
};

module.exports = { queryGroq };
