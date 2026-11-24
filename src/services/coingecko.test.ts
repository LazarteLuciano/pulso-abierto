// D. Servicio: se reemplaza fetch por una función simulada (no hay solicitudes reales).
import { describe, expect, test, vi } from 'vitest';
import { MONEDA_IDS } from '../data/monedas';
import { ErrorFormato, ErrorServicio, obtenerCotizaciones } from './coingecko';

const URL_LISTADO =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd';

/** Simula el objeto Response que devuelve fetch. */
function simularFetch(cuerpo: unknown, { ok = true, status = 200 } = {}) {
  const json = vi.fn().mockResolvedValue(cuerpo);
  const fetchSimulado = vi.fn().mockResolvedValue({ ok, status, json });
  vi.stubGlobal('fetch', fetchSimulado);
  return { fetchSimulado, json };
}

describe('obtenerCotizaciones', () => {
  test('con una respuesta exitosa devuelve las cotizaciones con la forma de la aplicación', async () => {
    // La API devuelve un objeto con claves por moneda y en cualquier orden.
    const { fetchSimulado } = simularFetch({
      solana: { usd: 150.25 },
      bitcoin: { usd: 95000 },
      ethereum: { usd: 3200.5 },
    });

    const resultado = await obtenerCotizaciones(MONEDA_IDS);

    // Una sola solicitud, a la misma dirección de la Actividad 1.
    expect(fetchSimulado).toHaveBeenCalledTimes(1);
    expect(fetchSimulado).toHaveBeenCalledWith(URL_LISTADO);
    // Se transforma en un arreglo de Cotizacion, en el orden del catálogo.
    expect(resultado).toEqual([
      {
        moneda: expect.objectContaining({
          id: 'bitcoin',
          nombre: 'Bitcoin',
          simbolo: 'BTC',
        }),
        precioUsd: 95000,
      },
      {
        moneda: expect.objectContaining({
          id: 'ethereum',
          nombre: 'Ethereum',
          simbolo: 'ETH',
        }),
        precioUsd: 3200.5,
      },
      {
        moneda: expect.objectContaining({
          id: 'solana',
          nombre: 'Solana',
          simbolo: 'SOL',
        }),
        precioUsd: 150.25,
      },
    ]);
  });

  test('en el detalle renombra los campos de la API y convierte la fecha', async () => {
    simularFetch({
      bitcoin: {
        usd: 95000,
        usd_market_cap: 1_880_000_000_000,
        usd_24h_vol: 41_500_000_000,
        usd_24h_change: -1.83,
        last_updated_at: 1_763_400_000,
      },
    });

    const [cotizacion] = await obtenerCotizaciones(['bitcoin'], { detalle: true });

    expect(cotizacion).toMatchObject({
      precioUsd: 95000,
      capitalizacionUsd: 1_880_000_000_000,
      volumen24hUsd: 41_500_000_000,
      variacion24h: -1.83,
      actualizadoEn: new Date(1_763_400_000 * 1000),
    });
  });

  test('si la respuesta tiene ok: false lanza ErrorServicio con el código HTTP', async () => {
    const { json } = simularFetch({ error: 'Not Found' }, { ok: false, status: 404 });

    const consulta = obtenerCotizaciones(MONEDA_IDS);

    await expect(consulta).rejects.toBeInstanceOf(ErrorServicio);
    await expect(consulta).rejects.toMatchObject({ estadoHttp: 404 });
    // Con una respuesta fallida no se intenta interpretar el cuerpo como datos.
    expect(json).not.toHaveBeenCalled();
  });

  test('si la API responde sin datos devuelve una colección vacía (no es un error)', async () => {
    simularFetch({});

    await expect(obtenerCotizaciones(MONEDA_IDS)).resolves.toEqual([]);
  });

  test('si el JSON no tiene la forma esperada lanza ErrorFormato', async () => {
    simularFetch({ bitcoin: { usd: 'mucho' } });

    await expect(obtenerCotizaciones(MONEDA_IDS)).rejects.toBeInstanceOf(ErrorFormato);
  });
});
