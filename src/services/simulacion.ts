// Simulación controlada de estados (igual que en la Actividad 1 con ?simular=...).
// Sirve para poder observar la carga, la ausencia de datos y el error,
// ya que la API casi siempre responde bien.
import type { Cotizacion, MonedaId } from '../types/cripto';
import { obtenerCotizaciones, type OpcionesConsulta } from './coingecko';

export type ModoSimulacion = 'lento' | 'vacio' | 'error';

const MODOS: readonly ModoSimulacion[] = ['lento', 'vacio', 'error'];

/** Convierte el valor del parámetro ?simular= en un modo válido o null. */
export function leerModoSimulacion(valor: string | null): ModoSimulacion | null {
  return MODOS.find((modo) => modo === valor) ?? null;
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simularConsulta(
  modo: ModoSimulacion,
  ids: readonly MonedaId[],
  opciones: OpcionesConsulta = {},
): Promise<Cotizacion[]> {
  switch (modo) {
    case 'lento':
      // Tarda 3 segundos y después hace la consulta real.
      await esperar(3000);
      return obtenerCotizaciones(ids, opciones);
    case 'vacio':
      // La "API" responde bien pero sin datos.
      await esperar(800);
      return [];
    case 'error':
      // Consulta una ruta inexistente: la API responde 404 y response.ok es false.
      return obtenerCotizaciones(ids, {
        ...opciones,
        ruta: '/simple/precio-inexistente',
      });
  }
}
