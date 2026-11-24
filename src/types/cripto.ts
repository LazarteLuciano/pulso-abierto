// Tipos del dominio: describen las criptomonedas y los datos que usa la aplicación.

/** Identificadores admitidos por la aplicación (coinciden con los `ids` de CoinGecko). */
export type MonedaId = 'bitcoin' | 'ethereum' | 'solana';

/** Información fija de cada criptomoneda (no depende de la API). */
export interface MonedaInfo {
  id: MonedaId;
  nombre: string;
  simbolo: string;
  lanzamiento: number;
  descripcion: string;
}

/** Cotización ya procesada, lista para mostrarse en la interfaz. */
export interface Cotizacion {
  moneda: MonedaInfo;
  precioUsd: number;
  /** Los siguientes datos solo se piden en la vista de detalle. */
  variacion24h?: number | null;
  capitalizacionUsd?: number;
  volumen24hUsd?: number;
  actualizadoEn?: Date;
}

/** Estados posibles de una consulta a la API. Son mutuamente excluyentes. */
export type EstadoDatos =
  | { tipo: 'inicial' }
  | { tipo: 'carga' }
  | { tipo: 'resultado'; cotizaciones: Cotizacion[]; obtenidoEn: Date }
  | { tipo: 'vacio' }
  | { tipo: 'error'; mensaje: string };

/** Estados que comunica el componente EstadoConsulta. */
export type TipoEstado = EstadoDatos['tipo'];
