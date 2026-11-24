import { useId, useRef, useState, type FormEvent } from 'react';
import { z } from 'zod';
import {
  consultaSchema,
  ETIQUETAS_ORDEN,
  ORDENES,
  type CriteriosConsulta,
  type ErroresFormulario,
  type ValoresFormulario,
} from '../schemas/consulta';

interface FormularioConsultaProps {
  valoresIniciales: ValoresFormulario;
  /** true mientras hay una consulta en curso (evita el envío repetido). */
  cargando: boolean;
  /** Se llama solo cuando los datos son válidos. */
  onConsultar: (criterios: CriteriosConsulta) => void;
}

/** Formulario controlado: los valores de los campos viven en el estado de React. */
export function FormularioConsulta({
  valoresIniciales,
  cargando,
  onConsultar,
}: FormularioConsultaProps) {
  const [valores, setValores] = useState<ValoresFormulario>(valoresIniciales);
  const [errores, setErrores] = useState<ErroresFormulario>({});

  // useId genera ids únicos para asociar etiquetas, ayudas y mensajes de error.
  const id = useId();
  const ids = {
    busqueda: `${id}-busqueda`,
    ayudaBusqueda: `${id}-busqueda-ayuda`,
    errorBusqueda: `${id}-busqueda-error`,
    orden: `${id}-orden`,
    errorOrden: `${id}-orden-error`,
  };

  // Referencias para llevar el foco al primer campo con error (el foco no se puede
  // expresar de forma declarativa).
  const busquedaRef = useRef<HTMLInputElement>(null);
  const ordenRef = useRef<HTMLSelectElement>(null);

  function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (cargando) return;

    const resultado = consultaSchema.safeParse(valores);

    if (!resultado.success) {
      const { fieldErrors } = z.flattenError(resultado.error);
      setErrores({ busqueda: fieldErrors.busqueda?.[0], orden: fieldErrors.orden?.[0] });
      if (fieldErrors.busqueda) busquedaRef.current?.focus();
      else ordenRef.current?.focus();
      return; // No se ejecuta la consulta hasta que los datos sean válidos.
    }

    setErrores({});
    // Muestra el texto tal como quedó después de quitar los espacios sobrantes.
    setValores((anteriores) => ({ ...anteriores, busqueda: resultado.data.busqueda }));
    onConsultar(resultado.data);
  }

  return (
    <form className="form" onSubmit={manejarEnvio} noValidate>
      <div className="campo">
        <label htmlFor={ids.busqueda}>
          Nombre o símbolo <span className="campo__opcional">(opcional)</span>
        </label>
        <p id={ids.ayudaBusqueda} className="campo__ayuda">
          Por ejemplo: «bit», «eth» o «sol». Dejalo vacío para ver las tres.
        </p>
        <input
          ref={busquedaRef}
          id={ids.busqueda}
          name="busqueda"
          type="text"
          autoComplete="off"
          value={valores.busqueda}
          onChange={(evento) => {
            const busqueda = evento.target.value;
            setValores((anteriores) => ({ ...anteriores, busqueda }));
            setErrores((anteriores) => ({ ...anteriores, busqueda: undefined }));
          }}
          aria-invalid={errores.busqueda ? true : undefined}
          aria-describedby={
            errores.busqueda
              ? `${ids.ayudaBusqueda} ${ids.errorBusqueda}`
              : ids.ayudaBusqueda
          }
        />
        {errores.busqueda && (
          <p id={ids.errorBusqueda} className="campo__error">
            <span aria-hidden="true">⚠️</span> <strong>Error:</strong> {errores.busqueda}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor={ids.orden}>Ordenar resultados por</label>
        <select
          ref={ordenRef}
          id={ids.orden}
          name="orden"
          value={valores.orden}
          onChange={(evento) => {
            const orden = evento.target.value;
            setValores((anteriores) => ({ ...anteriores, orden }));
            setErrores((anteriores) => ({ ...anteriores, orden: undefined }));
          }}
          aria-invalid={errores.orden ? true : undefined}
          aria-describedby={errores.orden ? ids.errorOrden : undefined}
        >
          <option value="">— Elegí una opción —</option>
          {ORDENES.map((orden) => (
            <option key={orden} value={orden}>
              {ETIQUETAS_ORDEN[orden]}
            </option>
          ))}
        </select>
        {errores.orden && (
          <p id={ids.errorOrden} className="campo__error">
            <span aria-hidden="true">⚠️</span> <strong>Error:</strong> {errores.orden}
          </p>
        )}
      </div>

      {/* aria-disabled (en lugar de disabled) mantiene el foco en el botón durante la
          carga; el envío repetido lo evita la comprobación de manejarEnvio. */}
      <button type="submit" className="btn btn--primary" aria-disabled={cargando}>
        {cargando ? 'Consultando…' : 'Consultar precios'}
      </button>
    </form>
  );
}
