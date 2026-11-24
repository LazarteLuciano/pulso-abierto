import {
  seleccionarAlternarFavorito,
  seleccionarEsFavorita,
  useFavoritosStore,
} from '../store/favoritosStore';
import type { MonedaInfo } from '../types/cripto';

interface BotonFavoritoProps {
  moneda: MonedaInfo;
}

/**
 * Marca o desmarca una criptomoneda como favorita.
 * Se usa en el listado y en el detalle: como ambos leen el mismo store,
 * un cambio en una vista se ve también en la otra.
 */
export function BotonFavorito({ moneda }: BotonFavoritoProps) {
  // Selectores: el botón solo se suscribe a "¿esta moneda es favorita?" y a la acción.
  const esFavorita = useFavoritosStore(seleccionarEsFavorita(moneda.id));
  const alternarFavorito = useFavoritosStore(seleccionarAlternarFavorito);

  return (
    // Botón (no enlace): cambia el estado de la interfaz, no navega.
    // El nombre accesible cambia con el estado: «Agregar Bitcoin a favoritas» /
    // «Quitar Bitcoin de favoritas».
    <button
      type="button"
      className={`btn btn--ghost${esFavorita ? ' btn--activo' : ''}`}
      onClick={() => alternarFavorito(moneda.id)}
    >
      <span aria-hidden="true">{esFavorita ? '★' : '☆'}</span>{' '}
      {esFavorita ? 'Quitar' : 'Agregar'}{' '}
      {/* Los espacios quedan fuera del span oculto para que el nombre accesible
          no se pegue («AgregarBitcoin») en algunos lectores y herramientas. */}
      <span className="visually-hidden">{moneda.nombre}</span>{' '}
      {esFavorita ? 'de favoritas' : 'a favoritas'}
    </button>
  );
}
