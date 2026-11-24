import { seleccionarCantidadFavoritas, useFavoritosStore } from '../store/favoritosStore';

/** Indicador del encabezado. La cantidad se deriva de la colección del store. */
export function ContadorFavoritas() {
  const cantidad = useFavoritosStore(seleccionarCantidadFavoritas);

  return (
    <p className="site-header__favoritas">
      <span aria-hidden="true">★</span> Favoritas: <strong>{cantidad}</strong>
    </p>
  );
}
