// Datos de prueba: cotizaciones ya normalizadas (la forma que usa la interfaz).
// Las pruebas nunca consultan la API real de CoinGecko.
import { MONEDAS } from '../data/monedas';
import type { Cotizacion, MonedaId } from '../types/cripto';

const PRECIOS: Record<MonedaId, number> = {
  bitcoin: 95000,
  ethereum: 3200.5,
  solana: 150.25,
};

export const COTIZACIONES: Cotizacion[] = MONEDAS.map((moneda) => ({
  moneda,
  precioUsd: PRECIOS[moneda.id],
}));

/** Devuelve solo las cotizaciones pedidas (como haría el servicio real). */
export function cotizacionesDe(ids: readonly MonedaId[]): Cotizacion[] {
  return COTIZACIONES.filter(({ moneda }) => ids.includes(moneda.id));
}

/** Promesa que se resuelve "a mano", para poder observar el estado de carga. */
export function promesaPendiente<T>() {
  let resolver!: (valor: T) => void;
  const promesa = new Promise<T>((resolve) => {
    resolver = resolve;
  });
  return { promesa, resolver };
}
