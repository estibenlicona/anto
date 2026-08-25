import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const accordionContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para ocultar contenido secundario dentro del flujo de una misma página — un FAQ, un panel de filtros avanzados, el detalle de una fila con muchos campos.",
      "Cuando conviene que la persona vea todos los encabezados de una vez y decida cuál abrir, en vez de navegar a otra pantalla.",
    ],
    whenNotToUse: [
      "Para navegación de la aplicación: un Accordion dentro de Sidebar para representar subsecciones no corresponde — la guía de Sidebar es explícita en que admite un solo nivel, sin acordeones anidados.",
      "Para una decisión que bloquea el flujo hasta que la persona responde: eso es Modal, no contenido que se puede dejar colapsado indefinidamente.",
    ],
    pairs: [
      {
        do: "Usar el modo single (por defecto) cuando las secciones son alternativas entre sí, como un FAQ.",
        dont: "Dejar multiple activado quinientos ítems abiertos a la vez sin motivo — vuelve al Accordion indistinguible de una lista sin colapsar.",
        why: "single fuerza a elegir una sección a la vez, que es el caso de uso más común; multiple es la excepción para cuando de verdad conviene comparar el contenido de varios ítems abiertos.",
      },
      {
        do: "Escribir el encabezado de cada ítem como una pregunta o una etiqueta que anticipa el contenido.",
        dont: "Usar encabezados genéricos como \"Sección 1\", \"Sección 2\".",
        why: "El encabezado es lo único visible antes de expandir: si no anticipa el contenido, la persona tiene que abrir todos los ítems para encontrar el que busca.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Accordion type="single" defaultValue="item-2" className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>¿Qué incluye el plan?</AccordionTrigger>
          <AccordionContent>Acceso a todos los componentes del catálogo y sus actualizaciones.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>¿Cómo se factura?</AccordionTrigger>
          <AccordionContent>Mensualmente, por número de proyectos activos en el workspace.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>¿Puedo cancelar en cualquier momento?</AccordionTrigger>
          <AccordionContent>Sí, sin período de permanencia ni penalidad.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
    partsCaption: "AccordionItem por sección — un encabezado (AccordionTrigger) y su contenido (AccordionContent)",
    partsDescription:
      "Las cuatro partes son un espejo directo de Root, Item, Header+Trigger y Content de Radix. AccordionTrigger monta el Header internamente para que el consumidor no tenga que conocer ese detalle de la primitiva.",
    parts: [
      {
        name: "Divisor entre ítems",
        measure: "border-b border-neutral-default",
        note: "Mismo token que ya usa TabsList para separar la lista de pestañas del contenido.",
      },
      {
        name: "Ícono de estado",
        measure: "chevron-down, rotate-180 en abierto",
        note: "Mismo ícono que ya usan Select y Combobox para su propio affordance de apertura.",
      },
      {
        name: "Espaciado del encabezado",
        measure: "py-3.5",
        note: "Área de toque cómoda sin agrandar el tamaño de texto del encabezado.",
      },
    ],
    renderState: (state) => (
      <Accordion type="single" defaultValue="item-2" className="w-full max-w-md">
        <AccordionItem value="item-1">
          <AccordionTrigger>¿Qué incluye el plan?</AccordionTrigger>
          <AccordionContent>Acceso a todos los componentes del catálogo y sus actualizaciones.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2" disabled={state.disabled}>
          <AccordionTrigger>¿Cómo se factura?</AccordionTrigger>
          <AccordionContent>Mensualmente, por número de proyectos activos en el workspace.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
    states: [
      { name: "Colapsado", note: "\"¿Qué incluye el plan?\" en el diagrama de partes de arriba." },
      { name: "Expandido", note: "\"¿Cómo se factura?\" en el mismo diagrama: ícono rotado, contenido visible." },
      { name: "Deshabilitado", disabled: true, note: "El encabezado no responde a mouse ni teclado." },
    ],
    statesCaption: "Colapsado, expandido y deshabilitado",
  },

  accessibility: [
    {
      aspect: "Patrón",
      value: "encabezado con aria-expanded / aria-controls",
      explanation:
        "Resuelto por @radix-ui/react-accordion: cada encabezado anuncia si su región está expandida y a qué contenido controla, sin roles ARIA agregados a mano.",
    },
    {
      aspect: "Teclado",
      value: "flechas arriba/abajo mueven el foco, Home/End a los extremos",
      explanation:
        "El foco recorre los encabezados sin necesitar Tab entre cada uno, igual que TabsList.",
    },
    {
      aspect: "Modo single",
      value: "cierra el ítem previamente abierto",
      explanation:
        "Al expandir un ítem nuevo en modo single, el que estaba abierto se colapsa automáticamente, así que nunca hay más de una región expandida a la vez.",
    },
    {
      aspect: "Deshabilitado",
      value: "text-neutral-disabled, sin foco",
      explanation:
        "Mismo tratamiento visual de deshabilitado que el resto de los controles del catálogo — Button, TabsTrigger.",
    },
  ],
};
