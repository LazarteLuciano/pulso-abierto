import type { ReactNode } from 'react';
import { seleccionarEsFavorita, useFavoritosStore } from '../store/favoritosStore';
import type { MonedaInfo } from '../types/cripto';
import { formatearUsd } from '../utils/formato';
import { BotonFavorito } from './BotonFavorito';

interface TarjetaCriptoProps {
  moneda: MonedaInfo;
  precioUsd: number;
  /** Contenido extra: el enlace al detalle o los datos adicionales. */
  children?: ReactNode;
}

/** Tarjeta reutilizable que representa una criptomoneda (se usa en el listado y en el detalle). */
export function TarjetaCripto({ moneda, precioUsd, children }: TarjetaCriptoProps) {
  // La tarjeta consulta el store directamente: ya no recibe los favoritos por props.
  const esFavorita = useFavoritosStore(seleccionarEsFavorita(moneda.id));

  return (
    <article className={`card card--${moneda.id}${esFavorita ? ' card--favorita' : ''}`}>
      <div className="card__header">
        <h3 className="card__title">{moneda.nombre}</h3>
        {esFavorita && (
          <span className="card__badge">
            <span aria-hidden="true">★</span> Favorita
          </span>
        )}
      </div>
      <p className="card__symbol">{moneda.simbolo}</p>
      <p className="card__price">{formatearUsd(precioUsd)}</p>
      <p className="card__meta">Precio actual en dólares estadounidenses (USD)</p>

      {children}

      <div className="card__actions">
        <BotonFavorito moneda={moneda} />
      </div>
    </article>
  );
}
