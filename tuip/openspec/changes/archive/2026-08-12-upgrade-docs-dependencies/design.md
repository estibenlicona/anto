## Context

Ver proposal.md - Why. Dos hechos, verificados sobre el código y no supuestos, determinan que estas migraciones sean baratas:

- **El sitio usa solo la API declarativa y los hooks de React Router.** El inventario completo de lo que importa de `react-router-dom` es: `BrowserRouter`, `Routes`, `Route`, `Outlet`, `Navigate`, `Link`, `NavLink`, `useLocation`, `useNavigate`, `useParams`, `useSearchParams`. No aparece `createBrowserRouter` ni ningún data router, loader o action — que es justamente donde la versión 7 concentra sus cambios de fondo.
- **`vite.config.ts` es mínimo:** un solo plugin (`@vitejs/plugin-react`) y tres aliases de resolución. No hay plugins heredados, ni configuración de `build.commonjsOptions`, ni nada de la superficie que suele romperse entre versiones mayores de Vite.

El sitio es privado (`"private": true`), no se publica, y su verificación (`tsc --noEmit && vite build`) es rápida y ya existe.

## Goals / Non-Goals

**Goals:**
- Eliminar las dos excepciones de `security-exceptions.json` resolviendo lo que las motivó, y dejar el archivo vacío.
- Migrar de forma que un fallo sea atribuible a una de las dos migraciones y no a la mezcla.

**Non-Goals:**
- Adoptar las capacidades nuevas de React Router 7 (data routers, loaders, `Await`). El objetivo es salir de la versión vulnerable con el menor cambio de comportamiento posible; rediseñar el enrutado del sitio para aprovechar la versión nueva es otro trabajo y no tiene por qué depender de una vulnerabilidad.
- Actualizar el resto de las dependencias de `apps/docs` de paso. Solo se toca lo que resuelve una excepción registrada, más lo que esas migraciones arrastren por compatibilidad.
- Reemplazar `react-syntax-highlighter` u otras dependencias que no aparecen en ningún advisory.

## Decisions

### Una migración por vez, verificando entre medio

Aunque van en el mismo change, no se hacen a la vez: primero `vite` (herramienta de build, aislada del código de la aplicación), se verifica build y servidor de desarrollo, y recién después `react-router` (runtime, toca el código). Si algo se rompe, la causa es una sola y no hay que bisecar entre dos migraciones mayores simultáneas.

El orden importa en ese sentido: Vite primero porque un fallo suyo se manifiesta al construir, de forma inmediata y ruidosa, mientras que un fallo de enrutado puede aparecer solo al navegar. Conviene tener la herramienta estable antes de tocar lo que corre encima.

### La verificación es recorrer el sitio, no que el build pase

`vite build` verde no prueba que el enrutado funcione: los errores de React Router 7 en modo declarativo se manifiestan al navegar, no al compilar. La verificación de la segunda migración es recorrer el sitio — sidebar, ruta de detalle de componente con su parámetro, breadcrumb, paginador anterior/siguiente, y el parámetro de búsqueda — que es exactamente la superficie de los cinco hooks y componentes que el inventario encontró.

Es el mismo método que ya se usó en los changes anteriores para verificar comportamiento real de componentes: dirigir un Chrome headless por CDP, porque la extensión del navegador viene desconectada en este entorno.

### Los pasos exactos salen de las guías oficiales, no de memoria

Ambas migraciones tienen guía oficial de actualización, y los detalles concretos (qué exportación se movió, qué opción cambió de nombre, qué flag de compatibilidad existe) se leen de ahí al implementar en vez de reconstruirse de memoria. Lo que este diseño fija es el alcance, el orden y cómo se verifica; no la lista de ediciones, que sería adivinar.

Lo que sí se puede anticipar por el inventario: la superficie usada es la que ambas versiones mantienen, así que el resultado esperado es un cambio de versiones con pocos o ningún ajuste de código. Si la migración resultara pedir cambios de fondo en el enrutado, eso contradice el inventario y es señal de parar y revisar el supuesto, no de empujar.

### El archivo de excepciones queda vacío, no eliminado

Al resolver ambas, `security-exceptions.json` queda como un archivo con cero excepciones en vez de borrarse. El script de auditoría lo lee siempre; que exista y esté vacío es la diferencia entre "no hay nada aceptado" y "no hay mecanismo". Además deja el lugar preparado para la próxima, sin que nadie tenga que reinventar el formato.

## Risks / Trade-offs

- **Vite 6 puede arrastrar cambios en la cadena de PostCSS/Tailwind** → Mitigación: `tailwindcss`, `postcss` y `autoprefixer` quedan en sus versiones actuales y se ajustan solo si la migración lo exige. El sitio construido se compara visualmente contra el actual antes de dar la migración por buena; una diferencia de estilos sería visible de inmediato en la primera página.
- **React Router 7 puede requerir más que un cambio de versión, contra lo que sugiere el inventario** → Mitigación: el inventario acota el riesgo pero no lo elimina. Si aparecen cambios de fondo, la decisión correcta es detenerse y reportar, no forzar la migración dentro de este change — la excepción sigue vigente y fechada mientras tanto, que es precisamente para lo que se registró.
- **Al quedar el archivo de excepciones vacío, el mecanismo deja de ejercitarse** → Mitigación: el change `add-security-hardening` verifica el vencimiento como parte de su propio cierre, con las excepciones vigentes; no queda sin probar por haberse vaciado después.
