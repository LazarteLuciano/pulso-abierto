// Preparación común de las pruebas (se ejecuta antes de cada archivo de prueba).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { useFavoritosStore } from '../store/favoritosStore';

beforeEach(() => {
  // Cada prueba empieza sin favoritos y con el almacenamiento vacío,
  // para que ningún caso dependa de lo que dejó el anterior.
  localStorage.clear();
  useFavoritosStore.setState({ favoritos: [] });
});

afterEach(() => {
  cleanup();
});
