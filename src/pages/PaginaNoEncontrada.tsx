import { Link, useLocation } from 'react-router';

/** Página para direcciones que no coinciden con ninguna ruta. */
export function PaginaNoEncontrada() {
  const { pathname } = useLocation();

  return (
    <>
      <title>Página no encontrada — Pulso Abierto</title>
      <section className="panel" aria-labelledby="titulo-404">
        <h2 id="titulo-404">Página no encontrada</h2>
        <div className="status status--vacio">
          <span className="status__icon" aria-hidden="true">
            🧭
          </span>
          <p className="status__text">
            <strong>Error 404:</strong> la dirección <code>{pathname}</code> no
            corresponde a ninguna sección de Pulso Abierto.
          </p>
        </div>
        <Link className="link-volver" to="/">
          <span aria-hidden="true">←</span> Ir a la consulta de precios
        </Link>
      </section>
    </>
  );
}
