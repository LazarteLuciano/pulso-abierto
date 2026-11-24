import { Route, Routes } from 'react-router';
import { ContadorFavoritas } from './components/ContadorFavoritas';
import { PaginaConsulta } from './pages/PaginaConsulta';
import { PaginaDetalle } from './pages/PaginaDetalle';
import { PaginaNoEncontrada } from './pages/PaginaNoEncontrada';

/**
 * Coordina la estructura general: encabezado, rutas y pie.
 * Los favoritos ya no viven acá: están en el store global (store/favoritosStore.ts),
 * así que App no tiene que pasarlos por props a las páginas.
 */
export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido principal
      </a>

      <header className="site-header">
        <div className="container">
          <h1>Pulso Abierto</h1>
          <p className="site-header__desc">
            Consultá el precio actual de Bitcoin, Ethereum y Solana expresado en dólares
            estadounidenses (USD).
          </p>
          <ContadorFavoritas />
        </div>
      </header>

      <main id="contenido" className="container" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<PaginaConsulta />} />
          <Route path="/criptomonedas/:id" element={<PaginaDetalle />} />
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            Datos provistos por la{' '}
            <a href="https://www.coingecko.com/" target="_blank" rel="noreferrer">
              API pública de CoinGecko
              <span className="visually-hidden"> (se abre en una pestaña nueva)</span>
            </a>
            . Prototipo académico — Programación Web, Actividad 4.
          </p>
        </div>
      </footer>
    </>
  );
}
