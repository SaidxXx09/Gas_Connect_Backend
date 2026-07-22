import { useEffect, useRef, useState } from 'react';
import { FiRefreshCw, FiSend } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const suggestions = [
  '¿Cuál es el estado de mi último pedido?',
  '¿Cómo puedo pagar mi pedido?',
  '¿Qué hago si mi entrega tarda?',
  'Resume mis pedidos recientes',
];

const initialMessage = {
  role: 'assistant',
  text: '¡Hola! Soy Sparky 🦉. Puedo ayudarte con tus pedidos y el funcionamiento de GasConnect.',
};

const AiAssistant = () => {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (question) => {
    const clean = String(question ?? input).trim();
    if (!clean || loading) return;

    setMessages((current) => [...current, { role: 'user', text: clean }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: clean });
      const answer = String(data?.respuesta || '').trim();
      if (!answer) throw new Error('Groq devolvió una respuesta vacía');
      setMessages((current) => [...current, { role: 'assistant', text: answer }]);
    } catch (error) {
      const message = error.response?.data?.mensaje || error.message || 'No se pudo consultar a Sparky';
      toast.error(message);
      setMessages((current) => [...current, { role: 'assistant', text: `No pude responder: ${message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="page-heading">
        <div><h2>Asistente Sparky</h2><p>Asistente conectado a Groq y limitado a los pedidos permitidos para tu cuenta.</p></div>
        <button type="button" className="gc-button gc-button--ghost gc-button--small" onClick={() => setMessages([initialMessage])}>
          <FiRefreshCw /> Limpiar chat
        </button>
      </header>

      <section className="ai-shell">
        <header className="ai-header">
          <div className="ai-avatar">🦉</div>
          <div><h3>Sparky IA</h3><p>Asistente de GasConnect · No inventa estados ni precios</p></div>
        </header>

        <div className="ai-messages">
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`ai-message ${message.role === 'user' ? 'user' : ''}`}>
              {message.text}
            </div>
          ))}
          {loading && <div className="ai-message">Sparky está pensando...</div>}
          <div ref={endRef} />
        </div>

        <div className="ai-suggestions">
          {suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => send(suggestion)} disabled={loading}>{suggestion}</button>
          ))}
        </div>

        <form className="chat-form" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <input value={input} onChange={(event) => setInput(event.target.value)} maxLength="1200" placeholder="Pregunta sobre tus pedidos..." />
          <button type="submit" className="gc-button gc-button--primary" disabled={loading || !input.trim()}><FiSend /></button>
        </form>
      </section>
    </>
  );
};

export default AiAssistant;
