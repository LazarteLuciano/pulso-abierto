# Pulso Abierto

Aplicación web que consulta el precio actual de **Bitcoin, Ethereum y Solana** en dólares estadounidenses (USD) mediante la API pública de CoinGecko. Permite filtrar y ordenar los resultados con un formulario validado, abrir una página de detalle por criptomoneda (variación en 24 h, capitalización y volumen) y marcar favoritas, que se conservan al cambiar de vista y al recargar el navegador.

Es la versión final del proyecto de Programación Web (Actividad 4), construida de forma progresiva desde el Módulo 1.

- **Aplicación publicada (Vercel):** https://pulso-abierto-ochre.vercel.app/
- **Repositorio (GitHub):** https://github.com/LazarteLuciano/pulso-abierto
- **Versión:** 1.0.0

## Tecnologías principales

| Tecnología                              | Uso en el proyecto                                                     |
| --------------------------------------- | ---------------------------------------------------------------------- |
| React 19 + TypeScript                   | Interfaz por componentes y tipado del dominio.                         |
| Vite 8                                  | Servidor de desarrollo, build de producción y preview.                 |
| React Router 8                          | Navegación entre el listado y las páginas de detalle.                  |
| Zustand 5                               | Estado global de favoritos, persistido en `localStorage`.              |
| Zod 4                                   | Validación del formulario, de la respuesta de la API y de lo guardado. |
| Vitest 5 + Testing Library + user-event | Pruebas automatizadas (entorno jsdom).                                 |
| oxlint y Prettier                       | Lint y formato del código.                                             |
| Vercel                                  | Publicación de la aplicación.                                          |

## Requisitos

- Node.js **22.22 o superior** (el proyecto se verificó con Node.js 24) y npm.
- Conexión a internet para consultar la API (las pruebas automatizadas no la necesitan).

## Instalación

```bash
git clone https://github.com/LazarteLuciano/pulso-abierto.git
cd pulso-abierto
npm install
```

`npm install` instala las versiones registradas en `package-lock.json`.

## Variables de entorno

**El proyecto no utiliza variables de entorno.** La API de CoinGecko que se consulta es pública y no requiere clave; su dirección está definida en `src/services/coingecko.ts`. Por eso no hace falta crear archivos `.env` ni configurar variables en Vercel. De todos modos, `.gitignore` excluye `.env` y `.env.*` para que ningún archivo local de configuración llegue al repositorio.

## Comandos

Todos se ejecutan desde la raíz del proyecto y corresponden a los scripts de `package.json`.

| Comando              | Para qué sirve                                                            |
| -------------------- | ------------------------------------------------------------------------- |
| `npm run dev`        | Ejecuta la aplicación en desarrollo en http://localhost:5173/.            |
| `npm run test`       | Ejecuta una vez todas las pruebas (`vitest run`). También: `npm test`.    |
| `npm run test:watch` | Deja las pruebas corriendo mientras se edita.                             |
| `npm run lint`       | Revisa el código con oxlint.                                              |
| `npm run typecheck`  | Comprueba los tipos con TypeScript (`tsc -b`).                            |
| `npm run build`      | Comprueba los tipos y genera la versión de producción en `dist/`.         |
| `npm run preview`    | Sirve la carpeta `dist/` en http://localhost:4173/ para revisar el build. |
| `npm run format`     | Aplica el formato de Prettier.                                            |

## Pruebas

```bash
npm run test
```

Resultado esperado: **6 archivos y 19 pruebas aprobadas**. No requieren configuración previa: usan jsdom para simular el navegador y nunca consultan CoinGecko (se reemplaza `fetch` o la función de servicio por funciones simuladas). Antes de cada prueba se vacía `localStorage` y se reinicia el store de favoritos (`src/test/setup.ts`).

| Archivo                                 | Qué comprueba                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/components/TarjetaCripto.test.tsx` | Marcar y desmarcar una favorita, con mouse y con teclado.                                         |
| `src/App.test.tsx`                      | Lo marcado en el listado se ve en el detalle y en el contador, y viceversa.                       |
| `src/pages/PaginaConsulta.test.tsx`     | Carga → resultado, respuesta sin datos, y error con mensaje y reintento.                          |
| `src/pages/PaginaDetalle.test.tsx`      | Enlaces a las otras criptomonedas y a las tres cuando el identificador no existe (Actividad 4).   |
| `src/services/coingecko.test.ts`        | Servicio: respuesta exitosa y su transformación, `ok: false`, respuesta vacía y formato inválido. |
| `src/store/favoritosStore.test.ts`      | Persistencia: qué se guarda, rehidratación y datos guardados dañados.                             |

## Build y preview

```bash
npm run build
npm run preview
```

`npm run build` ejecuta `tsc -b` y `vite build`; la salida queda en `dist/` (`index.html` y la carpeta `assets/`). `dist/` es un resultado del proceso: no se edita a mano ni se versiona. `npm run preview` sirve esa carpeta en http://localhost:4173/ para comprobar la versión productiva antes de publicarla.

## Despliegue en Vercel

La aplicación se publica desde este repositorio de GitHub. La configuración está versionada en `vercel.json`:

| Opción               | Valor                   | Motivo                                                       |
| -------------------- | ----------------------- | ------------------------------------------------------------ |
| Framework            | Vite                    | Tipo de proyecto.                                            |
| Install command      | `npm install`           | Instala las dependencias de `package-lock.json`.             |
| Build command        | `npm run build`         | El mismo script que se usa localmente.                       |
| Output directory     | `dist`                  | Carpeta que genera Vite.                                     |
| Rewrites             | `/(.*)` → `/index.html` | Permite abrir o recargar rutas como `/criptomonedas/solana`. |
| Variables de entorno | Ninguna                 | La API es pública.                                           |

**Por qué hace falta el rewrite.** React Router resuelve las rutas en el navegador. Al navegar con los enlaces todo funciona, pero si se abre o se recarga directamente `/criptomonedas/solana`, el servidor busca un archivo con esa ruta, no lo encuentra y responde 404. El rewrite le indica a Vercel que entregue `index.html` en esos casos; los archivos que sí existen (`/assets/...`, `/favicon.svg`) se siguen sirviendo normalmente. `npm run preview` no muestra este problema porque el servidor de Vite ya hace ese reemplazo, por eso hay que comprobarlo en la URL publicada.

Pasos para publicar:

1. Ejecutar `npm run test`, `npm run lint` y `npm run build`, y revisar el resultado con `npm run preview`.
2. Hacer commit y `git push` a la rama `main` de GitHub.
3. En https://vercel.com/new, ingresar con **Continue with GitHub** y darle a la app de Vercel acceso al repositorio `pulso-abierto` (**Only select repositories**).
4. Presionar **Import** junto a `pulso-abierto` y comprobar que la configuración coincida con la tabla: preset Vite, `npm run build`, salida `dist`, Root Directory `./` y sin variables de entorno. Presionar **Deploy**.
5. Cuando el despliegue queda listo, copiar el dominio de producción (sección **Domains** del proyecto) y repetir en esa URL los recorridos principales: consulta, detalle, acceso directo y recarga de un detalle, favoritos, formulario y vista móvil.

Cada `git push` a `main` genera automáticamente un nuevo despliegue de producción, asociado a ese commit en el panel de Vercel; el dominio de producción no cambia.

## Rutas

| Ruta                        | Página               | Qué muestra                                                 |
| --------------------------- | -------------------- | ----------------------------------------------------------- |
| `/`                         | `PaginaConsulta`     | Formulario, estado de la consulta y resultados.             |
| `/?q=bit&orden=precio-desc` | `PaginaConsulta`     | Los criterios quedan en la URL: se puede volver o recargar. |
| `/criptomonedas/:id`        | `PaginaDetalle`      | Detalle de `bitcoin`, `ethereum` o `solana`.                |
| `/criptomonedas/otra`       | `PaginaDetalle`      | Mensaje de criptomoneda no encontrada.                      |
| cualquier otra (`*`)        | `PaginaNoEncontrada` | Página 404 de la aplicación.                                |

## Estructura

```
src/
├── main.tsx                 Punto de entrada (BrowserRouter + App)
├── App.tsx                  Estructura general: encabezado (con contador de favoritas), rutas y pie
├── index.css                Estilos (diseño adaptable: una columna en móvil, dos desde 768 px)
├── store/
│   └── favoritosStore.ts        Store de Zustand: favoritos, acción, selectores y persistencia
├── components/
│   ├── BotonFavorito.tsx        Agrega o quita una favorita (lee el store con selectores)
│   ├── ContadorFavoritas.tsx    Cantidad de favoritas (dato derivado)
│   ├── EnlacesMonedas.tsx       Lista de enlaces al detalle de cada criptomoneda
│   ├── EstadoConsulta.tsx       Comunica inicial / carga / resultado / vacío / error
│   ├── FormularioConsulta.tsx   Formulario controlado + validación con Zod
│   ├── ListaResultados.tsx      Colección de resultados
│   └── TarjetaCripto.tsx        Tarjeta reutilizable de cada criptomoneda
├── pages/
│   ├── PaginaConsulta.tsx
│   ├── PaginaDetalle.tsx
│   └── PaginaNoEncontrada.tsx
├── hooks/useCotizaciones.ts     Consulta, carga, error, reintento y descarte de respuestas viejas
├── services/
│   ├── coingecko.ts             URL + fetch + response.ok + validación + transformación
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
- Solo se guardan los identificadores de las favoritas. Si lo guardado está dañado o fue editado a mano, se descarta sin romper la aplicación.

## API utilizada

- **CoinGecko**, endpoint `GET https://api.coingecko.com/api/v3/simple/price` (sin clave).
- Listado: `?ids=bitcoin,ethereum,solana&vs_currencies=usd` (la misma consulta de la Actividad 1).
- Detalle: `?ids=<moneda>&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`.
- La API pública limita las consultas por minuto. Si se supera, responde 429 y la aplicación muestra el error con el botón «Volver a intentar».

## Simular estados

Se puede agregar `simular` a la URL (también en el detalle), tanto en desarrollo como en la versión publicada:

- `/?orden=nombre&simular=lento` → tarda 3 segundos (estado de carga).
- `/?orden=nombre&simular=vacio` → la API "responde" sin datos.
- `/?orden=nombre&simular=error` → consulta una ruta inexistente (error + reintento).
- `/?q=doge&orden=nombre` → búsqueda sin coincidencias.

## Mejora de mantenibilidad (Actividad 4)

**Problema identificado.** Código duplicado en `src/pages/PaginaDetalle.tsx`: la lista de enlaces al detalle de las criptomonedas («Bitcoin (BTC)», «Ethereum (ETH)»…) estaba escrita dos veces, con el mismo `<ul className="enlaces">`, el mismo `map`, la misma ruta `/criptomonedas/${id}` y el mismo texto. Una aparecía en el mensaje de criptomoneda no encontrada y la otra en «Ver otra criptomoneda». Cualquier cambio en la ruta o en el texto había que repetirlo en los dos lugares, y era fácil olvidar uno.

**Cambio realizado.** Extraje esa lista al componente `src/components/EnlacesMonedas.tsx`, que recibe las monedas a mostrar y, opcionalmente, el estado de navegación. `PaginaDetalle` lo usa en los dos lugares: con las tres monedas cuando el identificador no existe y con las otras dos (reenviando `location.state`) en el detalle. No cambiaron textos, rutas, estilos ni dependencias (diferencia: 1 archivo nuevo, 4 líneas agregadas y 18 quitadas en `PaginaDetalle.tsx`).

**Cómo comprobé que no hubo regresiones.**

1. Antes de modificar nada escribí `src/pages/PaginaDetalle.test.tsx` (2 pruebas): los enlaces y sus destinos cuando la moneda no existe, y los enlaces a las otras dos monedas, incluido que al pasar de Bitcoin a Ethereum «Volver a los resultados» siga apuntando a la búsqueda de origen. Pasaron con el código original (commit `Pruebas de los enlaces…`).
2. Después del cambio, `npm run typecheck`, `npm run lint` y `npm run test` (19 de 19) terminaron sin errores, y `npm run build` generó `dist/`.
3. Para confirmar que la prueba detecta un error real, quité a propósito el `state` reenviado: la prueba falló y volví a dejarlo.
4. En el navegador recorrí `/criptomonedas/dogecoin` (tres enlaces correctos) y Bitcoin → Ethereum desde el listado: el enlace de volver conserva `?orden=nombre`. La consola no mostró errores después de recargar.

## Preparación de la versión publicada

Además de la mejora anterior, para publicar se agregaron `vercel.json` (configuración y rewrite de rutas), entradas en `.gitignore` (`.env`, `.env.*`, `.vercel`, `coverage`), el número de versión `1.0.0` en `package.json` y el texto del pie actualizado a la Actividad 4. No se agregaron funcionalidades.

## Verificación final

- **Pruebas ejecutadas:** `npm run test` → 6 archivos y 19 pruebas aprobadas. `npm run lint` y `npm run typecheck` sin errores ni advertencias.
- **Build generado correctamente:** `npm run build` sin errores; genera `dist/index.html`, `dist/favicon.svg` y en `dist/assets/` un archivo CSS y uno JS.
- **Preview comprobado:** con `npm run preview` (http://localhost:4173/) funcionaron la validación del formulario, la consulta, los favoritos, el detalle (desde el listado, por acceso directo y al recargar) y la vista móvil, sin errores en la consola.
- **Despliegue realizado:** producción en https://pulso-abierto-ochre.vercel.app/, generada desde la rama `main` (commit `43bc435`, versión 1.0.0). En la URL publicada comprobé:
  - que la aplicación carga y la consulta a CoinGecko responde 200;
  - que el formulario valida los datos incorrectos y filtra con datos válidos;
  - el paso del listado al detalle y la vuelta conservando la búsqueda;
  - el acceso directo y la recarga de `/criptomonedas/bitcoin` y `/criptomonedas/ethereum`;
  - que los favoritos se conservan entre vistas y después de recargar;
  - la vista móvil (375 px, una columna, sin desplazamiento horizontal) y la de escritorio;
  - que no hay errores en la consola.

  No apareció ningún problema exclusivo de la versión publicada: el 404 al recargar un detalle se previno con el rewrite de `vercel.json`. El commit posterior a `43bc435` solo actualiza este README con las URLs y esta verificación.

- **Fecha de verificación:** 24/11/2026.
