// Enlaces entre detalles (Actividad 4). Se escribieron ANTES de extraer el
// componente EnlacesMonedas, para comprobar que la refactorización conserva
// el comportamiento: mismos textos, mismos destinos y la misma búsqueda de origen.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, test, vi } from 'vitest';
import { obtenerCotizaciones } from '../services/coingecko';
import { cotizacionesDe } from '../test/datos';
import { PaginaDetalle } from './PaginaDetalle';

vi.mock('../services/coingecko', async (importOriginal) => {
  const original = await importOriginal<typeof import('../services/coingecko')>();
  return { ...original, obtenerCotizaciones: vi.fn() };
});

/** Renderiza la página de detalle en la ruta indicada (con estado de navegación opcional). */
function renderDetalle(pathname: string, state?: unknown) {
  render(
    <MemoryRouter initialEntries={[{ pathname, state }]}>
      <Routes>
        <Route path="/criptomonedas/:id" element={<PaginaDetalle />} />
      </Routes>
    </MemoryRouter>,
  );
}

test('si la criptomoneda no existe, ofrece enlaces al detalle de las tres', () => {
  renderDetalle('/criptomonedas/dogecoin');

  expect(
    screen.getByRole('heading', { name: 'Criptomoneda no encontrada' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Bitcoin (BTC)' })).toHaveAttribute(
    'href',
    '/criptomonedas/bitcoin',
  );
  expect(screen.getByRole('link', { name: 'Ethereum (ETH)' })).toHaveAttribute(
    'href',
    '/criptomonedas/ethereum',
  );
  expect(screen.getByRole('link', { name: 'Solana (SOL)' })).toHaveAttribute(
    'href',
    '/criptomonedas/solana',
  );
  // Con un identificador inválido no se consulta la API.
  expect(obtenerCotizaciones).not.toHaveBeenCalled();
});

test('el detalle enlaza a las otras dos criptomonedas y conserva la búsqueda de origen', async () => {
  vi.mocked(obtenerCotizaciones).mockImplementation(async (ids) => cotizacionesDe(ids));
  const usuario = userEvent.setup();
  // Se llega desde el listado con la búsqueda ?orden=nombre.
  renderDetalle('/criptomonedas/bitcoin', { origen: '?orden=nombre' });

  const otras = screen.getByRole('navigation', { name: 'Otras criptomonedas' });
  const enlaces = within(otras).getAllByRole('link');
  expect(enlaces.map((enlace) => enlace.textContent)).toEqual([
    'Ethereum (ETH)',
    'Solana (SOL)',
  ]);
  expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual([
    '/criptomonedas/ethereum',
    '/criptomonedas/solana',
  ]);

  // Al pasar a otra moneda, «Volver a los resultados» sigue apuntando a la misma búsqueda.
  await usuario.click(within(otras).getByRole('link', { name: 'Ethereum (ETH)' }));
  expect(
    await screen.findByRole('heading', { level: 2, name: 'Ethereum (ETH)' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Volver a los resultados/ })).toHaveAttribute(
    'href',
    '/?orden=nombre',
  );
});
