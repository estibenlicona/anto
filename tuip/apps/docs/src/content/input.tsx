import { Input } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const inputContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para capturar texto libre y corto en una sola línea: nombre, correo, identificador.",
      "Cuando el valor no se puede elegir de un conjunto conocido de opciones.",
    ],
    whenNotToUse: [
      "Para texto largo de varias líneas: eso necesita un área de texto, que permite ver y editar todo el contenido.",
      "Cuando hay un conjunto acotado de valores válidos: un select o un grupo de radios evita errores de tipeo.",
    ],
    pairs: [
      {
        do: "Pasar siempre `label` con el nombre del campo.",
        dont: "Usar solo `placeholder` como si fuera la etiqueta.",
        why: "El placeholder desaparece al escribir, así que deja de haber referencia de qué se estaba llenando; además muchos lectores de pantalla no lo anuncian como nombre del campo.",
      },
      {
        do: "Mensajes de error que dicen cómo corregir: “El correo debe incluir un @”.",
        dont: "Mensajes que solo declaran el fallo: “Valor inválido”.",
        why: "El mensaje de error es el único lugar donde se explica qué se espera; sin esa información, corregir es prueba y error.",
      },
      {
        do: "Poner en `hint` lo que el campo necesita de entrada: formato, unidad, de dónde sale el valor.",
        dont: "Poner esa misma guía en el `placeholder`, o dejarla como un `<p>` suelto debajo del campo.",
        why: "El placeholder desaparece justo cuando se empieza a escribir, que es cuando la guía hace falta. Un párrafo suelto no queda asociado al campo: `hint` lo enlaza con `aria-describedby`, así que se anuncia junto al nombre del campo.",
      },
      {
        do: "Dejar que el error desplace al `hint` cuando el campo está mal.",
        dont: "Apilar el mensaje de error debajo del texto de ayuda.",
        why: "Con el campo en error, lo que hay que leer es qué corregir, no de dónde sale el valor. Apilar ambos aleja el error del campo y alarga el formulario. El componente ya resuelve esta precedencia: no hace falta ocultar el `hint` a mano.",
      },
      {
        do: "Marcar los campos obligatorios con `required` y validar en el `onSubmit` del formulario.",
        dont: "Esperar que `required` bloquee el envío por sí solo, como haría el atributo nativo.",
        why: "`required` aporta la marca visual y `aria-required`, pero a propósito no setea el atributo nativo: ése le entrega la validación al navegador, que corta el envío con su propio globo antes de que el formulario pueda validar y presentar los errores a su manera.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex w-64 flex-col gap-4">
        <Input
          label="Correo corporativo"
          required
          placeholder="nombre@tuya.com.co"
          hint="Se usa para iniciar sesión."
        />
        <Input type="number" label="FTE disponible" suffix="FTE" defaultValue="1.0" />
      </div>
    ),
    partsCaption:
      "label (con asterisco si es obligatorio) · campo (con celda de adorno opcional) · mensaje o ayuda",
    partsDescription:
      "Las tres partes se apilan en una columna con una separación única, de modo que la etiqueta se lee como perteneciente al campo y no como texto anterior. El mensaje de error ocupa el lugar del texto de ayuda: no se suman, se reemplazan.",
    parts: [
      {
        name: "Separación entre partes",
        measure: "gap-1",
        note: "Une etiqueta, campo y mensaje en un solo bloque visual.",
      },
      {
        name: "Padding del campo",
        measure: "px-3 py-2",
        note: "Fija el alto del control, que crece con el tamaño de texto en vez de recortarlo.",
      },
      {
        name: "Marca de obligatorio",
        measure: "text-danger-default, aria-hidden",
        note: "El asterisco es decorativo: lo obligatorio viaja en `aria-required` del campo, así que un lector de pantalla anuncia “requerido” y no “asterisco”.",
      },
      {
        name: "Celda de adorno",
        measure: "bg-neutral-subtle + border-l / border-r",
        note: "`prefix` y `suffix` se leen como parte del control, no como algo que el usuario escribió: fondo escalonado y un filete que los separa del valor editable.",
      },
      {
        name: "Texto de ayuda",
        measure: "text-body-sm text-neutral-subtle",
        note: "Ocupa el mismo lugar que el mensaje de error, un escalón por debajo suyo en color — cuando hay error, el error lo desplaza.",
      },
      {
        name: "Borde",
        measure: "border-neutral-default",
        note: "Pasa a border-danger-default cuando `error` tiene contenido.",
      },
      {
        name: "Radio",
        measure: "rounded-control",
        note: "El mismo que usa Button, para que campo y acción se lean como un sistema.",
      },
      {
        name: "Anillo de foco",
        measure: "ring-2 ring-border-brand-focus",
        note: "Cambia a ring-border-danger-default en estado de error, de modo que el foco no contradice la validez.",
      },
    ],
    renderState: (state) => (
      <div className="w-56">
        <Input
          label="Correo"
          defaultValue="ana@tuya.com.co"
          className={state.className}
          disabled={state.disabled}
          required={state.name === "Obligatorio"}
          suffix={state.name === "Con adorno" ? "@tuya" : undefined}
          hint={state.name === "Con ayuda" ? "Se usa para iniciar sesión." : undefined}
          error={state.name === "Error" ? "El correo debe incluir un @" : undefined}
        />
      </div>
    ),
    states: [
      { name: "Reposo" },
      { name: "Foco", className: "ring-2 ring-border-brand-focus" },
      { name: "Obligatorio" },
      { name: "Con ayuda" },
      {
        name: "Con adorno",
        note: "El adorno es una celda del control con su propio fondo y filete, no texto dentro del campo.",
      },
      {
        name: "Error",
        note: "Con `hint` presente, el error lo reemplaza en vez de apilarse debajo.",
      },
      { name: "Deshabilitado", disabled: true },
    ],
    statesCaption:
      "El anillo de foco se muestra forzado; en uso real aparece solo con foco por teclado",
  },

  accessibility: [
    {
      aspect: "Elemento",
      value: "<input>",
      explanation:
        "Campo nativo: hereda del sistema toda la edición de texto, el autocompletado y el manejo del IME.",
    },
    {
      aspect: "Etiqueta ↔ campo",
      value: "htmlFor / id",
      explanation:
        "Se asocian mediante un id generado con `useId`, así que hacer clic en la etiqueta enfoca el campo y el lector de pantalla lo anuncia con su nombre.",
    },
    {
      aspect: "Validez",
      value: "aria-invalid",
      explanation: "Se activa en cuanto `error` tiene contenido, sin que haya que pasarlo aparte.",
    },
    {
      aspect: "Mensaje de error o ayuda",
      value: "aria-describedby",
      explanation:
        "Apunta al id del mensaje de error, o al del texto de ayuda cuando no hay error, de modo que se anuncia junto al campo en vez de quedar como texto suelto en la página. Nunca a los dos: en pantalla tampoco conviven.",
    },
    {
      aspect: "Obligatorio",
      value: "aria-required",
      explanation:
        "`required` lo activa y además dibuja el asterisco, que va con `aria-hidden` para que no se anuncie dos veces. A propósito no se aplica el atributo nativo `required`: ése le da la validación al navegador, que bloquea el envío con su propio globo antes de que el formulario pueda validar y mostrar los errores a su manera.",
    },
    {
      aspect: "Teclado",
      value: "Tab",
      explanation: "Lleva el foco al campo con indicador visible; la edición es la nativa del sistema.",
    },
    {
      aspect: "Deshabilitado",
      value: "disabled",
      explanation:
        "Atributo nativo: el campo sale del orden de tabulación y se anuncia como no disponible.",
    },
  ],
};
