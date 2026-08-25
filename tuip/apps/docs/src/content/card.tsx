import { Card, CardBody, CardFooter, CardHeader } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const cardContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para agrupar información relacionada que se lee como una unidad: un plan, un registro, un resumen.",
      "Cuando varios bloques equivalentes se muestran juntos y conviene delimitar dónde empieza y termina cada uno.",
    ],
    whenNotToUse: [
      "Para envolver toda una página: la tarjeta pierde sentido si no hay nada de lo que distinguirse.",
      "Para anidar tarjetas dentro de tarjetas: el borde y la sombra repetidos dejan de comunicar jerarquía.",
    ],
    pairs: [
      {
        do: "Usar solo las partes que hacen falta: el cuerpo puede ir sin header ni footer.",
        dont: "Rellenar header o footer con contenido de relleno para “completar” la estructura.",
        why: "Las partes son opcionales por diseño; un header vacío o decorativo agrega ruido visual sin agregar información.",
      },
      {
        do: "Reservar el footer para acciones sobre el contenido de la tarjeta.",
        dont: "Mezclar acciones dentro del cuerpo junto al texto.",
        why: "Mantener las acciones en un lugar predecible permite escanear varias tarjetas sin buscar el botón en cada una.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Card className="w-72">
        <CardHeader>
          <p className="font-medium text-neutral-default">Solicitud CEL-00841</p>
        </CardHeader>
        <CardBody>
          <p className="text-body-sm text-neutral-subtle">
            Medellín · Norte — saldo pendiente de aprobación.
          </p>
        </CardBody>
        <CardFooter>
          <p className="text-body-sm text-neutral-subtle">Actualizado hace 2 h</p>
        </CardFooter>
      </Card>
    ),
    partsCaption: "header · body · footer — las tres comparten px-4 py-3; header y footer añaden su línea divisoria",
    partsDescription:
      "Las tres partes usan el mismo padding, de modo que el contenido queda alineado en una sola columna vertical al recorrer la tarjeta. Header y footer se separan del cuerpo con una línea, no con espacio extra: la tarjeta ya es la unidad, y el espacio adicional la desarmaría.",
    parts: [
      {
        name: "Padding de cada parte",
        measure: "px-4 py-3",
        note: "Idéntico en header, body y footer, lo que alinea su contenido en una misma columna.",
      },
      {
        name: "Contorno",
        measure: "border-neutral-default",
        note: "El trazo neutro estándar, el mismo que usan los demás contenedores con borde del catálogo. Delimita la tarjeta; elevarla es trabajo de la sombra, y son cosas distintas.",
      },
      {
        name: "Divisorias",
        measure: "border-b · border-t, en border-neutral-default",
        note: "El header las lleva abajo y el footer arriba; el cuerpo no lleva ninguna. El mismo trazo que el contorno, para que la tarjeta se lea como una sola pieza y no como una grilla de líneas de distinto peso.",
      },
      {
        name: "Radio",
        measure: "radius.surface",
        note: "Mayor que el de los controles: la tarjeta es contenedor, no control.",
      },
      {
        name: "Superficie",
        measure: "bg-neutral-default + shadow-sm",
        note: "Un paso más clara que el lienzo, que es `subtlest`. La sombra se proyecta desde arriba —más presente abajo que a los costados— así que eleva; delimitar lo hace el contorno.",
      },
    ],
    renderState: (state) => (
      <Card className={`w-56 ${state.className ?? ""}`}>
        <CardBody>
          <p className="text-body-sm text-neutral-default">Solicitud CEL-00841</p>
        </CardBody>
      </Card>
    ),
    states: [
      { name: "Reposo" },
      {
        name: "Interactiva",
        className: "border-neutral-bold",
        note: "Card no define estados propios: no es un control. Este es el borde reforzado que conviene aplicar cuando la tarjeta entera es clicable.",
      },
    ],
    statesCaption:
      "Card no tiene estados de interacción propios — se muestran la superficie en reposo y la variante reforzada para tarjetas clicables",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<div>",
      explanation:
        "Card y sus partes no tienen rol implícito, así que no interfieren con la semántica del contenido que envuelven.",
    },
    {
      aspect: "Foco",
      value: "no lo recibe",
      explanation:
        "La tarjeta no es enfocable: se enfocan los controles que contiene, en el orden en que aparecen en el DOM.",
    },
    {
      aspect: "Región",
      value: "aria-labelledby",
      explanation:
        "Si la tarjeta representa una región navegable, conviene apuntarla al título de su header para que se anuncie con nombre.",
    },
    {
      aspect: "Conjuntos",
      value: "<ul> / <li>",
      explanation:
        "Cuando varias tarjetas forman una lista, envolverlas en marcado de lista hace que se anuncie cuántos elementos hay.",
    },
    {
      aspect: "Borde y sombra",
      value: "solo visuales",
      explanation:
        "No se anuncian, así que la agrupación tiene que quedar clara también por el orden y los encabezados del contenido.",
    },
  ],
};
