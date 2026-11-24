import { ErrorFormato, ErrorServicio } from '../services/coingecko';

/** Traduce un error técnico a un mensaje comprensible para la persona usuaria. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorServicio) {
    if (error.estadoHttp === 429) {
      return 'el servicio recibió demasiadas consultas en poco tiempo. Esperá un minuto y volvé a intentar.';
    }
    return `no se pudieron obtener los precios. ${error.message}`;
  }
  if (error instanceof ErrorFormato) {
    return `no se pudieron interpretar los datos. ${error.message}`;
  }
  if (error instanceof TypeError) {
    // fetch lanza TypeError cuando no hay conexión o el servicio bloquea la solicitud.
    return 'no se pudo conectar con el servicio. Revisá tu conexión a internet y volvé a intentar en unos segundos.';
  }
  return 'ocurrió un problema inesperado al consultar los precios. Volvé a intentar.';
}
