import { Progress, SegmentedBar } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const progressContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Progress: cuando hay un solo valor de avance entre 0 y 100 — capacidad usada, porcentaje completado.",
      "SegmentedBar: cuando el dato es una distribución entre categorías, no un avance hacia una meta — es el gráfico por defecto del sistema para eso.",
      "SegmentedBar con color categórico (`color`, no `role`): cuando las categorías no tienen ningún estado real ni orden entre sí (ej. tipo de contrato, célula) — evita forzarlas a un rol de estado (info/warning/success/danger) que no significa nada para ellas.",
      "SegmentedBar con tono de acento (`tone`): cuando los segmentos son los pasos de una escala ordinal (ej. seniority) — el mismo vocabulario de cuatro matices que usa LevelMeter, para que el mismo paso vista el mismo color en la barra y en el medidor que lo muestra en cualquier otra pantalla.",
      "SegmentedBar con `separated`: cuando los segmentos son categorías independientes que solo comparten un total. Leídos de borde a borde sugieren un continuo que el dato no tiene.",
      "Progress con `tone`: cuando la barra muestra una cantidad que no afirma estado — la utilización de una persona, un avance — y debe hablar en la misma escala de acento que los medidores de la pantalla. Con un tono el relleno nunca pasa a warning ni danger; si el lector tiene que notar un límite, no se usa `tone`.",
      "Progress con `brandFill`: cuando la barra está para mirarse y no para advertir — un tablero decorativo donde el color no tiene que significar nada.",
      "Progress con `warningFrom`: cuando hay que avisar antes del límite (una capacidad al 85 %) o exactamente en él (`warningFrom={100}`: al tope, pero todavía no un error). Sin él la barra es success hasta 100 inclusive.",
      "SegmentedBar con `total`: cuando los segmentos son lo asignado y el resto de la barra es lo libre — el track vacío es el dato, no un hueco. Sin `total` los segmentos reparten el 100 % entre sí.",
      "SegmentedBar con grado de intensidad (`heat`): cuando la distribución se ordena por gravedad (criticidad) y el color resume cuánto de lo que hay es grave — de peligro intenso a marca, marca atenuada y neutro. No afirma el estado de ningún miembro: para eso está `role`.",
      'SegmentedBar con `size="sm"`: dentro de una fila de tabla, a la misma altura que Progress.',
    ],
    whenNotToUse: [
      'Progress para una distribución de varias categorías: eso es SegmentedBar. Progress asume que todo lo que no está "completado" es simplemente lo que falta, no otra categoría con su propio significado.',
      "SegmentedBar con más de cuatro categorías usando `role`: la paleta de roles de estado tiene cuatro colores. Para más categorías, o cuando ninguna es realmente un estado, usar `color` (seis tonos categóricos, el mismo vocabulario de Avatar y Tag) en vez de `role`.",
      "`brandFill` donde el lector tenga que notar que algo se pasó de su límite: con el relleno de marca la barra deja de saturar a danger, así que la señal desaparece justo en el caso que importa.",
      "`separated` cuando los segmentos sí son partes de un mismo todo: separarlos rompe la lectura de proporción sobre el total, que es lo que la barra continua comunica.",
      '`heat` para decir que un elemento está mal: es una escala de cuánto, no un estado. Si un segmento significa "en riesgo", es `role`. Y `tone` cuando la escala sí es ordinal pero no tiene gravedad (seniority): el acento no alarma, la intensidad sí.',
      "`total` con `separated`: las piezas sueltas no tienen track que mostrar el vacío; la lectura de lo libre se pierde.",
    ],
    pairs: [
      {
        do: "Dejar que Progress se sature a danger cuando el valor supera 100.",
        dont: "Recortar el valor a 100 antes de pasarlo, ocultando que algo está sobreasignado.",
        why: "La saturación a danger es la señal — recortar el valor antes esconde exactamente el caso que la barra existe para mostrar (una capacidad sobreasignada).",
      },
      {
        do: "Usar el mismo rol de severidad para la misma categoría en todos los SegmentedBar de la app.",
        dont: "Elegir el rol de cada segmento por lo bien que combina visualmente en esa pantalla en particular.",
        why: '"Mismo orden y mismos colores en toda la app" — el valor de un gráfico por defecto es que se aprende una vez y se reconoce en cualquier pantalla.',
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Progress value={75} label="Capacidad usada" />
        <Progress value={110} label="Backend Platform" />
        <SegmentedBar
          segments={[
            { value: 37, role: "info", label: "Backend Platform" },
            { value: 38, role: "warning", label: "Canales Digitales" },
            { value: 25, role: "success", label: "Core Bancario" },
          ]}
        />
      </div>
    ),
    partsCaption: "Progress normal · Progress sobre 100 · SegmentedBar de tres categorías",
    partsDescription:
      "Progress es una pista con un solo relleno proporcional; SegmentedBar es la misma pista dividida en tantos segmentos como categorías reciba, cada uno con su propio rol de color. Ninguno de los dos anima la transición de valor — reflejan el valor recibido, sin más.",
    parts: [
      {
        name: "Alto de la pista",
        measure: "h-1.5 (Progress) · h-2 (SegmentedBar)",
        note: "Ambos comparten el mismo radio y el mismo fondo de pista.",
      },
      {
        name: "Color normal",
        measure: "bg-success-bold",
        note: "El relleno de Progress bajo 100 usa el mismo tono que la variante success de Badge y Alert.",
      },
      {
        name: "Color de saturación",
        measure: "bg-danger-bold",
        note: "Reemplaza al color normal por completo cuando el valor supera 100 — no se mezclan ambos colores en la misma barra.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Sobre el límite") {
        return <Progress value={110} label="Backend Platform" />;
      }
      return <Progress value={45} label="Capacidad usada" />;
    },
    states: [
      { name: "Normal" },
      { name: "Sobre el límite", note: "Se satura a danger en vez de desbordar el contenedor." },
    ],
    statesCaption:
      "Progress no tiene más estados que estos dos — el color es una función pura del valor",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: 'role="progressbar"',
      explanation:
        "Progress se anuncia con el rol estándar de barra de progreso, junto con `aria-valuenow`/`aria-valuemin`/`aria-valuemax`, sin necesidad de un widget hecho a mano.",
    },
    {
      aspect: "Nombre accesible",
      value: "label",
      explanation:
        'Sin `label`, una tecnología de asistencia anuncia "barra de progreso" sin decir de qué — pasarlo es lo que hace útil el anuncio.',
    },
    {
      aspect: "SegmentedBar",
      value: "texto oculto por segmento",
      explanation:
        'Cada segmento con `label` lleva un texto visualmente oculto ("Backend Platform: 37") para que la distribución no dependa solo de comparar anchos de color a simple vista.',
    },
  ],
};
