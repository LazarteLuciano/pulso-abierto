// Reglas de validación del formulario de consulta (Zod).
import { z } from 'zod';

export const LARGO_MINIMO_BUSQUEDA = 2;
export const LARGO_MAXIMO_BUSQUEDA = 20;

/** Opciones del control de selección "Ordenar por". */
export const ORDENES = ['nombre', 'precio-desc', 'precio-asc'] as const;
export type Orden = (typeof ORDENES)[number];

export const ETIQUETAS_ORDEN: Record<Orden, string> = {
  nombre: 'Nombre (A–Z)',
  'precio-desc': 'Precio: de mayor a menor',
  'precio-asc': 'Precio: de menor a mayor',
};

export const consultaSchema = z.object({
  // Regla 1: el texto es opcional, pero si se escribe algo debe tener al menos
  // 2 caracteres después de quitar los espacios del principio y del final.
  busqueda: z
    .string()
    .trim()
    .max(LARGO_MAXIMO_BUSQUEDA, {
      error: `Escribí como máximo ${LARGO_MAXIMO_BUSQUEDA} caracteres.`,
    })
    .refine((texto) => texto.length === 0 || texto.length >= LARGO_MINIMO_BUSQUEDA, {
      error: `Escribí al menos ${LARGO_MINIMO_BUSQUEDA} letras (sin contar espacios) o dejá el campo vacío para ver todas.`,
    }),
  // Regla 2: el orden debe ser una de las opciones admitidas.
  orden: z.enum(ORDENES, { error: 'Elegí cómo querés ordenar los resultados.' }),
});

/** Criterios ya validados (el texto viene sin espacios sobrantes). */
export type CriteriosConsulta = z.infer<typeof consultaSchema>;

/** Valores "crudos" del formulario, tal como los escribe la persona. */
export interface ValoresFormulario {
  busqueda: string;
  orden: string;
}

export type ErroresFormulario = Partial<Record<keyof ValoresFormulario, string>>;

/**
 * Lee los criterios guardados en la URL (?q=...&orden=...).
 * Devuelve null si todavía no se hizo ninguna consulta o si los parámetros no son válidos.
 */
export function criteriosDesdeUrl(params: URLSearchParams): CriteriosConsulta | null {
  if (!params.has('orden')) return null;
  const resultado = consultaSchema.safeParse({
    busqueda: params.get('q') ?? '',
    orden: params.get('orden'),
  });
  return resultado.success ? resultado.data : null;
}
