// A. Favoritos entre vistas: lo que se marca en el listado se ve en el detalle
// (y en el contador del encabezado), porque todas las vistas leen el mismo store.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, test, vi } from 'vitest';
import App from './App';
import { obtenerCotizaciones } from './services/coingecko';
import { cotizacionesDe } from './test/datos';

vi.mock('./services/coingecko', async (importOriginal) => {
  const original = await importOriginal<typeof import('./services/coingecko')>();
  return { ...original, obtenerCotizaciones: vi.fn() };
});

test('un favorito marcado en el listado aparece marcado en el detalle y viceversa', async () => {
  vi.mocked(obtenerCotizaciones).mockImplementation(async (ids) => cotizacionesDe(ids));
  const usuario = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/?orden=nombre']}>
      <App />
    </MemoryRouter>,
  );
  const contador = screen.getByText(/Favoritas:/);
  expect(contador).toHaveTextContent('Favoritas: 0');

  // En el listado se marca Ethereum.
  await usuario.click(
    await screen.findByRole('button', { name: 'Agregar Ethereum a favoritas' }),
  );
  expect(contador).toHaveTextContent('Favoritas: 1');

  // En el detalle de Ethereum la selección se conserva.
  await usuario.click(screen.getByRole('link', { name: 'Ver detalle de Ethereum' }));
  expect(
    await screen.findByRole('heading', { level: 2, name: 'Ethereum (ETH)' }),
  ).toBeInTheDocument();
  const botonDetalle = await screen.findByRole('button', {
    name: 'Quitar Ethereum de favoritas',
  });

  // Se desmarca desde el detalle...
  await usuario.click(botonDetalle);
  expect(contador).toHaveTextContent('Favoritas: 0');

  // ...y al volver al listado también aparece desmarcada.
  await usuario.click(screen.getByRole('link', { name: /Volver a los resultados/ }));
  expect(
    await screen.findByRole('button', { name: 'Agregar Ethereum a favoritas' }),
  ).toBeInTheDocument();
});
