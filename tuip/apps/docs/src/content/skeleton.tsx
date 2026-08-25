import { Skeleton } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const skeletonContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Mientras se espera una respuesta y ya se sabe la forma aproximada del contenido que va a aparecer (una fila de lista, un avatar, un párrafo).",
      "Recién a partir de 300ms de espera. Por debajo de ese umbral, mostrarlo y quitarlo genera un parpadeo que molesta más de lo que ayuda.",
    ],
    whenNotToUse: [
      "Cuando la espera supera los 10 segundos: en ese punto corresponde un mensaje explícito con opción de cancelar, no dejar un skeleton indefinido — un skeleton que nunca termina deja de leerse como \"cargando\" y empieza a leerse como roto.",
      "Cuando ya se sabe que no va a haber contenido: eso es EmptyState, no un Skeleton que nunca se resuelve en datos.",
    ],
    pairs: [
      {
        do: "Dimensionar cada Skeleton para que ocupe el mismo espacio que va a ocupar el contenido real (mismo alto de línea, mismo diámetro de avatar).",
        dont: "Usar un único bloque genérico del tamaño que sea más simple de escribir.",
        why: "La definición es explícita: el skeleton imita la forma real de lo que viene, no un rectángulo genérico — imitar la forma es lo que evita el salto de layout cuando el contenido real reemplaza al skeleton.",
      },
      {
        do: "Armar cada fila de skeleton combinando varias instancias (un círculo + dos líneas), igual que se armaría la fila real.",
        dont: "Esperar una prop que genere la fila completa por sí sola.",
        why: "Skeleton es una sola pieza deliberadamente simple, como Chip o Badge — la composición de filas queda del lado del consumidor, que es quien conoce la forma real del contenido.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full max-w-xs flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-pill" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-2.5 w-3/5" />
            <Skeleton className="h-2.5 w-2/5" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 shrink-0 rounded-pill" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-2.5 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      </div>
    ),
    partsCaption: "una fila de lista armada con tres Skeleton: un círculo y dos líneas",
    partsDescription:
      "Skeleton es una sola pieza sin forma propia: un `<div>` con `animate-pulse` y el radio del sistema por defecto. El círculo del avatar y las líneas de texto del ejemplo son la misma pieza con distinto `className` — nada en el componente distingue un caso del otro.",
    parts: [
      {
        name: "Forma",
        measure: "className (h-*, w-*, rounded-*)",
        note: "Sin valor por defecto de tamaño: cada uso lo define según el contenido real que anticipa.",
      },
      {
        name: "Radio por defecto",
        measure: "rounded-control",
        note: "Se sobreescribe con rounded-pill cuando la pieza imita algo circular, como el avatar de este ejemplo.",
      },
      {
        name: "Color",
        measure: "bg-neutral-subtle",
        note: "Un solo tono neutro, no los dos grises alternados que ilustra la definición — esa alternancia es una variación decorativa del mockup, no una regla del componente.",
      },
      {
        name: "Animación",
        measure: "animate-pulse",
        note: "La misma utilidad que usa cualquier otro parpadeo suave del sistema; no es una animación propia de Skeleton.",
      },
    ],
    renderState: () => (
      <div className="flex w-full max-w-xs items-center gap-4">
        <Skeleton className="h-9 w-9 shrink-0 rounded-pill" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-2.5 w-3/5" />
          <Skeleton className="h-2.5 w-2/5" />
        </div>
      </div>
    ),
    states: [{ name: "Único estado", note: "Skeleton no tiene otro estado — está siempre en pulso, mientras esté montado." }],
    statesCaption: "Skeleton no tiene estados de interacción — desaparece cuando el consumidor deja de montarlo",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<div aria-hidden=\"true\">",
      explanation: "Cada Skeleton está oculto a tecnologías de asistencia: es una pista visual, no información — anunciar cada bloque uno por uno sería ruido, no ayuda.",
    },
    {
      aspect: "Anuncio del estado de carga",
      value: "responsabilidad del consumidor",
      explanation: "Como los Skeleton individuales no se anuncian, el contenedor que los agrupa necesita su propio `aria-busy=\"true\"` (o un texto visualmente oculto tipo \"Cargando…\") para que un lector de pantalla sepa que la sección todavía no tiene contenido final.",
    },
    {
      aspect: "Movimiento",
      value: "animate-pulse",
      explanation: "Es una animación de opacidad, no de posición ni de parpadeo brusco — no dispara los mismos problemas de foto-sensibilidad que una animación de alto contraste.",
    },
  ],
};
