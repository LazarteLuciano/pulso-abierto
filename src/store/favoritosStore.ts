// Store global de favoritos (Zustand).
// Los favoritos se usan en el listado, en el detalle y en el encabezado, que no
// tienen un ancestro cercano en común: por eso es el único dato que pasa al store.
// Carga, error, resultados y criterios de búsqueda siguen fuera del store.
import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MONEDA_IDS } from '../data/monedas';
import type { MonedaId } from '../types/cripto';

/** Clave con la que se guardan los favoritos en localStorage. */
export const CLAVE_FAVORITOS = 'pulso-abierto:favoritos';

// Lo guardado en localStorage puede faltar, estar dañado o haber sido editado a mano,
// y TypeScript no lo comprueba en ejecución (createJSONStorage solo hace JSON.parse).
// Por eso se valida antes de incorporarlo al store (ver diagnóstico, consigna 6).
const guardadoSchema = z.object({ favoritos: z.array(z.unknown()) });

function esMonedaId(valor: unknown): valor is MonedaId {
  return MONEDA_IDS.some((id) => id === valor);
}

/**
 * Convierte lo recuperado del almacenamiento en una lista segura de favoritos:
 * - si no hay nada guardado (primera visita), devuelve una lista vacía;
 * - si la estructura no es la esperada, la descarta;
 * - si es un arreglo, conserva solo los identificadores admitidos y sin repetir.
 */
export function recuperarFavoritos(guardado: unknown): MonedaId[] {
  if (guardado === undefined) return [];

  const resultado = guardadoSchema.safeParse(guardado);
  if (!resultado.success) {
    console.warn(
      '[favoritos] Se descartó el valor guardado: no tiene el formato esperado.',
      guardado,
    );
    return [];
  }

  const validos = [...new Set(resultado.data.favoritos.filter(esMonedaId))];
  if (validos.length !== resultado.data.favoritos.length) {
    console.warn(
      '[favoritos] Se ignoraron identificadores desconocidos o repetidos.',
      resultado.data.favoritos,
    );
  }
  return validos;
}

export interface FavoritosStore {
  /** Identificadores de las criptomonedas marcadas como favoritas. */
  favoritos: MonedaId[];
  /** Agrega la moneda si no estaba o la quita si ya estaba. */
  alternarFavorito: (id: MonedaId) => void;
}

export const useFavoritosStore = create<FavoritosStore>()(
  persist(
    (set) => ({
      favoritos: [],
      alternarFavorito: (id) =>
        // Actualización inmutable: filter y la propagación crean arreglos nuevos.
        set((estado) => ({
          favoritos: estado.favoritos.includes(id)
            ? estado.favoritos.filter((favorito) => favorito !== id)
            : [...estado.favoritos, id],
        })),
    }),
    {
      name: CLAVE_FAVORITOS,
      storage: createJSONStorage(() => localStorage),
      // Solo se guardan los identificadores. Si en el futuro el store suma otros
      // datos (carga, error, etc.), quedan fuera de la persistencia.
      partialize: (estado) => ({ favoritos: estado.favoritos }),
      // Rehidratación: por defecto persist copia lo guardado tal cual
      // ({ ...actual, ...guardado }). Acá se valida antes de usarlo.
      merge: (guardado, actual) => ({
        ...actual,
        favoritos: recuperarFavoritos(guardado),
      }),
    },
  ),
);

// Selectores: cada componente se suscribe solo a la parte que necesita.

/** ¿La moneda indicada está entre las favoritas? (devuelve un booleano). */
export const seleccionarEsFavorita = (id: MonedaId) => (estado: FavoritosStore) =>
  estado.favoritos.includes(id);

/** Cantidad de favoritas: se deriva de la colección, no se guarda aparte. */
export const seleccionarCantidadFavoritas = (estado: FavoritosStore) =>
  estado.favoritos.length;

export const seleccionarFavoritos = (estado: FavoritosStore) => estado.favoritos;

export const seleccionarAlternarFavorito = (estado: FavoritosStore) =>
  estado.alternarFavorito;
