import { useSearchParams } from 'react-router';
import { EstadoConsulta } from '../components/EstadoConsulta';
import { FormularioConsulta } from '../components/FormularioConsulta';
import { ListaResultados } from '../components/ListaResultados';
import { useCotizaciones } from '../hooks/useCotizaciones';
import { criteriosDesdeUrl, type CriteriosConsulta } from '../schemas/consulta';
import { seleccionarFavoritos, useFavoritosStore } from '../store/favoritosStore';
import type { TipoEstado } from '../types/cripto';
import { aplicarCriterios } from '../utils/criterios';
import { formatearHora } from '../utils/formato';

/** Página "/" — coordina el formulario, la consulta a la API y el listado. */
export function PaginaConsulta() {
  // Los criterios aplicados viven en la URL (?q=...&orden=...): así se conservan
  // al volver desde el detalle o al actualizar la página.
  const [searchParams, setSearchParams] = useSearchParams();
  const criterios = criteriosDesdeUrl(searchParams);

  // Si en la URL no hay una consulta, el hook devuelve el estado inicial.
  const { estado: estadoActual, reintentar } = useCotizaciones({
    activa: criterios !== null,
  });

  // Estado global: solo se lee la colección de favoritos (no todo el store).
  const favoritos = useFavoritosStore(seleccionarFavoritos);

  // Datos derivados: se calculan en cada render a partir de los datos originales
  // y de los criterios; no se guardan en un estado aparte.
  const visibles =
    estadoActual.tipo === 'resultado' && criterios
      ? aplicarCriterios(estadoActual.cotizaciones, criterios)
      : [];
  const cantidadVisibles = visibles.length;
  const cantidadFavoritasVisibles = visibles.filter(({ moneda }) =>
    favoritos.includes(moneda.id),
  ).length;

  function manejarConsulta(nuevos: CriteriosConsulta) {
    setSearchParams((anteriores) => {
      const params = new URLSearchParams(anteriores);
      if (nuevos.busqueda) params.set('q', nuevos.busqueda);
      else params.delete('q');
      params.set('orden', nuevos.orden);
      return params;
    });
    // Cada envío vuelve a consultar los precios actuales.
    reintentar();
  }

  let tipo: TipoEstado = estadoActual.tipo;
  let mensaje: string;
  switch (estadoActual.tipo) {
    case 'inicial':
      mensaje =
        'todavía no se realizó ninguna consulta. Elegí los criterios y presioná «Consultar precios».';
      break;
    case 'carga':
      mensaje = 'consultando los precios en el servicio de CoinGecko…';
      break;
    case 'vacio':
      mensaje =
        'la consulta se realizó correctamente, pero el servicio no devolvió precios para mostrar.';
      break;
    case 'error':
      mensaje = estadoActual.mensaje;
      break;
    case 'resultado': {
      const total = estadoActual.cotizaciones.length;
      const hora = formatearHora(estadoActual.obtenidoEn);
      if (cantidadVisibles === 0) {
        // La API devolvió datos, pero ninguno coincide con la búsqueda.
        tipo = 'vacio';
        mensaje = `ninguna de las ${total} criptomonedas coincide con «${criterios?.busqueda}». Probá con otro nombre o símbolo, o dejá el campo vacío.`;
      } else {
        const favoritasTexto =
          cantidadFavoritasVisibles > 0
            ? ` (${cantidadFavoritasVisibles} favorita${cantidadFavoritasVisibles > 1 ? 's' : ''})`
            : '';
        const verbo = cantidadVisibles === 1 ? 'se muestra' : 'se muestran';
        mensaje = `${verbo} ${cantidadVisibles} de ${total} criptomonedas${favoritasTexto}. Precios actualizados a las ${hora}.`;
      }
      break;
    }
  }

  return (
    <>
      <title>Consulta de precios — Pulso Abierto</title>

      <section className="panel" aria-labelledby="titulo-consulta">
        <h2 id="titulo-consulta">Consulta de precios</h2>
        <FormularioConsulta
          valoresIniciales={{
            busqueda: criterios?.busqueda ?? '',
            orden: criterios?.orden ?? '',
          }}
          cargando={estadoActual.tipo === 'carga'}
          onConsultar={manejarConsulta}
        />
      </section>

      <section className="panel" aria-labelledby="titulo-estado">
        <h2 id="titulo-estado">Estado de la consulta</h2>
        <EstadoConsulta tipo={tipo} mensaje={mensaje} onReintentar={reintentar} />
      </section>

      <section
        className="panel"
        aria-labelledby="titulo-resultados"
        aria-busy={estadoActual.tipo === 'carga'}
      >
        <h2 id="titulo-resultados">Resultados</h2>
        <ListaResultados
          cotizaciones={visibles}
          origen={searchParams.size > 0 ? `?${searchParams.toString()}` : ''}
        />
      </section>
    </>
  );
}
