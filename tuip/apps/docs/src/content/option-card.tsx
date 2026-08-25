import { OptionCard, OptionCardGroup, Select } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const initiatives = [{ value: "kafka", label: "Kafka Migration" }];

export const optionCardContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Cuando cada opción necesita explicarse en una línea, o trae su propio control (un Select, unos chips) que sólo tiene sentido al elegirla — clasificar una historia como Iniciativa (¿cuál?), BAU (¿qué categoría?) o Descartar.",
      "Cuando la decisión merece espacio: dos a cuatro opciones que el usuario va a tomar muchas veces seguidas y conviene que se lean de un vistazo.",
    ],
    whenNotToUse: [
      "Para opciones de una palabra sin explicación ni contenido propio: RadioGroup, más compacto.",
      "Para dos a cuatro opciones cortas que cambian una vista y caben en una línea: SegmentedControl.",
      "Para filtros: Chip seleccionable o FilterButton; OptionCard es una elección, no un filtro.",
    ],
    pairs: [
      {
        do: "Marcar la elegida con el borde neutro intenso y el radio lleno.",
        dont: "Pintar la tarjeta elegida con el color de marca.",
        why: "La marca es para la acción principal de la pantalla (el botón que confirma); una opción elegida es un estado, no una acción.",
      },
      {
        do: "Poner dentro de la tarjeta sólo el control que aplica a esa opción.",
        dont: "Repetir en cada tarjeta controles que aplican a todas.",
        why: "El contenido interno es lo que justifica una OptionCard frente a un RadioGroup; si no lo hay, sobra la tarjeta.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <OptionCardGroup label="¿Qué es este trabajo?" defaultValue="initiative" columns={3} className="w-[720px]">
        <OptionCard value="initiative" title="Iniciativa" description="Trabajo de una iniciativa activa de la célula." shortcut="1">
          <Select label="Iniciativa" options={initiatives} value="kafka" onValueChange={() => {}} />
        </OptionCard>
        <OptionCard value="bau" title="BAU" description="Operación, soporte o mantenimiento del día a día." shortcut="2" />
        <OptionCard value="discard" title="Descartar" description="No cuenta como FTE." shortcut="3" />
      </OptionCardGroup>
    ),
    partsCaption: "radio + título + atajo · descripción · contenido propio",
    partsDescription:
      "Un `radiogroup` ARIA con un tab stop rotativo, no radios nativos: un `<label>` no puede contener otro control, y la tarjeta tiene que poder llevar un Select. El nodo `radio` es la cabecera y la descripción; el contenido propio queda fuera de él, alcanzable con Tab, y sus teclas no mueven la selección.",
    parts: [
      { name: "Borde elegida", measure: "border-bold border-neutral-bold", note: "El doble de grueso, con el padding compensado (15 px frente a 16): la tarjeta no cambia de tamaño al elegirse." },
      { name: "Radio", measure: "18px", note: "Lleno en `neutral-bold` al elegir; decorativo — el estado lo lleva `aria-checked`." },
      { name: "Atajo", measure: "Kbd sm", note: "Informativo: quién escucha la tecla es el consumidor." },
    ],
    renderState: (state) => (
      <OptionCardGroup
        label="Estado"
        defaultValue={state.name === "Elegida" ? "a" : undefined}
        disabled={state.disabled}
        className="w-64"
      >
        <OptionCard value="a" title="Iniciativa" description="Trabajo de una iniciativa activa." shortcut="1" className={state.className} />
      </OptionCardGroup>
    ),
    states: [
      { name: "Reposo" },
      { name: "Elegida", note: "Borde neutro intenso y radio lleno; nada de marca." },
      { name: "Foco", className: "ring-focus ring-neutral-focus-ring", note: "El anillo real va sobre la cabecera de la tarjeta al navegar con teclado." },
      { name: "Deshabilitada", disabled: true, note: "Las flechas la saltan; el click no la elige." },
    ],
    statesCaption: "Una elegida a lo sumo; la selección nunca viste el color de marca",
  },

  accessibility: [
    {
      aspect: "Grupo",
      value: 'role="radiogroup" + aria-label',
      explanation: "La leyenda del grupo es su nombre accesible; las tarjetas son `role=\"radio\"` con `aria-checked`.",
    },
    {
      aspect: "Teclado",
      value: "tab stop rotativo",
      explanation:
        "Una sola tarjeta tiene `tabIndex=0`; las flechas mueven foco y selección juntos, con vuelta al inicio y saltando las deshabilitadas; Espacio y Enter eligen.",
    },
    {
      aspect: "Contenido propio",
      value: "fuera del nodo radio",
      explanation:
        "Un Select dentro de la tarjeta se alcanza con Tab y sus flechas no cambian la opción elegida: los eventos de teclado no burbujean al grupo.",
    },
  ],
};
