import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error de interfaz GasConnect:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="app-crash">
        <div className="app-crash__card">
          <span className="app-crash__icon">🔥</span>
          <h1>GasConnect no pudo mostrar esta pantalla</h1>
          <p>{this.state.error.message || 'Ocurrió un error inesperado en la interfaz.'}</p>
          <button type="button" onClick={() => window.location.assign('/dashboard')}>
            Volver al panel
          </button>
          <button
            type="button"
            className="app-crash__secondary"
            onClick={() => window.location.reload()}
          >
            Recargar
          </button>
        </div>
      </main>
    );
  }
}

export default AppErrorBoundary;
