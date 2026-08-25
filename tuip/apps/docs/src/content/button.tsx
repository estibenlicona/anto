import { Button } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const buttonContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para disparar una acción dentro de la aplicación: guardar, enviar, confirmar, abrir un diálogo.",
      "Cuando la acción tiene un efecto inmediato y visible para la persona que la ejecuta.",
    ],
    whenNotToUse: [
      "Para navegar a otra página o vista: eso corresponde a un enlace, que el navegador sabe abrir en otra pestaña y anunciar como enlace.",
      "Para alternar un valor de sí/no en un formulario: usa un checkbox o un switch, que comunican su estado.",
    ],
    pairs: [
      {
        do: "Una sola acción primaria por vista, acompañada de acciones secundarias.",
        dont: "Varios botones primarios compitiendo en la misma pantalla.",
        why: "La variante primaria existe para señalar cuál es la acción esperada; repetirla anula esa señal y obliga a leer todo para decidir.",
      },
      {
        do: 'Etiquetas que nombran la acción: "Guardar cambios", "Eliminar cuenta".',
        dont: 'Etiquetas genéricas como "Aceptar" u "OK".',
        why: "El texto del botón suele leerse fuera de contexto, sobre todo con lector de pantalla; nombrar la acción evita tener que reconstruir de qué se trata.",
      },
      {
        do: "Reservar la variante destructiva para acciones que no se pueden deshacer.",
        dont: "Usarla para cualquier acción que se quiera destacar.",
        why: "El rojo es la señal de riesgo del sistema; gastarla en acciones inocuas hace que deje de leerse como advertencia cuando realmente importa.",
      },
      {
        do: "Poner el botón en estado de carga mientras la acción está en curso.",
        dont: "Dejarlo activo y confiar en que nadie va a hacer doble clic.",
        why: "El estado de carga bloquea el reenvío y, al anunciarse como ocupado, informa que ya pasó algo — sin él la única señal es que no se ve nada y se vuelve a intentar.",
      },
      {
        do: "Pasar `aria-label` cuando el botón es solo un ícono.",
        dont: "Confiar en que el ícono se entiende por sí solo.",
        why: "El ícono no genera nombre accesible: sin etiqueta, un lector de pantalla anuncia un botón sin nombre y la acción queda inaccesible.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <>
        <Button size="small">Guardar</Button>
        <Button size="medium">Guardar</Button>
        <Button size="large">Guardar</Button>
      </>
    ),
    partsCaption: "size: small · medium · large — el alto lo fija el padding vertical, no una altura fija",
    partsDescription:
      "El ancho lo define el contenido: el botón no reserva un ancho mínimo. El alto sale del padding vertical de cada tamaño, de modo que un cambio de escala tipográfica lo acompaña en vez de recortarlo. Los íconos van dentro del mismo flujo, separados por el gap del tamaño.",
    parts: [
      {
        name: "Padding horizontal",
        measure: "px-3 · px-4 · px-5",
        note: "Uno por tamaño (small, medium, large). Es lo que da el ancho mínimo del control.",
      },
      {
        name: "Padding vertical",
        measure: "py-1 · py-2 · py-2.5",
        note: "Define el alto. No hay altura fija, así que el control crece con su texto.",
      },
      {
        name: "Separación ícono–texto",
        measure: "gap-1.5 · gap-2 · gap-2",
        note: "El ícono precede o sigue a la etiqueta dentro del mismo flex.",
      },
      {
        name: "Radio",
        measure: "rounded-control",
        note: "El mismo radio en los tres tamaños; no escala con el control.",
      },
      {
        name: "Borde",
        measure: "border (1px), en las cinco variantes",
        note: "Sólo `secondary` lo muestra, en el trazo translúcido del sistema: insinúa su zona activa sin el peso de un trazo opaco. Las otras cuatro lo llevan transparente, para ocupar la misma caja y no quedar 2px más bajas al lado de ella.",
      },
      {
        name: "Anillo de foco",
        measure: "ring-3, sin offset",
        note: "Se apoya en el borde, sin franja intermedia, y toma un tono translúcido del color base de su variante: el foco se lee como el propio control encendido.",
      },
    ],
    renderState: (state) => (
      <Button className={state.className} disabled={state.disabled}>
        Aprobar
      </Button>
    ),
    states: [
      { name: "Reposo" },
      { name: "Hover", className: "bg-brand-bold-hover" },
      { name: "Activo", className: "bg-brand-bold-pressed" },
      {
        name: "Foco",
        className: "ring-focus ring-brand-focus-ring",
        note: "Forzado; en uso real aparece solo con foco por teclado (focus-visible).",
      },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption:
      "Cada pieza es el componente real con su estado forzado, no una reproducción — si el componente cambia, esta figura cambia con él",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<button>",
      explanation:
        "Renderiza un botón nativo, así que expone el rol `button` y la activación por teclado sin atributos adicionales.",
    },
    {
      aspect: "Teclado",
      value: "Tab · Enter · Espacio",
      explanation:
        "Tab lleva el foco en orden de DOM; Enter y Espacio activan, por comportamiento nativo del elemento.",
    },
    {
      aspect: "Foco",
      value: "ring-3, sin offset",
      explanation:
        "Se aplica con `focus-visible`, de modo que aparece al navegar con teclado y no al hacer clic. Nunca se suprime con outline:none sin reemplazo.",
    },
    {
      aspect: "Deshabilitado",
      value: "disabled",
      explanation:
        "Usa el atributo nativo: el botón sale del orden de tabulación y se anuncia como no disponible.",
    },
    {
      aspect: "En curso",
      value: "aria-busy=\"true\"",
      explanation:
        "`isLoading` aplica `aria-busy` y deshabilita el control, así la acción no puede dispararse dos veces y el lector de pantalla anuncia que ya está en marcha.",
    },
    {
      aspect: "Íconos",
      value: "aria-hidden=\"true\"",
      explanation:
        "`iconBefore` e `iconAfter` son decoración de una etiqueta que ya nombra la acción, así que se ocultan de la tecnología asistiva.",
    },
    {
      aspect: "Nombre accesible",
      value: "contenido del botón",
      explanation:
        "Si el botón solo lleva ícono, hay que pasar `aria-label`: sin él se anuncia como un botón sin nombre.",
    },
  ],
};
