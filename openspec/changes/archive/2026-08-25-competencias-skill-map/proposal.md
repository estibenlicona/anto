## Why

El módulo se llama "Plan de carrera", pero lo que el Chapter Lead abre ahí no es un plan: es el mapa de qué le falta a su gente contra lo que su rol pide. El plan individual es una pantalla de segundo nivel. El rótulo nombra la excepción y no lo que se hace todos los días.

Y la pantalla se quedó corta. Hoy es la matriz, su leyenda y un panel al activar una celda. El Chapter Lead ve dónde están las brechas, pero no puede responder sin contarlas a mano:

- **Cuántas son graves.** Una brecha de un nivel se cierra acompañando en el trabajo; una de dos o tres pide un plan formal. La matriz las pinta distinto, pero no las suma.
- **Sobre cuánta gente está mirando.** Las personas sin evaluación cerrada no entran en ningún total, y hoy la pantalla las menciona en una línea suelta.
- **Si esto mejora o empeora.** No hay comparación con el ciclo anterior: cada visita es una foto sin antes.
- **Qué habilidad concentra el problema del chapter**, y **qué quedó pendiente de gestionar** —evaluaciones sin cerrar, planes vencidos, brechas sin ninguna acción—.

Además, leer la matriz cuesta más de lo necesario: los encabezados no dicen de qué habilidad es cada columna, así que hay que abrir una celda para saberlo.

## What Changes

- **El módulo pasa a llamarse "Competencias"**, en la navegación, el breadcrumb y los títulos, y su ruta pasa a `/app/lead/competencias` (y `/app/lead/competencias/:personId` para el plan individual). **BREAKING** para cualquier enlace guardado a `/app/lead/plan-carrera`.
- **La pantalla del mapa se rearma en tres zonas**: una fila de indicadores arriba, la matriz al centro y una columna de apoyo a la derecha.
  - **Cuatro indicadores**: brechas críticas del span (de 2 niveles o más) sobre el total de brechas abiertas; cobertura de evaluación (cuántas personas evaluadas de cuántas); variación contra el ciclo anterior, con la serie de los últimos ciclos; y personas en riesgo (3 brechas o más), con sus avatares.
  - **La matriz gana lectura propia**: pestañas Todas · Técnicas · Humanas, orden por brechas o por nombre, los grupos rotulados sobre sus columnas, el rol de cada persona bajo su nombre, una columna con cuántas brechas acumula cada fila y un pie con cuántas personas tienen brecha en cada habilidad.
  - **Cada columna se identifica con una sigla de dos letras** derivada del nombre de la habilidad, con el nombre completo al pasar el puntero. **Revierte** la decisión vigente de no escribir nada en el encabezado.
  - **La columna derecha** reúne el detalle de la celda activa —que deja de ser un panel flotante—, las habilidades que más brecha concentran en el chapter y las acciones pendientes de gestionar.
- **Un endpoint de resumen del span** entrega esas cifras ya calculadas, en una sola petición.
- **Las semillas ganan ciclos anteriores** de evaluación cerrada, para que la variación compare contra algo real y no contra un número inventado.

### Fuera de alcance

- El plan individual de una persona y su detalle de criterios: cambian de ruta y de rótulo, no de contenido.
- La evaluación de habilidades y el catálogo: son la fuente del mapa, no parte de este change.
- El cursor de los botones tras la migración a Tailwind v4: es un defecto transversal del sistema de diseño y se atiende en `restore-pointer-cursor`, en tuip.

## Capabilities

### Modified Capabilities

- `career-plan`: el módulo se llama Competencias y vive en `/app/lead/competencias`; la pantalla del mapa suma indicadores del span, identificación de columnas, totales por fila, panel lateral fijo, foco de habilidades y acciones pendientes.
- `chapter-lead-shell`: la entrada del menú y su breadcrumb pasan de "Plan de carrera" a "Competencias".

## Impact

- **Rutas**: `frontend/src/app/router/routes.tsx` (dos rutas), `features/chapter-lead-shell/navigation.ts` (etiqueta, href y mapa de breadcrumbs), y los tres puntos que navegan hacia allá: `SpanMatrixContainer`, `PersonDetailContainer` y `PersonDetailHeader`.
- **Pantalla**: `features/career-plan/SpanMatrixContainer.tsx` y sus componentes (`SpanControls`, `SpanMatrixTable`, `SpanCell`, `SpanCellDetail`, `SpanLegend`), más los componentes nuevos de indicadores, foco y pendientes.
- **Datos**: `careerPlanService` gana el resumen del span; el mock `career-plan.handlers.ts` lo sirve y `career-plan.seeds.ts` incorpora los ciclos anteriores. El backend .NET no expone todavía este módulo: la brecha queda anotada, como en el resto del módulo.
- **Compartido**: una función que reduce un nombre a dos letras —una palabra o una frase— para las siglas de las columnas, junto a `getPersonInitials`, que ya resuelve el caso de personas.
- **Pruebas**: las del módulo (`career-plan/__test__`), las de navegación (`chapter-lead-shell/__test__/navigation.test.ts`, `routes.test.tsx`) y las del handler de career-plan.
- **tuip**: el mockup usa tarjetas, pestañas, avatares, etiquetas, barras y tablas que el catálogo ya tiene. Lo que no aparece resuelto es el **sparkline** de la card de variación; si no hay componente que lo cubra, se crea primero en tuip y después se usa acá.
