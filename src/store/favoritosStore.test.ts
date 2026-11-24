// Persistencia del store de favoritos (localStorage de jsdom).
import { describe, expect, test, vi } from 'vitest';
import { CLAVE_FAVORITOS, useFavoritosStore } from './favoritosStore';

function leerGuardado() {
  return JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) ?? 'null');
}

describe('persistencia de favoritos', () => {
  test('guarda solo los identificadores al marcar y al desmarcar', () => {
    const { alternarFavorito } = useFavoritosStore.getState();

    alternarFavorito('bitcoin');
    alternarFavorito('solana');
    expect(leerGuardado()).toEqual({
      state: { favoritos: ['bitcoin', 'solana'] },
      version: 0,
    });

    alternarFavorito('bitcoin');
    expect(leerGuardado()).toEqual({ state: { favoritos: ['solana'] }, version: 0 });
  });

  test('recupera los favoritos guardados al rehidratar (como después de recargar)', async () => {
    localStorage.setItem(
      CLAVE_FAVORITOS,
      JSON.stringify({ state: { favoritos: ['ethereum'] }, version: 0 }),
    );

    await useFavoritosStore.persist.rehydrate();

    expect(useFavoritosStore.getState().favoritos).toEqual(['ethereum']);
  });

  // Casos del diagnóstico (consigna 6): datos guardados dañados o modificados a mano.
  function guardarAMano(favoritos: unknown) {
    localStorage.setItem(
      CLAVE_FAVORITOS,
      JSON.stringify({ state: { favoritos }, version: 0 }),
    );
  }

  test.each([
    ['un texto en lugar de un arreglo', 'bitcoin'],
    ['null', null],
    ['un objeto', { bitcoin: true }],
  ])(
    'si lo guardado es %s, empieza sin favoritos y la acción sigue funcionando',
    async (_, valor) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      guardarAMano(valor);

      await useFavoritosStore.persist.rehydrate();

      expect(useFavoritosStore.getState().favoritos).toEqual([]);
      useFavoritosStore.getState().alternarFavorito('bitcoin');
      expect(useFavoritosStore.getState().favoritos).toEqual(['bitcoin']);
    },
  );

  test('conserva solo los identificadores admitidos y sin repetir', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    guardarAMano(['bitcoin', 'dogecoin', 'bitcoin', 42]);

    await useFavoritosStore.persist.rehydrate();

    expect(useFavoritosStore.getState().favoritos).toEqual(['bitcoin']);
  });
});
