import type { TipoEstado } from '../types/cripto';

const ICONOS: Record<TipoEstado, string> = {
  inicial: 'ℹ️',
  carga: '⏳',
  resultado: '✅',
  vacio: '📭',
  error: '⚠️',
};

const TITULOS: Record<TipoEstado, string> = {
  inicial: 'Inicial',
  carga: 'Cargando',
  resultado: 'Resultado',
  vacio: 'Sin resultados',
  error: 'Error',
};

interface EstadoConsultaProps {
  tipo: TipoEstado;
  mensaje: string;
  /** Si se recibe, en el estado de error se muestra el botón "Volver a intentar". */
  onReintentar?: () => void;
}

/**
 * Comunica el estado de la operación. El contenedor con role="status" se mantiene
 * siempre en la página para que los lectores de pantalla anuncien cada cambio.
 * Cada estado tiene ícono, título y estilo de borde propios: no depende solo del color.
 */
export function EstadoConsulta({ tipo, mensaje, onReintentar }: EstadoConsultaProps) {
  return (
    <div className="estado">
      <div className={`status status--${tipo}`} role="status" aria-live="polite">
        <span className="status__icon" aria-hidden="true">
          {ICONOS[tipo]}
        </span>
        <p className="status__text">
          <strong>{TITULOS[tipo]}:</strong> {mensaje}
        </p>
      </div>

      {tipo === 'error' && onReintentar && (
        // autoFocus: igual que en la Actividad 1, el foco pasa al botón de reintento.
        <button
          type="button"
          className="btn btn--secondary"
          onClick={onReintentar}
          autoFocus
        >
          Volver a intentar
        </button>
      )}
    </div>
  );
}
