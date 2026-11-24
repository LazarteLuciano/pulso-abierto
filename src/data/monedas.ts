import type { MonedaId, MonedaInfo } from '../types/cripto';

/** Catálogo de criptomonedas que consulta la aplicación (las mismas de la Actividad 1). */
export const MONEDAS: readonly MonedaInfo[] = [
  {
    id: 'bitcoin',
    nombre: 'Bitcoin',
    simbolo: 'BTC',
    lanzamiento: 2009,
    descripcion:
      'Primera criptomoneda descentralizada. Funciona sobre su propia cadena de bloques y suele utilizarse como reserva de valor.',
  },
  {
    id: 'ethereum',
    nombre: 'Ethereum',
    simbolo: 'ETH',
    lanzamiento: 2015,
    descripcion:
      'Plataforma que permite ejecutar contratos inteligentes y aplicaciones descentralizadas. ETH es su moneda nativa.',
  },
  {
    id: 'solana',
    nombre: 'Solana',
    simbolo: 'SOL',
    lanzamiento: 2020,
    descripcion:
      'Cadena de bloques orientada a la velocidad y a las comisiones bajas. SOL es su moneda nativa.',
  },
];

/** Identificadores de todas las monedas, en el orden del catálogo. */
export const MONEDA_IDS: readonly MonedaId[] = MONEDAS.map((moneda) => moneda.id);

/** Busca una moneda por su identificador. Devuelve undefined si no es una de las admitidas. */
export function buscarMoneda(id: string): MonedaInfo | undefined {
  return MONEDAS.find((moneda) => moneda.id === id);
}
