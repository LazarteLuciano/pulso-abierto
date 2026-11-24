// Funciones de formato para mostrar números y fechas en español (Argentina).

const usd = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' });

const numeroCorto = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

const porcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearUsd(valor: number): string {
  return usd.format(valor);
}

/** Montos grandes en palabras. Ej.: 43280000000 → "US$ 43,28 mil millones". */
export function formatearUsdCompacto(valor: number): string {
  if (valor >= 1e12) return `US$ ${numeroCorto.format(valor / 1e12)} billones`;
  if (valor >= 1e9) return `US$ ${numeroCorto.format(valor / 1e9)} mil millones`;
  if (valor >= 1e6) return `US$ ${numeroCorto.format(valor / 1e6)} millones`;
  return formatearUsd(valor);
}

/** Recibe un porcentaje (ej.: -1.83) y devuelve "-1,83 %". */
export function formatearPorcentaje(valor: number): string {
  return porcentaje.format(valor / 100);
}

// hourCycle 'h23': formato de 24 horas (17:41:07) para evitar horas ambiguas.
export function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-AR', { hourCycle: 'h23' });
}

export function formatearFechaHora(fecha: Date): string {
  return fecha.toLocaleString('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
  });
}
