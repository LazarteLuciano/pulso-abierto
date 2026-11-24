import { Link, useLocation, useParams } from 'react-router';
import { EstadoConsulta } from '../components/EstadoConsulta';
import { TarjetaCripto } from '../components/TarjetaCripto';
import { buscarMoneda, MONEDAS } from '../data/monedas';
import { useCotizaciones } from '../hooks/useCotizaciones';
import {
  formatearFechaHora,
  formatearHora,
  formatearPorcentaje,
  formatearUsdCompacto,
} from '../utils/formato';

/** Lee la búsqueda desde la que se llegó (si se llegó desde el listado). */
function leerOrigen(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'origen' in state &&
    typeof state.origen === 'string' &&
    state.origen.startsWith('?')
  ) {
    return state.origen;
  }
  return '';
}

/** Página "/criptomonedas/:id" — se reconstruye solo a partir de la URL. */
export function PaginaDetalle() {
  const { id = '' } = useParams();
  const location = useLocation();

  // Se comprueba que el id de la URL sea una de las monedas admitidas.
  const moneda = buscarMoneda(id);

  // Solo se consulta la API si el id es válido.
  const { estado, reintentar } = useCotizaciones({
    activa: moneda !== undefined,
    moneda: moneda?.id,
    detalle: true,
  });

  // Si se llegó desde el listado se vuelve a esa búsqueda; si se entró con un
  // enlace directo, se va a la consulta vacía.
  const origen = leerOrigen(location.state);
  const volverA = `/${origen}`;
  const textoVolver = origen ? 'Volver a los resultados' : 'Ir a la consulta de precios';

  if (!moneda) {
    return (
      <>
        <title>Criptomoneda no encontrada — Pulso Abierto</title>
        <section className="panel" aria-labelledby="titulo-detalle">
          <h2 id="titulo-detalle">Criptomoneda no encontrada</h2>
          <div className="status status--error">
            <span className="status__icon" aria-hidden="true">
              ⚠️
            </span>
            <p className="status__text">
              <strong>No existe:</strong> «{id}» no es una de las criptomonedas que
              consulta Pulso Abierto.
            </p>
          </div>
          <p>Podés ver el detalle de alguna de estas:</p>
          <ul className="enlaces">
            {MONEDAS.map((otra) => (
              <li key={otra.id}>
                <Link to={`/criptomonedas/${otra.id}`}>
                  {otra.nombre} ({otra.simbolo})
                </Link>
              </li>
            ))}
          </ul>
          <Link className="link-volver" to="/">
            <span aria-hidden="true">←</span> Ir a la consulta de precios
          </Link>
        </section>
      </>
    );
  }

  const cotizacion = estado.tipo === 'resultado' ? estado.cotizaciones[0] : undefined;
  const otras = MONEDAS.filter((otra) => otra.id !== moneda.id);

  let mensaje: string;
  switch (estado.tipo) {
    case 'inicial':
    case 'carga':
      mensaje = `consultando la cotización de ${moneda.nombre} en CoinGecko…`;
      break;
    case 'vacio':
      mensaje = `la consulta se realizó correctamente, pero el servicio no devolvió datos de ${moneda.nombre}.`;
      break;
    case 'error':
      mensaje = estado.mensaje;
      break;
    case 'resultado':
      mensaje = `cotización de ${moneda.nombre} obtenida a las ${formatearHora(estado.obtenidoEn)}.`;
      break;
  }

  return (
    <>
      <title>{`${moneda.nombre} (${moneda.simbolo}) — Pulso Abierto`}</title>

      <section className="panel" aria-labelledby="titulo-detalle">
        <Link className="link-volver" to={volverA}>
          <span aria-hidden="true">←</span> {textoVolver}
        </Link>
        <h2 id="titulo-detalle">
          {moneda.nombre} ({moneda.simbolo})
        </h2>
        <p>{moneda.descripcion}</p>
        <p className="muted">Lanzamiento: {moneda.lanzamiento}</p>

        <nav aria-label="Otras criptomonedas" className="otras">
          <p>Ver otra criptomoneda:</p>
          <ul className="enlaces">
            {otras.map((otra) => (
              <li key={otra.id}>
                <Link to={`/criptomonedas/${otra.id}`} state={location.state}>
                  {otra.nombre} ({otra.simbolo})
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section className="panel" aria-labelledby="titulo-estado">
        <h2 id="titulo-estado">Estado de la consulta</h2>
        <EstadoConsulta
          tipo={estado.tipo === 'inicial' ? 'carga' : estado.tipo}
          mensaje={mensaje}
          onReintentar={reintentar}
        />
      </section>

      <section
        className="panel"
        aria-labelledby="titulo-cotizacion"
        aria-busy={estado.tipo === 'carga'}
      >
        <h2 id="titulo-cotizacion">Cotización actual</h2>
        {cotizacion ? (
          // La tarjeta lee el favorito desde el store: es la misma fuente que usa el listado.
          <TarjetaCripto moneda={cotizacion.moneda} precioUsd={cotizacion.precioUsd}>
            <dl className="datos">
              <div>
                <dt>Variación en 24 h</dt>
                <dd>
                  {cotizacion.variacion24h != null ? (
                    <>
                      <span aria-hidden="true">
                        {cotizacion.variacion24h >= 0 ? '▲' : '▼'}
                      </span>{' '}
                      {formatearPorcentaje(cotizacion.variacion24h)}{' '}
                      {cotizacion.variacion24h >= 0 ? '(sube)' : '(baja)'}
                    </>
                  ) : (
                    'Sin dato'
                  )}
                </dd>
              </div>
              <div>
                <dt>Capitalización de mercado</dt>
                <dd>
                  {cotizacion.capitalizacionUsd !== undefined
                    ? formatearUsdCompacto(cotizacion.capitalizacionUsd)
                    : 'Sin dato'}
                </dd>
              </div>
              <div>
                <dt>Volumen operado en 24 h</dt>
                <dd>
                  {cotizacion.volumen24hUsd !== undefined
                    ? formatearUsdCompacto(cotizacion.volumen24hUsd)
                    : 'Sin dato'}
                </dd>
              </div>
              <div>
                <dt>Última actualización en CoinGecko</dt>
                <dd>
                  {cotizacion.actualizadoEn
                    ? formatearFechaHora(cotizacion.actualizadoEn)
                    : 'Sin dato'}
                </dd>
              </div>
            </dl>
          </TarjetaCripto>
        ) : (
          <p className="muted">
            La cotización aparecerá aquí cuando termine la consulta.
          </p>
        )}
      </section>
    </>
  );
}
