// A. Favoritos: la persona marca y desmarca una criptomoneda y la interfaz lo refleja.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { buscarMoneda } from '../data/monedas';
import { TarjetaCripto } from './TarjetaCripto';

const bitcoin = buscarMoneda('bitcoin')!;

test('permite marcar y desmarcar una criptomoneda como favorita', async () => {
  // Preparación (el store empieza vacío: ver src/test/setup.ts).
  const usuario = userEvent.setup();
  render(<TarjetaCripto moneda={bitcoin} precioUsd={95000} />);
  expect(screen.queryByText('Favorita')).not.toBeInTheDocument();

  // Interacción: marcar.
  await usuario.click(
    screen.getByRole('button', { name: 'Agregar Bitcoin a favoritas' }),
  );

  // Comprobación: el botón cambia su nombre accesible y aparece la insignia.
  expect(
    screen.getByRole('button', { name: 'Quitar Bitcoin de favoritas' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Favorita')).toBeInTheDocument();

  // Interacción: desmarcar.
  await usuario.click(
    screen.getByRole('button', { name: 'Quitar Bitcoin de favoritas' }),
  );

  expect(
    screen.getByRole('button', { name: 'Agregar Bitcoin a favoritas' }),
  ).toBeInTheDocument();
  expect(screen.queryByText('Favorita')).not.toBeInTheDocument();
});

test('el botón de favorito se puede usar con el teclado', async () => {
  const usuario = userEvent.setup();
  render(<TarjetaCripto moneda={bitcoin} precioUsd={95000} />);

  await usuario.tab();
  expect(
    screen.getByRole('button', { name: 'Agregar Bitcoin a favoritas' }),
  ).toHaveFocus();
  await usuario.keyboard('{Enter}');

  expect(
    screen.getByRole('button', { name: 'Quitar Bitcoin de favoritas' }),
  ).toHaveFocus();
});
