import { Switch } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const switchContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para un ajuste que toma efecto de inmediato al tocarlo — no espera a que se envíe un formulario.",
      "Cuando el estado on/off es el contenido completo de la decisión, sin un tercer valor posible.",
    ],
    whenNotToUse: [
      "Para una opción que se aplica recién al enviar el formulario: usa Checkbox. La diferencia entre ambos no es visual, es de cuándo pasa el efecto.",
      "Para representar una selección que puede quedar parcial: usa Checkbox con indeterminate. Switch no tiene un tercer estado.",
    ],
    pairs: [
      {
        do: "Reservar Switch para ajustes que el usuario espera ver aplicados al instante, como activar notificaciones.",
        dont: "Usar Switch dentro de un formulario que se envía con un botón, junto a otros campos que sí esperan al envío.",
        why: "Mezclar ambos dentro del mismo formulario le hace creer al usuario que todo se aplica junto, cuando el switch ya cambió algo antes de que el resto se guarde.",
      },
      {
        do: "Etiquetar el switch con el estado que representa activarlo, no con una pregunta.",
        dont: "Redactar la etiqueta como pregunta (\"¿Activar notificaciones?\") que no deja claro cuál lado es cuál.",
        why: "Un switch no responde una pregunta, aplica un estado; la etiqueta debe nombrar ese estado para que quede claro qué significa cada posición.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <Switch label="Notificaciones" defaultChecked />,
    partsCaption: "track con thumb desplazado y label asociada",
    partsDescription:
      "El track y el thumb son un único <button role=\"switch\"> de Radix; su posición y color se leen del atributo data-state que Radix ya mantiene, no de un segundo estado que el componente reconstruya.",
    parts: [
      {
        name: "Tamaño del track",
        measure: "1.25rem × 2.25rem (h-5 w-9)",
        note: "Fijo, sin escala small/medium/large: la definición no ilustra más de un tamaño de Switch.",
      },
      {
        name: "Radio",
        measure: "radius.pill",
        note: "Track y thumb comparten la misma forma circular extrema, coherente con el punto de RadioGroup.",
      },
      {
        name: "Recorrido del thumb",
        measure: "translate-x de 0.125rem a 1.125rem",
        note: "El desplazamiento deja el mismo margen a ambos lados del track en cualquiera de los dos estados.",
      },
      {
        name: "Anillo de foco",
        measure: "focusRing",
        note: "Aplicado directamente sobre el track al recibir foco de teclado — no depende de peer porque el track ya es el elemento enfocable.",
      },
      {
        name: "Par de color",
        measure: "bg-neutral-strong (apagado) / bg-brand-bold (encendido) + bg-neutral-default (thumb, fijo)",
        note: "El thumb es blanco en los dos estados; el color de marca aparece solo en el track encendido, nunca en reposo. El gris del track apagado usa el paso `neutral-500` (`neutral-strong`), el único de la escala que llega a 3:1 de contraste contra el thumb.",
      },
    ],
    renderState: (state) => (
      <Switch label="Notificaciones" className={state.className} disabled={state.disabled} />
    ),
    states: [
      { name: "Apagado" },
      { name: "Encendido", note: "Ilustrado en el diagrama de partes de arriba (defaultChecked)." },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption: "Apagado, encendido y deshabilitado",
  },

  accessibility: [
    {
      aspect: "Rol",
      value: 'role="switch"',
      explanation: "Distingue de un checkbox para tecnologías de asistencia: comunica que el cambio tiene efecto inmediato, no que se aplicará al enviar algo.",
    },
    {
      aspect: "Estado",
      value: "aria-checked",
      explanation: "Se actualiza automáticamente con cada cambio de estado, controlado o no controlado, sin código adicional en el componente.",
    },
    {
      aspect: "Teclado",
      value: "Tab enfoca, Espacio y Enter alternan",
      explanation: "Resuelto por @radix-ui/react-switch: el mismo patrón de teclado ya adoptado y verificado para Select y Combobox.",
    },
    {
      aspect: "Etiqueta",
      value: "<label> envolvente con htmlFor",
      explanation: "Un id generado con useId asocia la etiqueta al switch cuando no se pasa uno explícito.",
    },
  ],
};
