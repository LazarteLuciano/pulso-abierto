// Funciones puras para calcular la colección visible a partir de los datos originales.
import type { CriteriosConsulta, Orden } from '../schemas/consulta';
import type { Cotizacion } from '../types/cripto';

/** Pasa a minúsculas y quita tildes para comparar sin importar cómo se escribió. */
function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const comparadores: Record<Orden, (a: Cotizacion, b: Cotizacion) => number> = {
  nombre: (a, b) => a.moneda.nombre.localeCompare(b.moneda.nombre, 'es'),
  'precio-desc': (a, b) => b.precioUsd - a.precioUsd,
  'precio-asc': (a, b) => a.precioUsd - b.precioUsd,
};

/**
 * Filtra por nombre o símbolo y ordena según el criterio elegido.
 * No modifica el arreglo original: filter y toSorted devuelven arreglos nuevos.
 */
export function aplicarCriterios(
  cotizaciones: readonly Cotizacion[],
  { busqueda, orden }: CriteriosConsulta,
): Cotizacion[] {
  const termino = normalizar(busqueda);

  const filtradas = cotizaciones.filter(
    ({ moneda }) =>
      termino === '' ||
      normalizar(moneda.nombre).includes(termino) ||
      normalizar(moneda.simbolo).includes(termino),
  );

  return filtradas.toSorted(comparadores[orden]);
}
