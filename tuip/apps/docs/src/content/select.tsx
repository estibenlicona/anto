import { Select } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const SAMPLE_OPTIONS = [
  { value: "backend-platform", label: "Backend Platform" },
  { value: "fraude-tarjetas", label: "Fraude Tarjetas" },
  { value: "canales-digitales", label: "Canales Digitales" },
  { value: "core-bancario", label: "Core Bancario" },
  { value: "experiencia-cliente", label: "Experiencia Cliente" },
  { value: "seguridad", label: "Seguridad" },
  { value: "datos-analitica", label: "Datos y Analítica" },
];

export const selectContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para elegir una opción entre 7 y 20, cuando todas caben en un desplegable sin necesitar búsqueda.",
      "Cuando el valor elegido tiene que quedar visible de forma compacta una vez cerrado el desplegable.",
    ],
    whenNotToUse: [
      "Con 6 opciones o menos: usa un grupo de radios. Se ven todas sin abrir nada, que es más rápido que un clic adicional.",
      "Con más de 20 opciones: usa Combobox. Recorrer una lista larga sin poder filtrar es más lento que escribir dos letras.",
    ],
    pairs: [
      {
        do: "Mostrar el estado de carga dentro del desplegable mientras las opciones llegan del backend.",
        dont: "Dejar el desplegable vacío o deshabilitado sin explicación mientras carga.",
        why: "Un desplegable vacío no distingue \"no hay opciones\" de \"todavía no cargaron\"; el usuario no sabe si esperar o si el campo está roto.",
      },
      {
        do: "Usar el mismo ancho de campo que el resto del formulario, salvo que el dato lo justifique.",
        dont: "Angostar el Select al ancho del texto de la opción más corta.",
        why: "El ancho del campo es una señal del tipo de dato; achicarlo por estética rompe esa lectura para quien recorre el formulario.",
      },
      {
        do: "Usar `hint` para explicar qué implica la elección, y dejar que el error lo desplace cuando el campo está mal.",
        dont: "Apilar la ayuda y el error, o meter la explicación dentro del `placeholder`.",
        why: "Mismas razones que en Input, y el mismo comportamiento: la ayuda y el error comparten lugar, el error tiene prioridad. Los dos controles de formulario se documentan y se comportan igual a propósito.",
      },
      {
        do: "Marcar con `required` y validar en el `onSubmit` del formulario.",
        dont: "Contar con que `required` frene el envío por su cuenta.",
        why: "El trigger de Select es un `<button>`, no un campo de formulario nativo: no existe validación del navegador que se pueda heredar. `required` aporta el asterisco y `aria-required`; frenar el envío es responsabilidad del formulario.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="w-64">
        <Select
          label="Célula"
          required
          placeholder="Seleccionar…"
          options={SAMPLE_OPTIONS}
          hint="Determina a qué tribu se imputa la capacidad."
        />
      </div>
    ),
    partsCaption:
      "trigger cerrado con label asociada (asterisco si es obligatorio), flecha de estado y texto de ayuda",
    partsDescription:
      "El trigger es un campo más: misma altura y radio que Input, con la flecha como única señal de que abre un desplegable en vez de aceptar texto. El desplegable se posiciona con Radix Popper, así que se abre para el lado con espacio disponible.",
    parts: [
      {
        name: "Altura del trigger",
        measure: "size.control.md (por defecto)",
        note: "La misma escala de Button e Input: sm dentro de tablas, md en formularios, lg para la acción principal de la pantalla.",
      },
      {
        name: "Radio",
        measure: "radius.control",
        note: "Es un control, no una superficie: mismo radio que Input y Button.",
      },
      {
        name: "Separación interna del desplegable",
        measure: "space.hug entre opciones, space.inset como relleno del contenedor",
        note: "Las opciones se tocan entre sí porque son una sola lista continua; el contenedor respira con el relleno mayor.",
      },
      {
        name: "Anillo de foco",
        measure: "focusRing",
        note: "El mismo token que todo control del sistema — no lo resuelve Select por su cuenta.",
      },
      {
        name: "Marca de obligatorio",
        measure: "text-danger-default, aria-hidden",
        note: "La misma pieza que en Input, compartida en un módulo interno: el asterisco es decorativo y lo obligatorio viaja en `aria-required` del trigger.",
      },
      {
        name: "Texto de ayuda",
        measure: "text-body-sm text-neutral-subtle",
        note: "Comparte lugar con el mensaje de error, que tiene prioridad cuando existe — igual que en Input.",
      },
    ],
    renderState: (state) => (
      <Select
        label="Célula"
        placeholder="Seleccionar…"
        options={SAMPLE_OPTIONS}
        className={state.className}
        disabled={state.disabled}
      />
    ),
    states: [
      { name: "Reposo" },
      {
        name: "Hover",
        className: "ring-1 ring-border-neutral-bold",
        note: "Aproximado: el hover real depende del navegador sobre el trigger nativo; esta ilustración fuerza un borde equivalente.",
      },
      { name: "Foco", className: "ring-focus ring-border-brand-focus" },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Reposo, hover, foco y deshabilitado — el desplegable abierto se documenta aparte, en Uso",
  },

  accessibility: [
    {
      aspect: "Rol del trigger",
      value: 'role="combobox" aria-expanded aria-controls',
      explanation:
        "Radix Select marca el trigger como combobox del patrón WAI-ARIA de listbox, y anuncia si el desplegable está abierto y a qué lista controla.",
    },
    {
      aspect: "Rol del desplegable",
      value: 'role="listbox"',
      explanation: "El contenedor de opciones se anuncia como lista de selección, no como menú de acciones.",
    },
    {
      aspect: "Rol de cada opción",
      value: 'role="option" aria-selected',
      explanation: "Cada opción anuncia si es la actualmente elegida, sin depender del resaltado visual.",
    },
    {
      aspect: "Teclado",
      value: "↓/↑ recorre, Enter confirma, Escape cierra",
      explanation:
        "El foco nunca sale del trigger: se opera todo el ciclo sin que el mouse sea necesario, y Escape devuelve el foco al trigger en vez de perderlo en la página.",
    },
    {
      aspect: "Estado de carga",
      value: 'texto "Cargando…" dentro del listbox',
      explanation:
        "Se anuncia como parte del contenido del listbox, así que un lector de pantalla lo lee igual que leería una opción — no es un estado silencioso.",
    },
    {
      aspect: "Mensaje de error o ayuda",
      value: "aria-describedby",
      explanation:
        "Apunta al mensaje de error, o al texto de ayuda cuando no hay error — nunca a los dos, igual que en Input.",
    },
    {
      aspect: "Obligatorio",
      value: "aria-required",
      explanation:
        "Se aplica sobre el trigger. Como el trigger es un `<button>` y no un campo nativo, no hay validación del navegador que heredar: frenar el envío queda del lado del formulario.",
    },
  ],
};
