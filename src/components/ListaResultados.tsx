import { Link } from 'react-router';
import type { Cotizacion } from '../types/cripto';
import { TarjetaCripto } from './TarjetaCripto';

interface ListaResultadosProps {
  cotizaciones: readonly Cotizacion[];
  /** Búsqueda actual (?q=...&orden=...) para poder volver desde el detalle. */
  origen: string;
}

/** Representa la colección de resultados como tarjetas. */
export function ListaResultados({ cotizaciones, origen }: ListaResultadosProps) {
  if (cotizaciones.length === 0) {
    return <p className="muted">Aún no hay resultados para mostrar.</p>;
  }

  return (
    <ul className="cards">
      {cotizaciones.map(({ moneda, precioUsd }) => (
        // Clave estable: el id de la moneda no cambia aunque cambie el orden o el filtro.
        <li key={moneda.id}>
          <TarjetaCripto moneda={moneda} precioUsd={precioUsd}>
            {/* Enlace (no botón): su propósito es navegar al detalle. */}
            <Link
              className="card__link"
              to={`/criptomonedas/${moneda.id}`}
              state={{ origen }}
            >
              Ver detalle <span className="visually-hidden">de {moneda.nombre}</span>
            </Link>
          </TarjetaCripto>
        </li>
      ))}
    </ul>
  );
}
