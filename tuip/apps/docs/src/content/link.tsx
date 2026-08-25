import { Link } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const linkContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para texto que navega a otra dirección: el nombre de una fila que lleva a su detalle, una referencia dentro de un párrafo, un enlace a documentación externa.",
      "Con `tone=\"brand\"` cuando el enlace quiere destacarse — el enlace suelto de un párrafo, de una tarjeta o de un estado vacío, donde el color señala dónde está la salida.",
      "Con `tone=\"neutral\"` cuando el enlace se repite: una columna de una tabla donde cada fila trae uno. Cincuenta enlaces de marca hacia abajo dejan de señalar y tiñen la columna entera.",
    ],
    whenNotToUse: [
      "Para ejecutar una acción sin salir de la página (abrir un modal, enviar un formulario, alternar un panel): eso es `Button`, y si tiene que verse como enlace, `Button variant=\"link\"`.",
      "Para el ítem de una barra de navegación: Sidebar y Navbar traen su propio tratamiento, con estado activo, riel y densidad, que Link no tiene.",
      "Para texto sin destino. Un enlace deshabilitado no existe acá: si no hay adónde ir, es texto.",
    ],
    pairs: [
      {
        do: 'Usar Link para lo que navega y Button variant="link" para lo que ejecuta una acción.',
        dont: "Elegir entre los dos por cómo se ven, ya que ambos se parecen.",
        why: "Lo que navega tiene que ser un ancla y lo que ejecuta tiene que ser un botón: de eso dependen el menú contextual, la apertura en otra pestaña y lo que anuncia un lector de pantalla. La semántica corresponde a lo que hace, no a lo que parece.",
      },
      {
        do: 'Elegir tone="neutral" a sabiendas de que el enlace no se distingue en reposo.',
        dont: 'Usar tone="neutral" como si fuera un gris más discreto del enlace de marca.',
        why: "El tono neutro no baja el énfasis: lo quita. En reposo el texto es indistinguible del que lo rodea y sólo se revela en hover y en foco — y en un dispositivo táctil no hay hover. Es una contrapartida que se acepta a cambio de no teñir una columna entera, no un ajuste de intensidad.",
      },
      {
        do: "Envolver el enlace del router con `asChild`.",
        dont: "Pasarle `href` al Link cuando la app tiene router.",
        why: "Un `href` suelto provoca una recarga completa de la aplicación. Con `asChild` sale un solo ancla, con el estilo del sistema y la navegación del router.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex flex-col gap-4">
        <p className="text-body-sm text-neutral-default">
          Revisá la <Link href="#">capacidad del chapter</Link> antes de asignar el sprint.
        </p>
        <p className="text-body-sm text-neutral-default">
          Revisá la{" "}
          <Link href="#" tone="neutral">
            capacidad del chapter
          </Link>{" "}
          antes de asignar el sprint.
        </p>
      </div>
    ),
    partsCaption: 'tone="brand" · tone="neutral", ambos en reposo',
    partsDescription:
      "Link es un solo elemento: un ancla con su texto. Lo que cambia entre tonos es el color del texto y el del anillo de foco; el subrayado es el mismo en los dos y no aparece hasta que hay hover o foco. En reposo, el segundo enlace de arriba es indistinguible del párrafo que lo contiene — es exactamente lo que el tono neutro hace.",
    parts: [
      {
        name: "Texto",
        measure: "text-brand-default · text-neutral-default",
        note: "El tono elegido. `neutral` toma el color de texto de la superficie, así que hereda la jerarquía de donde esté apoyado.",
      },
      {
        name: "Subrayado",
        measure: "underline-offset-2, sólo en hover y focus-visible",
        note: "En `brand` refuerza un color que ya distingue; en `neutral` es la única señal que existe. Por eso también aparece al enfocar: quien navega con teclado no tiene hover.",
      },
      {
        name: "Anillo de foco",
        measure: "ring-focus · ring-brand-focus-ring / ring-neutral-focus-ring",
        note: "Se deriva del tono. Un anillo de marca alrededor de un enlace neutro reintroduce el color que se pidió quitar.",
      },
    ],
    renderState: (state) => (
      <Link href="#" tone={state.name === "Neutro" ? "neutral" : "brand"} className={state.className}>
        Capacidad del chapter
      </Link>
    ),
    states: [
      { name: "Marca", note: "En reposo: el color lo distingue del texto que lo rodea." },
      {
        name: "Neutro",
        note: "En reposo: indistinguible del texto plano. Pasá el puntero o alcanzalo con Tab para verlo aparecer.",
      },
      {
        name: "Hover",
        className: "underline",
        note: "El subrayado forzado, que es lo que los dos tonos muestran al pasar el puntero.",
      },
    ],
    statesCaption:
      "El estado de foco no se puede forzar con una clase: recorré los ejemplos con Tab para verlo en su tono",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<a>",
      explanation:
        "Siempre un ancla real, también con `asChild`. De ahí salen solos el foco por teclado, el menú contextual, el ctrl+clic para abrir en otra pestaña y el anuncio como enlace — sin que el componente reimplemente ninguno.",
    },
    {
      aspect: 'Contrapartida de tone="neutral"',
      value: "sin señal visual en reposo",
      explanation:
        "Ni color, ni subrayado, ni peso: frente a WCAG es más débil que el caso clásico de «color solo», porque ahí al menos hay una diferencia perceptible. Quien recorre la página con la vista no sabe que ese texto navega hasta ponerle el puntero encima, y en táctil no hay puntero. Elegilo a sabiendas, no por descarte.",
    },
    {
      aspect: "Lo que el tono neutro no pierde",
      value: "foco, semántica y anuncio",
      explanation:
        "El anillo de foco por teclado queda intacto, sigue siendo un ancla, y un lector de pantalla lo anuncia como enlace y lo lista entre los enlaces de la página. Lo que se pierde es el descubrimiento visual, no la vía asistida.",
    },
    {
      aspect: "Subrayado en foco",
      value: "focus-visible:underline",
      explanation:
        "El subrayado no está condicionado sólo a hover: quien llega por teclado ve la misma señal que quien llega con el mouse, en vez de depender únicamente del anillo.",
    },
    {
      aspect: "asChild",
      value: "un único hijo que reenvíe props y ref",
      explanation:
        "Link cede su etiqueta al hijo. Con más de un hijo, o con uno que no reenvíe props ni `ref`, falla de formas poco obvias — y anidar dos anclas rompe el árbol de accesibilidad.",
    },
    {
      aspect: "Estado deshabilitado",
      value: "no existe",
      explanation:
        "Un ancla sin destino no es enfocable ni navegable, que es todo lo que «deshabilitado» significaría. Si no hay adónde ir, mostrá texto en vez de un enlace apagado que promete una navegación que no ocurre.",
    },
  ],
};
