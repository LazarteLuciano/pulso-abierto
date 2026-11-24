# Pulso Abierto — Estado global, servicios y pruebas (Actividad 3)

## Descripción

Tercera versión de Pulso Abierto. Consulta el precio actual de Bitcoin, Ethereum y Solana en dólares (USD) usando la API pública de CoinGecko. Es la misma aplicación de la Actividad 2 (React + Vite + TypeScript), evolucionada sin reconstruirla.

Novedades respecto de la Actividad 2:

- **Favoritos con Zustand**: el botón «Destacar» pasó a ser «Agregar a favoritas». La lista vive en un store global tipado (`src/store/favoritosStore.ts`) que leen el listado, el detalle y el contador del encabezado mediante selectores. La cantidad de favoritas se deriva de la colección.
- **Persistencia selectiva**: los favoritos se guardan en `localStorage` con el middleware `persist` (solo los identificadores). Al rehidratar, lo guardado se valida: si está dañado o fue editado a mano, se descarta sin romper la aplicación.
- **Capa de servicios consolidada**: `src/services/coingecko.ts` arma la URL con `URL`/`URLSearchParams`, comprueba `response.ok`, valida el JSON con Zod y lo transforma (`normalizarCotizaciones`) al modelo de la interfaz.
- **Pruebas automatizadas** con Vitest, Testing Library y user-event (sin solicitudes reales a CoinGecko).

## API utilizada

- **Nombre:** CoinGecko
- **Consulta del listado (la misma de la Actividad 1):**
  `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd`
- **Consulta del detalle (mismo endpoint, una sola moneda y datos extra):**
  `.../simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
- **Método:** GET. No necesita clave.

> La API pública tiene un límite de consultas por minuto. Si se supera, responde 429 y la aplicación muestra el estado de error con el botón «Volver a intentar».

## Instalación

Requiere Node.js 22.22 o superior.

```bash
npm install
```

## Ejecución

```bash
npm run dev
```

La aplicación queda disponible en http://localhost:5173/.

## Pruebas

```bash
npm test
```

Ejecuta una vez todas las pruebas (`vitest run`). Para dejarlas corriendo mientras se edita: `npm run test:watch`.

| Archivo                                 | Qué comprueba                                                                                   |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/components/TarjetaCripto.test.tsx` | A. Marcar y desmarcar una favorita (con mouse y con teclado).                                   |
| `src/App.test.tsx`                      | A. Lo marcado en el listado se ve en el detalle y en el contador, y viceversa.                  |
| `src/pages/PaginaConsulta.test.tsx`     | B. Carga → resultado; respuesta sin datos. C. Error con mensaje y reintento.                    |
| `src/services/coingecko.test.ts`        | D. Servicio con respuesta exitosa (y su transformación), `ok: false`, vacío y formato inválido. |
| `src/store/favoritosStore.test.ts`      | Persistencia: qué se guarda, rehidratación y datos guardados dañados.                           |

Las pruebas reemplazan `fetch` (servicio) o la función de servicio (componentes) por funciones simuladas.

## Otros comandos

```bash
npm run typecheck  # análisis de tipos con TypeScript
npm run lint       # revisa el código con oxlint
npm run build      # compila la versión de producción en dist/
npm run preview    # sirve la versión de producción
npm run format     # aplica el formato de Prettier
```

## Rutas

| Ruta                        | Página               | Qué muestra                                                 |
| --------------------------- | -------------------- | ----------------------------------------------------------- |
| `/`                         | `PaginaConsulta`     | Formulario, estado de la consulta y resultados.             |
| `/?q=bit&orden=precio-desc` | `PaginaConsulta`     | Los criterios quedan en la URL: se puede volver o recargar. |
| `/criptomonedas/:id`        | `PaginaDetalle`      | Detalle de `bitcoin`, `ethereum` o `solana`.                |
| `/criptomonedas/otra`       | `PaginaDetalle`      | Mensaje de criptomoneda no encontrada.                      |
| cualquier otra (`*`)        | `PaginaNoEncontrada` | Página 404.                                                 |

## Estructura

```
src/
├── main.tsx                 Punto de entrada (BrowserRouter + App)
├── App.tsx                  Estructura general: encabezado (con contador de favoritas), rutas y pie
├── index.css                Estilos
├── store/
│   └── favoritosStore.ts        Store de Zustand: favoritos, acción, selectores y persistencia
├── components/
│   ├── BotonFavorito.tsx        Agrega o quita una favorita (lee el store con selectores)
│   ├── ContadorFavoritas.tsx    Cantidad de favoritas (dato derivado)
│   ├── FormularioConsulta.tsx   Formulario controlado + validación con Zod
│   ├── EstadoConsulta.tsx       Comunica inicial / carga / resultado / vacío / error
│   ├── ListaResultados.tsx      Colección de resultados
│   └── TarjetaCripto.tsx        Tarjeta reutilizable de cada criptomoneda
├── pages/
│   ├── PaginaConsulta.tsx
│   ├── PaginaDetalle.tsx
│   └── PaginaNoEncontrada.tsx
├── hooks/useCotizaciones.ts     Coordina la consulta, la carga, el error, el reintento y descarta respuestas viejas
├── services/
│   ├── coingecko.ts             URL + fetch + response.ok + JSON + validación + transformación
│   └── simulacion.ts            Simulación de estados (?simular=...)
├── schemas/consulta.ts          Esquema Zod del formulario
├── data/monedas.ts              Catálogo de las 3 criptomonedas
├── types/cripto.ts              Tipos del dominio
├── utils/                       Funciones puras (filtro/orden, formato, mensajes de error)
└── test/                        Preparación de las pruebas y datos de ejemplo
```

## Persistencia

- Clave en `localStorage`: `pulso-abierto:favoritos`.
- Valor guardado: `{"state":{"favoritos":["bitcoin","solana"]},"version":0}`.
- No se guardan la carga, los errores, los resultados de la API ni los criterios de búsqueda.

## Simular estados

Como la API casi siempre responde bien, se puede agregar `simular` a la URL (también funciona en el detalle):

- `http://localhost:5173/?orden=nombre&simular=lento` → tarda 3 segundos (estado de carga).
- `http://localhost:5173/?orden=nombre&simular=vacio` → la API "responde" sin datos (ausencia de datos).
- `http://localhost:5173/?orden=nombre&simular=error` → consulta una ruta inexistente (error + reintento).
- `http://localhost:5173/?q=doge&orden=nombre` → búsqueda sin coincidencias.

## Capturas

La carpeta `capturas/` tiene las imágenes del informe (favoritos antes y después de recargar, detalle, error y diagnóstico) y `registro_capturas.txt` con el contenido de `localStorage`, las solicitudes de red y los mensajes de consola observados.
