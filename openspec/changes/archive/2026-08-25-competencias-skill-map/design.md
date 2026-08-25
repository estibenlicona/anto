## Context

Lo que ya existe y se conserva:

- `GET /career-plan/span` devuelve `{ skills[], people[] }` con, por celda, `level`, `expectedLevel` y `gap` (`null` sin con qué comparar, `0` al nivel o por encima). La comparación es siempre contra el rol de esa fila.
- `GET /career-plan/people/:id/plan` devuelve el perfil de una persona con sus habilidades y sus acciones (`dueMonth`, `status`).
- La pantalla actual: `SpanMatrixContainer` con `SpanControls` (grupo + orden), `SpanMatrixTable`, `SpanCell`, `SpanLegend` y `SpanCellDetail` dentro de un `Popover` anclado a la celda activa. El popover es único para todo el mapa: con ~126 celdas, un disparador por celda sería caro y ruidoso para el teclado.
- Las evaluaciones viven por **ciclo** (`assessments.handlers.ts`, `currentCycle()`), pero no hay ninguna cerrada de un ciclo anterior sembrada.

Lo que el mockup agrega y hoy no tiene fuente: brechas críticas y totales del span, cobertura, variación contra el ciclo anterior, personas en riesgo, habilidades que concentran la brecha, y los cuatro pendientes de gestión (evaluaciones sin cerrar, planes vencidos, roles sin nivel, brechas sin plan).

Del catálogo de tuip: `Card`, `Tabs`/`SegmentedControl`, `Avatar`/`AvatarGroup`, `Tag`, `Tooltip`, `Meter`, `Progress`, `Table` y `EmptyState` cubren casi todo. **No hay componente de serie temporal** (el sparkline de la card de variación).

## Goals / Non-Goals

**Goals:**

- Que la pantalla responda, sin contar a mano, cuán grave es la situación, sobre cuánta gente se está hablando, si mejora, dónde duele más y qué falta gestionar.
- Que la matriz se pueda leer sin abrir celdas: qué habilidad es cada columna y contra qué rol se mide cada fila.
- Que el detalle de una celda conviva con el mapa en vez de taparlo.
- Que el rename sea completo: rótulo, breadcrumb y ruta dicen lo mismo.

**Non-Goals:**

- Cambiar cómo se calcula una brecha, o el contenido del plan individual.
- Resolver el cursor de los botones (va en `restore-pointer-cursor`, en tuip).
- Que el backend .NET sirva este módulo: sigue siendo mock, como el resto de career-plan.

## Decisions

### 1. Un endpoint de resumen, no N peticiones

`GET /career-plan/span/summary` devuelve todo lo que la pantalla necesita y el span no alcanza a decir:

```
{
  totalGaps, criticalGaps,              // brechas abiertas y las de 2+ niveles
  evaluatedPeople, totalPeople,          // cobertura
  peopleAtRisk: [{ personId, name }],    // 3 brechas o más
  previousCycle: { cycle, totalGaps } | null,
  trend: [{ cycle, totalGaps }],         // ciclos cerrados, del más viejo al actual
  topSkills: [{ skillId, name, weight, peopleWithGap, expectedLevel }],
  pending: { unassessed, overduePlans, rolesWithoutLevel, gapsWithoutPlan }
}
```

- **Por qué del lado del dato**: `overduePlans` y `gapsWithoutPlan` viven en los planes individuales. Derivarlos en el cliente obliga a pedir el plan de cada persona en cada carga de la pantalla — con 25 personas, 25 peticiones para pintar dos cifras.
- **`peopleAtRisk` con nombres, no sólo el conteo**: la card muestra avatares, y sin nombre no hay avatar.
- **`trend` como lista de ciclos y no de números sueltos**: cada punto tiene que poder decir de qué ciclo habla al pasar el puntero. El mockup rotula "N brechas" a secas porque no tenía ciclos.
- **`previousCycle: null` es un caso real**, no un cero: sin ciclo anterior el indicador dice que no hay con qué comparar (un `0` se leería como "no cambió nada").

**Alternativa descartada**: extender `GET /career-plan/span` con estos campos. La matriz y el resumen se recargan por motivos distintos —el resumen no depende del filtro de habilidades— y mezclarlos obliga a traer toda la matriz para refrescar una cifra.

### 2. La sigla de dos letras es una función compartida, no un campo del catálogo

Una función `skillInitials(name)` en `shared`, junto a la lógica de iniciales de personas que ya existe (`getPersonInitials`):

- Nombre de varias palabras → iniciales de las dos primeras: "Trabajo en equipo" → **TE**, "Node.js" → **No**.
- Nombre de una sola palabra → sus dos primeras letras: "React" → **Re**, "SQL" → **SQ**.
- Se ignoran conectores en minúscula ("de", "en", "y") al elegir las dos palabras, o "Trabajo en equipo" daría "TE" contra "TQ" y casos parecidos quedarían disparejos.

**Por qué derivarla y no guardarla**: una abreviatura escrita a mano por habilidad es un campo más que mantener en el catálogo, que nadie recuerda llenar al crear una habilidad y que deriva en dos criterios conviviendo. El costo es que dos habilidades pueden colisionar en la misma sigla ("React" y "Redux" → "Re"); lo asumimos porque **la sigla no identifica, ubica**: el nombre completo está en el tooltip, en el nombre accesible de la columna y en el detalle de la celda.

Esto revierte la decisión vigente de dejar el encabezado vacío. El motivo de aquella decisión —que el nombre completo descuadra el ancho uniforme de las columnas— sigue siendo válido y por eso la sigla es de dos letras y de ancho fijo; lo que cambia es la conclusión: dos letras ubican la columna sin costar ancho, y obligar a abrir una celda para saber de qué habilidad se trata era un peaje por cada lectura.

### 3. El detalle deja el popover y pasa a la columna de apoyo

`SpanCellDetail` sale del `Popover` y se renderiza en la columna derecha. Se conserva la celda como botón, el foco y el cierre con Escape.

- **Por qué**: la lectura que la pantalla habilita es comparar la celda abierta con el resto del mapa, y un panel flotante anclado a la celda tapa justamente sus vecinas. Además, la columna ya existe por los otros dos bloques: el detalle ocupa su lugar cuando hay celda activa y lo cede cuando no.
- **Lo que se pierde**: la proximidad entre la celda y su detalle. Se compensa marcando la celda activa en la matriz —ya existe `activeCellKey`— para que la relación siga siendo visible.

### 4. Los indicadores hablan del span, los totales de la vista

Regla explícita porque el mockup no la resuelve: las cuatro cards se calculan sobre **todo** el chapter y no cambian al filtrar por técnicas o humanas; los totales de fila y de columna sí siguen al recorte, porque están dentro de la tabla y una cifra que no corresponde a lo que se ve engaña.

### 5. El historial se siembra en el mock

`assessments.seeds.ts` / `career-plan.seeds.ts` incorporan evaluaciones cerradas de ciclos anteriores para un subconjunto del chapter, de modo que la variación compare contra algo real y la serie tenga más de un punto. El backend .NET tendrá que servir lo mismo; queda anotado como brecha, igual que el resto del módulo.

Sembrar historial tiene un efecto de borde: el plan individual y cualquier lectura que tome "la última evaluación cerrada" deben seguir tomando la del ciclo vigente, no la vieja. Las semillas se agregan con esa condición y las pruebas del plan lo verifican.

### 6. Rename: ruta nueva, sin redirección

`/app/lead/plan-carrera` → `/app/lead/competencias`, sin conservar la vieja. El módulo es interno, se llega por el menú y no hay enlaces publicados fuera de la aplicación. La ruta antigua de Capacidades sí tiene redirección, pero por un motivo que no aplica acá: existía como pantalla propia y se eliminó.

La capacidad de openspec sigue llamándose `career-plan`: renombrarla movería el spec y su archivo histórico sin cambiar nada de lo que el usuario ve.

### 7. El sparkline se resuelve primero en tuip

Es el único elemento del mockup sin componente en el catálogo. Antes de dibujarlo en la aplicación, se busca si `Meter`, `Progress` o `SegmentedBar` lo cubren; si no, se crea la variante en tuip (con su change allá) y después se usa acá. No se dibuja una serie a mano en el frontend.

Si eso demora, la card puede entrar mostrando la variación sin la serie: el número es el dato, la serie es el contexto.

## Risks / Trade-offs

- **Dos siglas pueden colisionar.** "React" y "Redux" quedan en "Re". La columna sigue identificándose por posición y tooltip; si el catálogo llega a tener muchas colisiones, la regla puede afinarse sin tocar la pantalla, porque vive en un solo lugar.
- **El resumen duplica cuentas que el span ya permite derivar** (brechas totales, personas en riesgo). Se acepta para que la pantalla no tenga dos fuentes con reglas de redondeo distintas: el resumen manda, y la matriz sigue siendo el detalle.
- **Sembrar historial toca semillas que otras pruebas usan.** Es el riesgo concreto de este change; se acota agregando ciclos anteriores sin cambiar los datos del ciclo vigente.
- **La columna de apoyo compite por ancho con la matriz.** Con muchas habilidades, la matriz ya se desplaza a lo ancho; la columna le quita espacio. Se mitiga con la columna de persona fija, que ya existe, y midiendo la tabla por su contenido.
