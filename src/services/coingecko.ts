// Servicio de acceso a datos: es el único módulo que conoce la API de CoinGecko.
// Arma la URL, hace la solicitud, comprueba la respuesta, valida el JSON y lo
// transforma al modelo de la aplicación (Cotizacion[]). Los componentes y el hook
// reciben datos ya procesados y no saben cómo se obtuvieron.
import { z } from 'zod';
import { MONEDAS } from '../data/monedas';
import type { Cotizacion, MonedaId } from '../types/cripto';

const API_BASE = 'https://api.coingecko.com/api/v3';
const RUTA_PRECIOS = '/simple/price';

/** Error que se produce cuando el servicio responde con un código HTTP no satisfactorio. */
export class ErrorServicio extends Error {
  readonly estadoHttp: number;

  constructor(estadoHttp: number) {
    super(`El servicio respondió con el código ${estadoHttp}.`);
    this.name = 'ErrorServicio';
    this.estadoHttp = estadoHttp;
  }
}

/** Error que se produce cuando la respuesta no tiene la forma esperada. */
export class ErrorFormato extends Error {
  constructor() {
    super('La respuesta del servicio no tiene el formato esperado.');
    this.name = 'ErrorFormato';
  }
}

// Forma de la respuesta de /simple/price. Los campos opcionales solo llegan
// cuando se piden con los parámetros include_* (vista de detalle).
const precioApiSchema = z.object({
  usd: z.number(),
  usd_market_cap: z.number().optional(),
  usd_24h_vol: z.number().optional(),
  usd_24h_change: z.number().nullable().optional(),
  last_updated_at: z.number().optional(),
});

const respuestaApiSchema = z.record(z.string(), precioApiSchema);

/** Tipos de la respuesta JSON, inferidos a partir del esquema. */
export type PrecioApi = z.infer<typeof precioApiSchema>;
export type RespuestaPreciosApi = z.infer<typeof respuestaApiSchema>;

export interface OpcionesConsulta {
  /** Pide también capitalización, volumen, variación 24 h y fecha de actualización. */
  detalle?: boolean;
  /** Permite cambiar la ruta (se usa solo para simular un error 404). */
  ruta?: string;
}

/**
 * Arma la dirección de la consulta. Es la misma de la Actividad 1:
 * /simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd
 * URLSearchParams se encarga de los separadores y de la codificación.
 */
export function construirUrlPrecios(
  ids: readonly MonedaId[],
  { detalle = false, ruta = RUTA_PRECIOS }: OpcionesConsulta = {},
): string {
  const url = new URL(`${API_BASE}${ruta}`);
  url.searchParams.set('ids', ids.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  if (detalle) {
    url.searchParams.set('include_market_cap', 'true');
    url.searchParams.set('include_24hr_vol', 'true');
    url.searchParams.set('include_24hr_change', 'true');
    url.searchParams.set('include_last_updated_at', 'true');
  }
  // La API espera las comas sin codificar (ids=bitcoin,ethereum,solana).
  return url.toString().replaceAll('%2C', ',');
}

/**
 * Transforma la respuesta de la API (un objeto con claves por moneda y nombres
 * como usd_24h_change) al modelo que usa la interfaz (Cotizacion[]).
 * Respeta el orden del catálogo y omite las monedas que la API no devolvió.
 */
export function normalizarCotizaciones(
  datos: RespuestaPreciosApi,
  ids: readonly MonedaId[],
): Cotizacion[] {
  return MONEDAS.filter((moneda) => ids.includes(moneda.id)).flatMap((moneda) => {
    const precio = datos[moneda.id];
    if (!precio) return [];
    return [
      {
        moneda,
        precioUsd: precio.usd,
        variacion24h: precio.usd_24h_change,
        capitalizacionUsd: precio.usd_market_cap,
        volumen24hUsd: precio.usd_24h_vol,
        actualizadoEn:
          precio.last_updated_at !== undefined
            ? new Date(precio.last_updated_at * 1000)
            : undefined,
      },
    ];
  });
}

/**
 * Consulta el precio en USD de las monedas indicadas.
 * - Si la respuesta HTTP no es exitosa, lanza ErrorServicio (con el código).
 * - Si el JSON no tiene la forma esperada, lanza ErrorFormato.
 * - Si la API no devuelve datos, resuelve con un arreglo vacío (no es un error).
 */
export async function obtenerCotizaciones(
  ids: readonly MonedaId[],
  opciones: OpcionesConsulta = {},
): Promise<Cotizacion[]> {
  const respuesta = await fetch(construirUrlPrecios(ids, opciones));

  if (!respuesta.ok) {
    throw new ErrorServicio(respuesta.status);
  }

  const json: unknown = await respuesta.json();
  const validacion = respuestaApiSchema.safeParse(json);
  if (!validacion.success) {
    throw new ErrorFormato();
  }

  return normalizarCotizaciones(validacion.data, ids);
}
