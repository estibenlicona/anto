## Context

Ver `proposal.md` — Why para la motivación, y `specs/docs-site/spec.md` para el contrato de comportamiento.

Estado actual relevante para el enfoque:

- `apps/docs` es React + Vite + React Router + Tailwind, con el preset de `@tuya-ui/tokens`. No hay MDX ni pipeline de contenido: el contenido por componente vive en módulos TypeScript tipados bajo `src/content/`, y los ejemplos son archivos `.tsx` reales bajo `src/examples/` cargados por `examples/load.ts`.
- La tabla de props y el código fuente se derivan de `registry.json`, generado por `packages/components/registry/generate.ts` a partir de `componentDefinitions` y de los tipos reales de cada componente. Esa derivación es el mecanismo que impide que la documentación se desincronice del código, y este change no la toca: la extiende.
- El tema se aplica escribiendo `document.documentElement.dataset.theme` desde `ThemeProvider`; los tokens de `@tuya-ui/tokens` definen ambos modos como variables CSS.
- El mockup es HTML plano con colores literales (`#ED1C29`, `#17171B`, `#E3E3E6`…) y datos inventados (peso `2.1 kB`, versión `v0.4.2`, componentes `text-field` y `data-table` que no existen en el repo). Es una especificación visual, no una fuente de datos.

## Goals / Non-Goals

**Goals:**

- Un único modelo de navegación del que se deriven el sidebar, el pager y la búsqueda, de modo que agregar una página no obligue a tocar tres lugares.
- Que todo valor mostrado en las páginas de fundamentos y en los metadatos de componente se derive de su fuente real (`@tuya-ui/tokens`, `registry.json`, `package.json`) y no se transcriba a mano.
- Primitivas de presentación compartidas (lienzo con pie, nota destacada, tabla de referencia, bloque de código) usadas por igual en páginas de contenido y en páginas de componente.

**Non-Goals:**

- No se introduce MDX ni ningún pipeline de contenido nuevo.
- No se crean componentes nuevos en `@tuya-ui/components`. Los componentes que el mockup ilustra y que no existen en el repo (`text-field`, `data-table`, `alert`) no se inventan: el sitio documenta lo que hay en el registro.
- No se retira el modo oscuro de `@tuya-ui/tokens` ni de los componentes. Solo el sitio de documentación deja de ofrecerlo.
- No se construye una sección de iconos ni un changelog. Los enlaces de navegación global apuntan solo a áreas que existen.

## Decisions

### El modelo de navegación es un árbol ordenado, y es la única fuente

`buildNavigation()` devuelve secciones cuyo contenido es, o bien una lista de enlaces (`label`, `to`, `badge` opcional), o bien una lista de grupos de categoría que a su vez contienen enlaces. Solo la sección de componentes usa el nivel de grupo; Empezar y Fundamentos son listas cortas y fijas que no lo necesitan. El nodo de grupo no tiene `to`: no es una página, es un contenedor.

De ese árbol se derivan por recorrido en profundidad tres cosas: el sidebar, el orden lineal que alimenta el pager Anterior/Siguiente, y el índice que consume la búsqueda. El recorrido ignora los nodos de grupo al construir el orden, de modo que el pager encadena páginas y nunca se detiene en una categoría.

*Por qué:* el pager exige un orden total sobre las páginas. Mantener ese orden en una lista aparte lo dejaría desincronizado del sidebar en cuanto alguien agregue una página. Derivarlo del mismo árbol hace imposible esa divergencia, y que el árbol tenga un nivel más no cambia esa garantía: solo cambia el recorrido que lo aplana.

*Alternativa considerada:* declarar el orden del pager en la definición de rutas de React Router. Se descarta porque las rutas incluyen la ruta de detalle paramétrica (`/components/:name`), que no es una posición sino una familia de páginas.

*Consecuencia:* el sidebar no muestra el catálogo completo al llegar. Un lector que quiera ver todo lo que hay abre las categorías, o usa la búsqueda, que sí indexa todos los componentes estén o no desplegados.

### El despliegue de una categoría se deriva de la ruta, no se guarda

Un grupo está abierto si contiene la página actual, y cerrado si no. El usuario puede abrir y cerrar grupos durante su visita, pero ese estado no se persiste entre cargas ni se sincroniza con la URL.

*Por qué:* la pregunta que el sidebar tiene que responder al abrirse es "¿dónde estoy?", y la respuesta correcta a esa pregunta ya está en la ruta. Persistir el estado de despliegue significa que un enlace directo a `input` puede llegar con la categoría de `input` cerrada, que es exactamente el caso que el despliegue automático existe para evitar.

*Alternativa considerada:* guardar los grupos abiertos en `localStorage`, como hacía el sidebar anterior con sus disclosures. Se descarta: reintroduce estado persistido que hay que migrar y limpiar, para recordar una preferencia que el usuario no formuló como tal.

### La sangría es la jerarquía, y es escalonada

Cuatro posiciones horizontales, una por nivel: el encabezado de sección en el margen exterior de la columna; las páginas que cuelgan directamente de él, un paso adentro; los grupos de categoría, en ese mismo paso —son hermanos de una página, no hijos—; y los componentes de un grupo, un paso más adentro. Sin línea guía ni divisorias entre secciones: la sangría y el tratamiento tipográfico son los únicos portadores de la jerarquía.

*Por qué:* el requisito pide que los tres niveles se distingan por sangría y por tipografía. Un sidebar donde todo arranca en la misma x cumple solo la mitad, y la mitad tipográfica sola —versalitas contra texto normal— distingue el encabezado de lo demás pero no dice qué cuelga de qué.

*Consecuencia a resolver:* el ítem activo se marca con un riel de color de marca dibujado como sombra interior sobre el borde izquierdo de su fila. Al sangrar las filas, ese riel se corre con ellas y deja de alinearse con el borde de la columna. El riel acompaña a la fila: marca *qué* ítem es el actual, no a qué altura de la columna está, y una marca que no toca lo que marca es peor que una desalineada.

### Las etiquetas se muestran como fueron escritas

Ninguna superficie transforma mayúsculas por CSS. El único nombre que necesita capitalizarse es el del componente, que en el registro es un identificador en minúscula (`button`), y se capitaliza una vez en el modelo de navegación, donde el identificador se convierte en etiqueta.

*Por qué:* `capitalize` no distingue un nombre propio de una preposición ni de un identificador. Aplicado a toda etiqueta convierte `CLI tuya-ui` en `CLI Tuya-Ui` —que nombra un binario inexistente— y `Anatomía de un proyecto` en `Anatomía De Un Proyecto`. El costo de la regla es capitalizar el nombre del componente en un lugar; el costo de no tenerla es que cada etiqueta nueva de más de una palabra sale mal escrita.

*Alcance:* la regla vale para toda superficie que muestre el nombre de una página —el sidebar, el título de la página, las migas y el pager—, no solo para el sidebar donde el defecto se vio primero.

### Las categorías se ordenan por lo que se lee

El orden de los grupos de categoría sale de su etiqueta mostrada, no de la clave con la que el registro las nombra.

*Por qué:* las claves del registro están en inglés y las etiquetas en español, de modo que ordenar por clave produce en pantalla una secuencia sin orden aparente —Acciones, Feedback, Formularios, Estructura— que el lector no puede predecir ni usar para buscar.

### La restauración del scroll vive en el shell, no en cada página

Un efecto en el layout lleva la ventana al tope cuando cambia el `pathname` de la ruta, y solo cuando cambia el `pathname`: un cambio de `hash` —el salto a una sección desde el rail— o de query string —la pestaña activa de un componente— no lo dispara.

*Por qué:* el navegador conserva el desplazamiento porque en una SPA no hubo carga de documento, y el resultado es que una página nueva se abre por la mitad. Resolverlo en el shell hace que ninguna página tenga que acordarse de hacerlo, y distinguir `pathname` de `hash` es lo que evita que la corrección pelee con el índice de la página.

### Se retira la página de catálogo

La ruta del catálogo y su componente desaparecen. El enlace "Componentes" del header y el acceso de la página de inicio pasan a apuntar a la página del primer componente del registro, calculada desde el mismo orden de navegación en vez de escrita a mano.

*Por qué:* el catálogo y el sidebar eran dos índices del mismo conjunto. Con el sidebar agrupado por categoría, el sidebar es el mejor de los dos: está siempre presente, no ocupa una página, y marca dónde estás.

*Lo que se pierde:* la vista previa renderizada en vivo junto a cada nombre, que era lo único que el catálogo ofrecía y el sidebar no. No se reemplaza. Si más adelante se quiere una vista de conjunto con previews, es una decisión con su propio change, no un residuo de este.

### El estado y el peso del componente se generan, no se escriben

`ComponentDefinition` gana un campo `status: "estable" | "beta"` declarado a mano —es un juicio del equipo, no algo derivable—, y `generate.ts` añade a cada entrada del registro un campo `bytes` calculado como la suma del tamaño del contenido de sus archivos y de los archivos de sus dependencias internas. El sitio formatea ese número; no lo almacena.

*Por qué:* el peso es exactamente lo que el CLI copiará, y cambia con cada edición del componente. Escrito a mano queda obsoleto en la primera modificación.

*Alternativa considerada:* medir el peso minificado con un bundler. Se descarta: el CLI copia código fuente legible, no un bundle, así que el tamaño del fuente es la cifra honesta.

### El contenido nuevo son módulos TypeScript tipados, no MDX

Las seis páginas nuevas se escriben como módulos de datos bajo `src/content/` con un tipo por clase de página (`InstallationContent`, `CliReferenceContent`, `ProjectAnatomyContent`, y las de fundamentos), renderizados por componentes de página que recorren esos datos.

*Por qué:* es el patrón que el sitio ya usa para el contenido por componente, el compilador verifica que ninguna sección quede sin llenar, y no agrega dependencias ni configuración de build.

*Alternativa considerada:* MDX. Da libertad editorial, pero introduce un plugin de Vite, pierde la verificación de estructura, y permitiría escribir un valor de token a mano en prosa — justo lo que este diseño quiere impedir.

*Trade-off aceptado:* redactar prosa dentro de literales de TypeScript es menos cómodo que escribir Markdown. Se mitiga permitiendo cadenas multilínea y manteniendo los párrafos como arreglos de strings.

### Los valores de fundamentos se importan de `@tuya-ui/tokens`

Las páginas de tipografía, color y espaciado importan las escalas desde el paquete de tokens y renderizan sus valores. El módulo de contenido aporta solo lo que el token no sabe de sí mismo: el uso previsto de cada paso y las reglas de aplicación.

*Por qué:* es la misma garantía que ya rige para la tabla de props. Un token renombrado o un valor cambiado se refleja en la documentación sin editarla, y una escala transcrita a mano no puede mentir porque no existe.

### El tema se fija en el HTML, no en tiempo de ejecución

Se eliminan `ThemeProvider`, `useTheme` y `ThemeToggle`, y `index.html` declara `data-theme="light"` en `<html>`. El resaltado de sintaxis se fija al tema claro correspondiente.

*Por qué:* con un solo tema, el proveedor y su estado no aportan nada; declararlo en el HTML también elimina el parpadeo de tema en la primera carga.

*Nota de reversibilidad:* los tokens de modo oscuro siguen publicados en `@tuya-ui/tokens`. Reintroducir el selector más adelante es volver a montar el proveedor, no rehacer el sistema de color.

### Una primitiva de lienzo compartida entre ejemplos y anatomía

Un componente `Canvas` provee el fondo de retícula punteada, el marco y el pie descriptivo. `ExampleBlock` lo usa para el render del ejemplo; la sección de anatomía lo usa para las vistas de partes y de estados.

*Por qué:* las tres superficies son el mismo objeto visual —una pieza de UI aislada del texto con una leyenda que la explica— y el mockup las dibuja idénticas.

### Los estados de interacción de la anatomía se representan, no se simulan

La vista de estados renderiza el componente real cuatro veces con clases que fuerzan cada apariencia (reposo, hover, foco, deshabilitado), en vez de capturas de imagen o de reimplementar la apariencia con divs como hace el mockup.

*Por qué:* una captura se desactualiza en silencio y una reimplementación puede diferir del componente. Forzar el estado sobre el componente real mantiene la ilustración atada a la implementación.

*Riesgo asumido:* forzar `hover` requiere clases utilitarias que apliquen el estilo del estado sin el evento. Si algún estado no puede forzarse de forma fiable, ese estado se ilustra con el componente en reposo y una anotación en el pie, en vez de dibujar una aproximación.

### El rail derecho contiene solo el índice de la página

El mockup dibuja bajo el índice un bloque de accesos para intervenir sobre la propia documentación (editar la página, reportar un problema, ver en Figma). No se implementa: el proyecto no declara URL de repositorio, de rastreador de issues ni de archivo de Figma, y no es un repositorio git del que pudiera derivarse un remote.

*Por qué:* tres enlaces con destino inventado son peores que ausentes — se ven funcionales y llevan a un 404. El rail queda con el índice, que es lo que sí puede construirse a partir de la propia página.

*Si más adelante existen esos destinos:* el bloque se reintroduce con un change propio que declare las URLs y devuelva al spec los escenarios correspondientes.

## Risks / Trade-offs

- **El mockup ilustra componentes que no existen (`text-field`, `data-table`, `alert`) y los usa para mostrar tablas de API y de accesibilidad ricas.** → El sitio documenta los cuatro componentes del registro (`button`, `input`, `card`, `badge`). Las secciones de anatomía y las tablas de accesibilidad se escriben para esos cuatro. La densidad visual del mockup en esas páginas no se reproducirá al pie de la letra porque los componentes reales son más simples.
- **Con las categorías cerradas por defecto, quien llega por primera vez no ve ningún componente en el sidebar.** → Es el costo deliberado de que el sidebar no crezca con el catálogo. Se mitiga desde tres lados: los nombres de categoría dicen qué hay dentro, la búsqueda del header indexa todos los componentes estén desplegados o no, y la página de inicio lleva directo a un componente, cuya categoría llega abierta. Si aun así resulta que los lectores no encuentran los componentes, abrir todos los grupos por defecto es un cambio de una línea.
- **La sangría y la tipografía tienen que sostener tres niveles en una columna estrecha.** → El nivel de sección ya se distingue por versalitas y color tenue. El grupo se separa del ítem por su control de despliegue, su peso y su sangría; el ítem, por estar más adentro y en peso normal. Son tres señales por nivel (posición, peso, tratamiento), no una sola, que es lo que el requisito pide al exigir que la jerarquía no dependa del color.
- **Retirar el modo oscuro descarta trabajo ya hecho y puede pedirse de vuelta.** → Se conserva intacto el sistema de tokens de ambos modos; lo que se retira es el proveedor y el control, unas pocas decenas de líneas.
- **Seis páginas de contenido nuevas es mucha prosa, y prosa mal escrita envejece peor que código.** → Cada página nueva declara su índice de secciones y el contenido de cada sección; la estructura tipada impide entregar una página a medias, y los valores vienen de los tokens, de modo que solo la orientación es texto humano.
- **Forzar el estado `hover` sobre el componente real puede no ser fiable en todos los casos.** → Mitigado por la regla de fallback descrita arriba: se ilustra el estado en reposo con anotación, nunca una reimplementación divergente.

## Migration Plan

1. Extender el registro (`status`, `bytes`) y regenerar `registry.json`. Es aditivo: el sitio actual sigue compilando.
2. Reemplazar el modelo de navegación y el shell (topbar, sidebar, rail, pager, encabezado de página). A partir de aquí el sitio se ve como el mockup aunque el contenido nuevo aún no exista.
3. Retirar el tema oscuro.
4. Reorganizar la página de componente (chips, pestañas, lienzo, tabla de accesibilidad, anatomía).
5. Añadir las páginas de Empezar y de Fundamentos, y redirigir `/tokens` a la página de color.
6. Agrupar los componentes por categoría en el sidebar, dar sangría y tipografía a los tres niveles, restaurar el scroll al cambiar de ruta, y retirar la página de catálogo.

Cada paso deja el sitio en estado utilizable. No hay estado persistido que migrar: la única clave en `localStorage` es la del tema, que queda huérfana y es inocua.

## Open Questions

Ninguna.
