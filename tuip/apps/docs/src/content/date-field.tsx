import { DateField } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const dateFieldContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para capturar una fecha única: un vencimiento, una fecha objetivo, el día de un evento.",
      "Cuando quien completa el formulario puede querer escribir la fecha a mano tan rápido como elegirla en un calendario.",
    ],
    whenNotToUse: [
      "Para un rango de dos fechas: usa DateRangeField, que comparte el mismo calendario pero captura inicio y fin.",
      "Para capturar también una hora: DateField cubre solo fecha, sin selector de hora.",
    ],
    pairs: [
      {
        do: "Aceptar el texto escrito en formato ISO sin exigir que se haya abierto el calendario.",
        dont: "Forzar a abrir el calendario para poder completar el campo.",
        why: "El calendario es una ayuda, no el único camino: quien conoce la fecha de memoria escribe más rápido de lo que tarda en ubicarla en una grilla.",
      },
      {
        do: "Mostrar los días fuera de `minDate`/`maxDate` deshabilitados pero visibles.",
        dont: "Ocultar esos días del calendario.",
        why: "Un día que desaparece no comunica el límite; uno deshabilitado sí, y evita que la persona se pregunte si el calendario está incompleto.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="w-64">
        <DateField label="Fecha objetivo" defaultValue="2026-08-31" />
      </div>
    ),
    partsCaption: "label · campo de texto ISO · botón de calendario — el borde y el foco son del contenedor, no del input",
    partsDescription:
      "El campo de texto y el botón de calendario comparten un único contenedor con borde y anillo de foco: se leen como un solo control, no como dos elementos pegados. El calendario se abre en un popover posicionado con Radix, igual que en Select y Combobox.",
    parts: [
      {
        name: "Padding del campo de texto",
        measure: "px-3 py-2",
        note: "Mismo padding que Input, para que ambos campos se alineen en un formulario mixto.",
      },
      {
        name: "Botón de calendario",
        measure: "h-7 w-7, rounded-control",
        note: "Icono `calendar` de 16px; abre el mismo popover que produce la selección por clic.",
      },
      {
        name: "Borde del contenedor",
        measure: "border-neutral-default",
        note: "Pasa a border-danger-default cuando `error` tiene contenido, igual que Input.",
      },
      {
        name: "Panel del calendario",
        measure: "rounded-control, shadow-md, p-3",
        note: "Mismo tratamiento de superficie que el desplegable de Select y Combobox.",
      },
      {
        name: "Día seleccionado",
        measure: "bg-brand-bold, text-brand-on-bold",
        note: "Mismos tokens que la variante primaria de Button, para que \"elegido\" se lea igual en todo el sistema.",
      },
    ],
    renderState: (state) => (
      <div className="w-56">
        <DateField
          label="Fecha objetivo"
          defaultValue="2026-08-31"
          className={state.className}
          disabled={state.disabled}
          error={state.name === "Error" ? "Formato esperado: YYYY-MM-DD" : undefined}
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
      aspect: "Elemento del campo",
      value: "<input type=\"text\">",
      explanation: "El texto se captura con un input nativo, así que hereda edición, autocompletado e IME del sistema; el calendario nunca es obligatorio para escribir.",
    },
    {
      aspect: "Etiqueta ↔ campo",
      value: "htmlFor / id",
      explanation: "Se asocian con un id generado con `useId`, igual que Input: clic en la etiqueta enfoca el campo de texto.",
    },
    {
      aspect: "Validez",
      value: "aria-invalid + aria-describedby",
      explanation: "Se activan en cuanto `error` tiene contenido; el mensaje se anuncia junto al campo, no como texto suelto.",
    },
    {
      aspect: "Botón de calendario",
      value: "aria-label=\"Abrir calendario\"",
      explanation: "El botón solo contiene un ícono, así que necesita un nombre accesible propio en vez de depender de texto visible.",
    },
    {
      aspect: "Teclado en el calendario",
      value: "flechas recorren los días, Enter confirma, Escape cierra",
      explanation: "react-day-picker expone la grilla como una tabla navegable con foco en un solo día a la vez (roving tabindex); Escape cierra el popover de Radix y devuelve el foco al botón que lo abrió.",
    },
    {
      aspect: "Días fuera de rango",
      value: "aria-disabled",
      explanation: "Los días antes de `minDate` o después de `maxDate` se marcan deshabilitados para tecnologías de asistencia, sin dejar de anunciarse como parte del mes.",
    },
  ],
};
