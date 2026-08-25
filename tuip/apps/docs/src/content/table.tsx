import {
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const tableContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para mostrar una lista de registros con las mismas columnas: personas, transacciones, capacidades.",
      "Cuando comparar valores entre filas — sobre todo numéricos — es parte de la tarea.",
      "Cuando las columnas necesitan ordenarse, o la tabla necesita verse más compacta para mostrar más filas a la vez.",
      "Para una matriz de muchas columnas cortas —un medidor, un dígito— donde la tarea es comparar filas entre sí: `density=\"matrix\"` las junta y `stickyFirstColumn` deja anclada la columna que dice de quién es cada fila.",
      "Cuando cada fila tiene un detalle que se lee dentro de su propio contexto: `detail` lo abre como una fila más de la tabla, sin sacar al usuario a otra pantalla.",
    ],
    whenNotToUse: [
      "Para búsqueda, filtros o paginación de datos: Table no trae esa lógica — se compone con `SearchField`, `FilterButton` y `PaginationBar`, y el filtrado/orden real de los datos sigue siendo responsabilidad del consumidor.",
      "Para agrupar un solo registro con sus atributos: eso es un `Card`, no una tabla de una fila.",
    ],
    pairs: [
      {
        do: "Pasar `align=\"right\"` a la cabecera y a cada celda de una columna numérica; el texto se queda con la alineación izquierda por defecto.",
        dont: "Centrar todas las columnas por igual, o aplicar `text-right`/`tabular-nums` a mano por `className`.",
        why: "La alineación consistente es lo que permite comparar números de un vistazo, columna por columna, sin leer cada celda. `align=\"right\"` aplica las cifras tabulares junto con la alineación, así que no se puede quedar a medias — alineado a la derecha pero con dígitos de ancho variable, que es justo lo que impide compararlos.",
      },
      {
        do: "Mostrar un dato ausente como “—”.",
        dont: "Dejar la celda vacía.",
        why: "Una celda vacía se lee como un fallo de carga; el guion dice explícitamente que no hay dato.",
      },
      {
        do: "Pasar `onSort` a `TableHead` solo en columnas donde ordenar tiene sentido, y mantener el estado de orden (columna + dirección) en el consumidor.",
        dont: "Esperar que TableHead reordene las filas por sí sola.",
        why: "TableHead solo expone el afordance accesible — clic, `aria-sort`, ícono de dirección. El comparador real depende de la forma de los datos, que Table nunca conoce.",
      },
      {
        do: "Guardar en la pantalla qué filas están abiertas y pasarlo por `expanded`.",
        dont: "Esperar que TableRow recuerde su propia apertura, o que cierre las demás al abrir una.",
        why: "Quién está abierto es estado de la pantalla: puede venir de la URL, o la tarea puede ser comparar dos filas abiertas a la vez. Una fila que guardara lo suyo pelearía con las dos cosas.",
      },
      {
        do: "Dejar que el contenedor propio de Table sea el que recorta cuando se usa `stickyFirstColumn`.",
        dont: "Envolver la tabla en un contenedor con `overflow: hidden` — una Card que recorta, un panel con `overflow-hidden` para redondear esquinas.",
        why: "`overflow: hidden` en cualquier ancestro anula `position: sticky`, y lo hace en silencio: no hay error, la columna simplemente se va con el scroll. El contenedor de Table usa `overflow-x-auto`, que sí es compatible; la trampa es el envoltorio que se agrega alrededor.",
      },
      {
        do: "Armar la columna de selección componiendo `Checkbox` dentro de `TableHead`/`TableCell`, con el estado de selección en el consumidor.",
        dont: "Buscar una prop `selectable` en Table o TableRow.",
        why: "Es el mismo criterio que ya evitó una prop `columns`/`rows`: Table no conoce la forma de los datos, y `Checkbox` ya resuelve marcado/desmarcado/indeterminado para \"seleccionar todas\".",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Capacidad</TableHead>
            <TableHead>Célula</TableHead>
            <TableHead align="right">FTE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Julián Pérez</TableCell>
            <TableCell>Backend Platform</TableCell>
            <TableCell align="right">1.0</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Laura Ruiz</TableCell>
            <TableCell>Canales Digitales</TableCell>
            <TableCell align="right" className="text-neutral-subtle">
              —
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>Total</TableCell>
            <TableCell align="right">1.8</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    ),
    partsCaption: "header · body · footer — cada fila y celda se compone a mano, sin una prop de datos",
    partsDescription:
      "Las siete partes son un espejo uno a uno de los elementos nativos de tabla: quien conoce `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th>` y `<td>` reconoce la API sin aprender nada nuevo. No hay una prop `columns`/`rows`: cada celda es JSX normal, así que puede llevar cualquier contenido, alineación o formato que la fila necesite.",
    parts: [
      {
        name: "Padding de celda",
        measure: "px-4 py-3 (cómoda) · px-3 py-1.5 (compacta) · px-2 py-1 (matriz)",
        note: "En TableCell. Cambia según la `density` que reciba Table. `matrix` baja también en horizontal, que es su razón de ser: la celda lleva un medidor o una cifra de un dígito, y el aire pensado para leer texto separa tanto las columnas que ya no se comparan las filas entre sí.",
      },
      {
        name: "Padding de cabecera",
        measure: "px-4 py-2 (cómoda) · px-3 py-1 (compacta) · px-2 py-0.5 (matriz)",
        note: "Siempre más bajo que el del cuerpo en la misma densidad — una etiqueta de columna necesita menos aire que una celda de datos. También cambia con `density`, desde una base más baja.",
      },
      {
        name: "Columna fija",
        measure: "position: sticky · left-0 · fondo de su sección",
        note: "Con `stickyFirstColumn`, la primera celda de cada fila —cuerpo, cabecera y pie— queda anclada mientras el resto se desplaza. Lleva el fondo opaco que ya tiene su sección, porque una celda sticky sin fondo deja pasar por debajo el contenido que corre. Requiere que ningún ancestro recorte con `overflow: hidden`.",
      },
      {
        name: "Separación de la columna fija",
        measure: "shadow.edge — 2px 0 4px -1px",
        note: "Aparece sólo cuando hay contenido oculto hacia la izquierda, para que la línea signifique “acá empieza lo congelado” y no se confunda con una divisoria más. `shadow.edge` es la receta de `shadow.sm` girada al eje horizontal: el resto de la familia se lee como luz desde arriba y este borde es una costura lateral, no elevación.",
      },
      {
        name: "Divisorias de fila",
        measure: "border-b border-neutral-default",
        note: "Cada TableRow lleva su propio borde inferior; no depende de un contenedor con `divide-y`. La última fila del cuerpo no lo dibuja, para no duplicar la línea contra el borde del contenedor — la de la cabecera sí, porque es la que la separa del cuerpo.",
      },
      {
        name: "Cabecera",
        measure: "bg-neutral-subtlest · text-neutral-default · uppercase · font-bold",
        note: "Fondo casi blanco, apenas diferenciado del cuerpo — no un gris sólido marcado. El texto en mayúsculas y negrita mide al menos 4.5:1 contra ese fondo (verificado en verify-tokens.ts).",
      },
      {
        name: "Pie",
        measure: "bg-neutral-subtlest",
        note: "Comparte el mismo fondo casi blanco que la cabecera.",
      },
      {
        name: "Cuerpo",
        measure: "bg-neutral-default",
        note: "Fondo blanco explícito en el contenedor de Table, distinguible del casi blanco de cabecera y pie.",
      },
      {
        name: "Ícono de orden",
        measure: "16px",
        note: "Aparece en una TableHead solo cuando recibe `onSort`; el ícono cambia entre neutro, ascendente y descendente según `sortDirection`.",
      },
      {
        name: "Contenedor",
        measure: "border-neutral-default + overflow-x-auto",
        note: "Table envuelve el elemento nativo en un contenedor con scroll horizontal, para que una tabla ancha no rompa el layout de la página. Con `flush` el contenedor conserva el scroll pero omite borde y esquinas, para cuando la tabla ya está dentro de una Card.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Densidad compacta") {
        return (
          <Table density="compact">
            <TableHeader>
              <TableRow>
                <TableHead>Capacidad</TableHead>
                <TableHead align="right">FTE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Julián Pérez</TableCell>
                <TableCell align="right">1.0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Laura Ruiz</TableCell>
                <TableCell align="right" className="text-neutral-subtle">—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      }
      if (state.name === "Cabecera ordenable") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead sortDirection="asc" onSort={() => {}}>
                  Capacidad
                </TableHead>
                <TableHead align="right">FTE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Julián Pérez</TableCell>
                <TableCell align="right">1.0</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      }
      if (state.name === "Selección de filas") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox aria-label="Seleccionar todas" />
                </TableHead>
                <TableHead>Capacidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Checkbox aria-label="Seleccionar fila" />
                </TableCell>
                <TableCell>Julián Pérez</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        );
      }
      return (
        <Table className={state.className}>
          <TableHeader>
            <TableRow>
              <TableHead>Capacidad</TableHead>
              <TableHead align="right">FTE</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Julián Pérez</TableCell>
              <TableCell align="right">1.0</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    },
    states: [
      { name: "Reposo" },
      {
        name: "Hover de fila",
        note: "Cada TableRow ya trae `hover:bg-neutral-subtle-hover`; no se puede forzar aquí sin interacción real, así que se documenta en vez de ilustrarse.",
      },
      { name: "Densidad compacta", note: "Misma tabla, con `density=\"compact\"` en vez del valor por defecto." },
      { name: "Cabecera ordenable", note: "`onSort` vuelve la cabecera un botón accesible; `sortDirection=\"asc\"` fija el ícono y el `aria-sort`." },
      { name: "Selección de filas", note: "Patrón de composición con `Checkbox`, no una capacidad propia de Table." },
    ],
    statesCaption:
      "Table no tiene estados de interacción propios más allá del hover de fila — densidad, orden y selección son extensiones aditivas o patrones de composición",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<table>",
      explanation:
        "Table y sus partes envuelven directamente los elementos nativos de tabla, así que un lector de pantalla anuncia filas, columnas y cabeceras sin ningún rol ARIA agregado a mano.",
    },
    {
      aspect: "Cabeceras de columna",
      value: "<th>",
      explanation:
        "TableHead usa `<th>`, que un lector de pantalla asocia automáticamente a cada celda de su columna al recorrer la fila.",
    },
    {
      aspect: "Cabecera ordenable",
      value: 'aria-sort="ascending|descending|none"',
      explanation:
        "Cuando una TableHead recibe `onSort`, se convierte en un botón accesible (foco, Enter/Espacio) y expone su dirección de orden actual mediante el atributo estándar de tabla, sin roles inventados.",
    },
    {
      aspect: "Nombre accesible",
      value: "<caption>",
      explanation:
        "Table no agrega una leyenda por defecto; si la tabla necesita un nombre accesible explícito, se pasa un `<caption>` como hijo, como en HTML nativo.",
    },
    {
      aspect: "Datos ausentes",
      value: "texto “—”",
      explanation:
        "Un guion como contenido de la celda se anuncia como texto normal, a diferencia de una celda vacía, que un lector de pantalla anuncia sin contenido y puede confundirse con un error de carga.",
    },
    {
      aspect: "Detalle de fila",
      value: "aria-expanded + aria-controls",
      explanation:
        "El control de apertura es un botón que anuncia si está abierto y apunta a la fila de detalle, que existe en el DOM aun cerrada —con `hidden`— para que `aria-controls` nunca señale un elemento ausente. El detalle es una `<tr>` con una `<td colSpan>`, así que la tabla sigue siendo una tabla válida con filas abiertas.",
    },
    {
      aspect: "Nombre del control de apertura",
      value: "detailLabel",
      explanation:
        "El control no tiene texto propio, así que necesita decir a qué fila pertenece (“Ver detalle de Paula Restrepo”). Repetir “expandir” columna abajo no le dice a un lector de pantalla dónde está parado.",
    },
    {
      aspect: "Selección de filas",
      value: "Checkbox con aria-label",
      explanation:
        "Al no ser una capacidad de Table, la accesibilidad de la columna de selección es la de Checkbox: marcado/desmarcado/indeterminado ya resueltos, con un `aria-label` propio por fila cuando no hay texto visible que la etiquete.",
    },
  ],
};
