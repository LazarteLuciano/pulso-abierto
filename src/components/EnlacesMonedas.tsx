import { Link } from 'react-router';
import type { MonedaInfo } from '../types/cripto';

interface EnlacesMonedasProps {
  monedas: readonly MonedaInfo[];
  /** Estado de navegación que acompaña al enlace (por ejemplo, la búsqueda de origen). */
  state?: unknown;
}

/**
 * Lista de enlaces al detalle de cada criptomoneda: «Bitcoin (BTC)», «Ethereum (ETH)»…
 * Es la única implementación de esta lista: la usan la página de detalle y el
 * mensaje de criptomoneda no encontrada.
 */
export function EnlacesMonedas({ monedas, state }: EnlacesMonedasProps) {
  return (
    <ul className="enlaces">
      {monedas.map((moneda) => (
        <li key={moneda.id}>
          <Link to={`/criptomonedas/${moneda.id}`} state={state}>
            {moneda.nombre} ({moneda.simbolo})
          </Link>
        </li>
      ))}
    </ul>
  );
}
