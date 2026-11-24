// B. Consulta de datos y C. Error y recuperación.
// Se reemplaza la función de servicio: la prueba se concentra en cómo responde la
// interfaz ante cada resultado, sin hacer solicitudes reales a CoinGecko.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, test, vi } from 'vitest';
import { ErrorServicio, obtenerCotizaciones } from '../services/coingecko';
import { COTIZACIONES, promesaPendiente } from '../test/datos';
import type { Cotizacion } from '../types/cripto';
import { PaginaConsulta } from './PaginaConsulta';

vi.mock('../services/coingecko', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/coingecko')>();
  return { ...original, obtenerCotizaciones: vi.fn() };
});

const obtenerCotizacionesSimulado = vi.mocked(obtenerCotizaciones);

/** Renderiza la página y completa el formulario como lo haría una persona. */
async function consultarPrecios() {
  const usuario = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/']}>
      <PaginaConsulta />
    </MemoryRouter>,
  );
  await usuario.selectOptions(
    screen.getByLabelText('Ordenar resultados por'),
    'Nombre (A–Z)',
  );
  await usuario.click(screen.getByRole('button', { name: 'Consultar precios' }));
  return usuario;
}

describe('Consulta de precios', () => {
  test('muestra la carga y después el resultado', async () => {
    const { promesa, resolver } = promesaPendiente<Cotizacion[]>();
    obtenerCotizacionesSimulado.mockReturnValueOnce(promesa);

    await consultarPrecios();

    // Carga: el estado lo comunica y el botón indica que hay una consulta en curso.
    expect(screen.getByRole('status')).toHaveTextContent('Cargando');
    expect(screen.getByRole('button', { name: 'Consultando…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    resolver(COTIZACIONES);

    // Resultado: aparecen las tres tarjetas y el mensaje con la cantidad visible.
    expect(await screen.findByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ethereum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Solana' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'se muestran 3 de 3 criptomonedas',
    );
    // Una sola solicitud por consulta.
    expect(obtenerCotizacionesSimulado).toHaveBeenCalledTimes(1);
  });

  test('si el servicio responde sin datos muestra el mensaje correspondiente', async () => {
    obtenerCotizacionesSimulado.mockResolvedValueOnce([]);

    await consultarPrecios();

    expect(await screen.findByText('Sin resultados:')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'el servicio no devolvió precios para mostrar',
    );
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  test('ante un error muestra un mensaje comprensible y permite reintentar', async () => {
    obtenerCotizacionesSimulado
      .mockRejectedValueOnce(new ErrorServicio(503))
      .mockResolvedValueOnce(COTIZACIONES);

    const usuario = await consultarPrecios();

    // Error: mensaje entendible + acción de reintento.
    const reintentar = await screen.findByRole('button', { name: 'Volver a intentar' });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Error: no se pudieron obtener los precios.',
    );

    // Recuperación: al reintentar se vuelve a consultar y aparecen los resultados.
    await usuario.click(reintentar);

    expect(await screen.findByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Volver a intentar' }),
    ).not.toBeInTheDocument();
    expect(obtenerCotizacionesSimulado).toHaveBeenCalledTimes(2);
  });
});
