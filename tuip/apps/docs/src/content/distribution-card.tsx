import { DistributionCard } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const byCriticality = [
  { label: "Crítica", value: 2, heat: "max" as const },
  { label: "Alta", value: 1, heat: "high" as const },
  { label: "Media", value: 1, heat: "mid" as const },
  { label: "Baja", value: 1, heat: "low" as const },
];

export const distributionCardContent: ComponentContent = {
  usage: {
    whenToUse: [
      "En el resumen de un módulo, cuando un total se reparte en pocas categorías y el lector quiere ver la proporción y leer cada cifra: personas por seniority, células por criticidad, FTE entre BAU y Transformación.",
      "Con el vocabulario de color que corresponda al dato: `tone` para una escala ordinal sin gravedad (seniority), `heat` para una ordenada por gravedad (criticidad), `color` para categorías sueltas, `role` sólo si cada segmento afirma un estado.",
      'Con `legend="list"` cuando las categorías son pocas (tres o cuatro): una fila por ítem con un filete entre filas y la cifra al ras derecho, para que el conteo no quede suelto lejos de su etiqueta como pasa en dos columnas.',
      'Con `headline` cuando la card debe abrir con una cifra (61 %, 2 sin respaldo) y la barra es su respaldo, no al revés; va con `legend="inline"` para que la leyenda quede como pie de la barra. Con `action` cuando hay adónde ir a ver el detalle: un Link neutro en la cabecera, en el lugar del total.',
      'Con `footer` cuando hay una lectura derivada que la leyenda no da de un vistazo ("3 de 5 en criticidad alta o crítica"). Una, no varias.',
    ],
    whenNotToUse: [
      "Para una sola cifra con su barra: eso es una card con Progress, no una distribución.",
      "Con más de seis categorías: la leyenda en dos columnas deja de leerse; agrupá o usá una tabla.",
      "Como contenedor de otra cosa: la card es cerrada (rótulo, total, barra, leyenda, pie). Si hace falta más, es otra card.",
    ],
    pairs: [
      {
        do: "Pasar las categorías en cero.",
        dont: 'Filtrarlas para que la barra quede "limpia".',
        why: "La card omite el tramo en cero por sí sola y lo deja en la leyenda: ver un 0 es parte del dato.",
      },
      {
        do: "Usar el mismo vocabulario de color que el resto de la pantalla usa para ese dato.",
        dont: "Elegir `heat` porque se ve más fuerte, para un dato que en la tabla lleva badges por rol.",
        why: "`heat` es una escala de cuánto, no de estado; si la fila dice el estado con `role`, la card dice la proporción con la intensidad, y los dos conviven porque no compiten por el mismo significado.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="w-full max-w-sm">
        <DistributionCard
          title="DISTRIBUCIÓN POR CRITICIDAD"
          total={5}
          totalNoun="células"
          items={byCriticality}
          footer={
            <>
              <span className="font-bold tabular-nums text-neutral-default">3 de 5</span> células en
              criticidad alta o crítica
            </>
          }
        />
      </div>
    ),
    partsCaption: "Rótulo y total · barra · leyenda en dos columnas · pie",
    partsDescription:
      "Una Card con su CardBody en columna. El punto de cada entrada de la leyenda usa la misma clase de relleno que su segmento, así que son el mismo color por construcción; el de intensidad `low` lleva borde para no perderse sobre el blanco. El pie queda pegado al fondo con un filete arriba.",
    parts: [
      {
        name: "Rótulo",
        measure: "text-label · text-neutral-subtle",
        note: "En mayúsculas, como los rótulos de las otras cards de resumen.",
      },
      {
        name: "Total",
        measure: "font-bold · tabular-nums + sustantivo",
        note: "En el slot derecho de la cabecera; lo reemplaza `action` cuando hay una.",
      },
      {
        name: "Headline",
        measure: "text-metric + text-body-sm",
        note: "Opcional, entre el rótulo y la barra: la cifra que manda y de qué es.",
      },
      {
        name: "Barra",
        measure: "SegmentedBar separated",
        note: "Se puede pedir continua con `separated={false}`.",
      },
      {
        name: "Leyenda",
        measure: "grid-cols-2 · gap-x-4 gap-y-2",
        note: 'Punto de 8 px, etiqueta truncable, cifra en negrita. Con `legend="list"`: una columna, filas de py-1.5 separadas por divide-y. Con `legend="inline"`: una fila que envuelve, chips de punto + etiqueta + cifra.',
      },
      {
        name: "Pie",
        measure: "border-t · pt-2 · text-body-sm",
        note: "Opcional; sin él la card termina en la leyenda.",
      },
    ],
    renderState: (state) =>
      state.name === "Con un cero" ? (
        <div className="w-full max-w-sm">
          <DistributionCard
            title="DISTRIBUCIÓN POR CRITICIDAD"
            total={4}
            totalNoun="células"
            items={byCriticality.map((i) => (i.label === "Baja" ? { ...i, value: 0 } : i))}
          />
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <DistributionCard
            title="DISTRIBUCIÓN POR CRITICIDAD"
            total={5}
            totalNoun="células"
            items={byCriticality}
          />
        </div>
      ),
    states: [
      { name: "Normal" },
      {
        name: "Con un cero",
        note: "El tramo desaparece de la barra; la leyenda lo sigue mostrando.",
      },
    ],
    statesCaption: "La card no tiene estados de interacción: muestra un dato",
  },

  accessibility: [
    {
      aspect: "Barra",
      value: "texto oculto por segmento",
      explanation: 'Cada segmento lleva "Etiqueta: valor" oculto, heredado de SegmentedBar.',
    },
    {
      aspect: "Leyenda",
      value: "lista",
      explanation:
        "Es una lista real (`ul`/`li`): etiqueta y cifra se leen en orden, y el punto de color es decorativo (`aria-hidden`).",
    },
  ],
};
