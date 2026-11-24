// Hook que coordina la información externa: cuándo consultar, la carga, el error,
// el reintento y el descarte de respuestas desactualizadas.
// (Extraído de PaginaConsulta y PaginaDetalle en la refactorización asistida por IA.)
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { MONEDA_IDS } from '../data/monedas';
import { obtenerCotizaciones } from '../services/coingecko';
import { leerModoSimulacion, simularConsulta } from '../services/simulacion';
import type { Cotizacion, EstadoDatos, MonedaId } from '../types/cripto';
import { mensajeDeError } from '../utils/errores';

interface OpcionesCotizaciones {
  /** false mientras no corresponda consultar (se devuelve el estado inicial). */
  activa: boolean;
  /** Si se indica, se consulta solo esa moneda; si no, las tres. */
  moneda?: MonedaId;
  /** Pide también los datos adicionales de la vista de detalle. */
  detalle?: boolean;
}

/** Última respuesta recibida, junto con la clave de la solicitud que la produjo. */
type Respuesta =
  | { clave: string; tipo: 'ok'; cotizaciones: Cotizacion[]; obtenidoEn: Date }
  | { clave: string; tipo: 'error'; mensaje: string };

export function useCotizaciones({
  activa,
  moneda,
  detalle = false,
}: OpcionesCotizaciones) {
  const [searchParams] = useSearchParams();
  const simular = leerModoSimulacion(searchParams.get('simular'));

  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);

  // Identifica la solicitud actual. Si cambia algún valor (otra moneda, un
  // reintento, etc.), la respuesta guardada deja de corresponder.
  const clave = `${moneda ?? 'todas'}|${detalle}|${simular ?? 'real'}|${intento}`;

  useEffect(() => {
    if (!activa) return;

    // Si se inicia otra solicitud antes de que termine esta, la limpieza
    // marca esta como no vigente y su resultado se descarta.
    let vigente = true;
    const ids = moneda ? [moneda] : MONEDA_IDS;
    const pedido = simular
      ? simularConsulta(simular, ids, { detalle })
      : obtenerCotizaciones(ids, { detalle });

    pedido
      .then((cotizaciones) => {
        if (vigente)
          setRespuesta({ clave, tipo: 'ok', cotizaciones, obtenidoEn: new Date() });
      })
      .catch((error: unknown) => {
        if (vigente)
          setRespuesta({ clave, tipo: 'error', mensaje: mensajeDeError(error) });
      });

    return () => {
      vigente = false;
    };
  }, [activa, clave, moneda, detalle, simular]);

  /** Vuelve a consultar (forma funcional porque depende del valor previo). */
  function reintentar() {
    setIntento((anterior) => anterior + 1);
  }

  // El estado se deriva durante el render: no hace falta guardar "cargando"
  // en un estado aparte ni llamar a setState de forma sincrónica en el efecto.
  let estado: EstadoDatos;
  if (!activa) {
    estado = { tipo: 'inicial' };
  } else if (respuesta === null || respuesta.clave !== clave) {
    estado = { tipo: 'carga' };
  } else if (respuesta.tipo === 'error') {
    estado = { tipo: 'error', mensaje: respuesta.mensaje };
  } else if (respuesta.cotizaciones.length === 0) {
    estado = { tipo: 'vacio' };
  } else {
    estado = {
      tipo: 'resultado',
      cotizaciones: respuesta.cotizaciones,
      obtenidoEn: respuesta.obtenidoEn,
    };
  }

  return { estado, reintentar };
}
