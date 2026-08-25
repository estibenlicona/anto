import { FileInput } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const sampleFile = new File(["contenido de ejemplo"], "informe-anual.pdf", { type: "application/pdf" });

export const fileInputContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para adjuntar un único archivo — un comprobante, un plano, un documento de respaldo.",
      "Cuando arrastrar y soltar es una comodidad razonable, pero nunca la única forma de elegir el archivo.",
    ],
    whenNotToUse: [
      "Para varios archivos a la vez, cada uno con su propio estado: eso es FileUploader.",
      "Cuando hace falta validar tipo o tamaño con un mensaje propio: FileInput no lo resuelve — `accept` solo filtra qué ofrece el selector nativo, no lo que se puede soltar por arrastre.",
    ],
    pairs: [
      {
        do: "Confiar en que Tab, Enter y Espacio ya abren el selector nativo, sin agregar manejo de teclado propio.",
        dont: "Escuchar `keydown` para simular la apertura del selector.",
        why: "El input real dentro de FileInput ya es un control nativo — el navegador resuelve su activación por teclado solo, y duplicarla arriesga desincronizarla del comportamiento nativo.",
      },
      {
        do: "Pasar `value`/`onValueChange` como un campo controlado más.",
        dont: "Buscar un `defaultValue` para dejarlo no controlado.",
        why: "Un navegador no permite precargar un `File` por script — no hay nada que un modo no controlado podría precargar, a diferencia de DateField o Combobox.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <FileInput label="Adjuntar documento" value={sampleFile} onValueChange={() => {}} />,
    partsCaption: "ícono + nombre + tamaño + quitar, sobre una zona de arrastre",
    partsDescription:
      "El componente real, sin réplica: FileInput no es un overlay ni un elemento de posición fija, así que se ilustra tal cual se usa. El estado se fuerza pasando un `File` construido en el momento, sin que la figura dependa de una interacción real.",
    parts: [
      {
        name: "Zona de arrastre",
        measure: "rounded-control, border-dashed border-neutral-default",
        note: "El punteado marca la zona como objetivo de arrastre, sin inventar un token nuevo — es el estilo de borde nativo de Tailwind sobre el color de borde ya establecido.",
      },
      {
        name: "Input real",
        measure: "sr-only, nunca display:none",
        note: "Oculto visualmente pero enfocable — así Tab, Enter y Espacio siguen funcionando sin código propio.",
      },
      {
        name: "Archivo elegido",
        measure: "ícono attach-doc + nombre + tamaño",
        note: "Reemplaza la invitación a elegir un archivo — no se muestran los dos a la vez.",
      },
      {
        name: "Arrastre activo",
        measure: "border-brand-default bg-brand-subtle",
        note: "Se aplica mientras el archivo está sobre la zona, no al soltarlo — es un estado transitorio de arrastre, no del valor elegido.",
      },
    ],
    renderState: (state) => (
      <FileInput
        label="Adjuntar documento"
        value={state.name === "Vacío" ? null : sampleFile}
        onValueChange={() => {}}
        error={state.name === "Con error" ? "El archivo no pudo adjuntarse. Probá de nuevo." : undefined}
      />
    ),
    states: [
      { name: "Vacío", note: "Invitación a elegir o arrastrar un archivo." },
      { name: "Con archivo", note: "Nombre y tamaño visibles, con la opción de quitarlo." },
      { name: "Con error", note: "Borde y mensaje en el rol danger, igual que Input." },
    ],
    statesCaption: "Vacío, con archivo, o con error — nunca dos combinados en el mismo campo",
  },

  accessibility: [
    {
      aspect: "Alternativa al arrastre",
      value: "input nativo enfocable",
      explanation: "Arrastrar es una comodidad sobre un control que ya es completamente operable por teclado — Tab hasta la zona, Enter o Espacio abren el selector del sistema.",
    },
    {
      aspect: "Resultado uniforme",
      value: "mismo estado sin importar el medio",
      explanation: "Elegir un archivo arrastrándolo o por el selector nativo deja a FileInput en el mismo estado — ninguno de los dos caminos tiene una accesibilidad distinta del otro.",
    },
    {
      aspect: "Error",
      value: "aria-invalid + aria-describedby",
      explanation: "Mismo mecanismo que ya usa Input: el mensaje de error queda enlazado al campo, no es solo un párrafo suelto debajo.",
    },
  ],
};
