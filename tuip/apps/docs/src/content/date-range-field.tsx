import { DateRangeField } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const dateRangeFieldContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para capturar un rango de dos fechas relacionadas entre sí: la duración de un sprint, un período de licencia, una ventana de mantenimiento.",
      "Cuando el inicio y el fin se validan y se leen juntos, como un solo valor.",
    ],
    whenNotToUse: [
      "Para dos fechas independientes entre sí, sin relación de inicio/fin: usa dos DateField separados, uno por cada una.",
      "Para una fecha única: usa DateField, más simple y sin la lógica de par inicio/fin.",
    ],
    pairs: [
      {
        do: "Elegir el segundo extremo del rango sin cerrar el calendario después del primer clic.",
        dont: "Cerrar el popover apenas se elige el día de inicio.",
        why: "Un rango necesita dos selecciones; cerrar tras la primera obliga a reabrir el calendario para completar el rango.",
      },
      {
        do: "Mostrar el rango ya elegido en formato abreviado («28 jul – 8 ago») cuando el campo no está en edición.",
        dont: "Mostrar siempre el ISO de captura (`2026-07-28` → `2026-08-08`), incluso fuera de edición.",
        why: "El ISO es el formato que evita ambigüedad al escribir; una vez elegido, el formato abreviado se lee más rápido y es el que se espera en una vista de solo lectura.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="w-72">
        <DateRangeField label="Rango de sprint" defaultStartValue="2026-07-28" defaultEndValue="2026-08-08" />
      </div>
    ),
    partsCaption: "label · texto de inicio · flecha · texto de fin · botón de calendario, todo dentro de un mismo contenedor",
    partsDescription:
      "Inicio y fin comparten un único contenedor con borde y anillo de foco, separados por una flecha — igual que la definición de diseño lo muestra: un solo campo, no dos campos de fecha pegados. Fuera de edición, ambos textos se reemplazan por el rango en formato abreviado, sin perder el botón de calendario.",
    parts: [
      {
        name: "Separador entre extremos",
        measure: "→, text-neutral-subtle",
        note: "Decorativo (aria-hidden); la relación entre los dos campos ya la da su etiqueta accesible individual.",
      },
      {
        name: "Botón de calendario",
        measure: "h-7 w-7, rounded-control",
        note: "Mismo tratamiento que en DateField; abre el mismo calendario, en modo rango.",
      },
      {
        name: "Extremo del rango en el calendario",
        measure: "bg-brand-bold, text-brand-on-bold",
        note: "Los días de inicio y fin llevan las mismas esquinas redondeadas del lado exterior; los del medio del rango, sin redondeo.",
      },
      {
        name: "Días intermedios del rango",
        measure: "bg-neutral-selected",
        note: "Un tono más sutil que los extremos, para que el par inicio/fin se distinga del resto del rango de un vistazo.",
      },
    ],
    renderState: (state) => (
      <div className="w-64">
        <DateRangeField
          label="Rango de sprint"
          defaultStartValue="2026-07-28"
          defaultEndValue="2026-08-08"
          className={state.className}
          disabled={state.disabled}
          error={state.name === "Error" ? "El fin debe ser posterior al inicio" : undefined}
        />
      </div>
    ),
    states: [
      { name: "Reposo" },
      { name: "Foco", className: "ring-focus ring-border-brand-focus" },
      { name: "Error" },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "El anillo de foco se muestra forzado; en uso real aparece solo con foco por teclado",
  },

  accessibility: [
    {
      aspect: "Elemento de cada extremo",
      value: "<input type=\"text\"> con aria-label propio (\"Inicio del rango\" / \"Fin del rango\")",
      explanation: "Como los dos campos comparten una sola etiqueta visible, cada input necesita su propio nombre accesible para distinguirse al navegar con un lector de pantalla.",
    },
    {
      aspect: "Validez",
      value: "aria-invalid + aria-describedby en ambos extremos",
      explanation: "Se activan en cuanto `error` tiene contenido; el mismo mensaje se asocia a los dos campos, porque el error describe al rango completo.",
    },
    {
      aspect: "Botón de calendario",
      value: "aria-label=\"Abrir calendario\"",
      explanation: "Igual que en DateField: el ícono solo no alcanza como nombre accesible.",
    },
    {
      aspect: "Teclado en el calendario",
      value: "flechas recorren los días, Enter marca inicio y luego fin, Escape cierra",
      explanation: "El modo rango de react-day-picker interpreta la primera confirmación como inicio y la siguiente como fin, sin cerrar el popover entre una y otra; Escape cierra y devuelve el foco al botón que lo abrió.",
    },
    {
      aspect: "Formato de lectura",
      value: "texto plano dentro de un <button>",
      explanation: "Fuera de edición, el rango abreviado sigue siendo interactivo (un botón, no un <span>), así que un lector de pantalla lo anuncia como algo que se puede activar para volver a editarlo.",
    },
  ],
};
