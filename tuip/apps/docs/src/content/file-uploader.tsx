import { FileUploader, type FileUploaderItem } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

const sampleFiles: FileUploaderItem[] = [
  { id: "1", file: new File(["x"], "plano-general.dwg"), status: "uploading", progress: 60 },
  { id: "2", file: new File(["x"], "foto-fachada.jpg"), status: "success" },
  { id: "3", file: new File(["x"], "datos-medicion.csv"), status: "error", errorMessage: "El archivo supera el tamaño permitido." },
];

export const fileUploaderContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para varios archivos a la vez, cuando cada uno necesita mostrar su propio estado — subiendo, listo, con error.",
      "Cuando la subida es real y su progreso viene de la propia lógica de red de quien consume el componente.",
    ],
    whenNotToUse: [
      "Para un único archivo sin necesidad de lista: eso es FileInput, más simple.",
      "Para fabricar un progreso que no existe — FileUploader nunca simula una subida con un temporizador interno; si no hay progreso real que mostrar, no se pasa `status: \"uploading\"`.",
    ],
    pairs: [
      {
        do: "Mantener `files` en el estado de quien consume el componente, actualizando el `status` de cada ítem a medida que la subida real avanza.",
        dont: "Dejar que FileUploader mantenga su propia lista interna.",
        why: "El progreso y el resultado le pertenecen a la subida real, no al componente — FileUploader solo presenta el estado que se le pasa, igual que Alert no decide cuándo desaparecer solo.",
      },
      {
        do: "Usar el mismo `id` de un `FileUploaderItem` para actualizar su `status` a medida que la subida progresa.",
        dont: "Reconstruir la lista completa con un nuevo `id` en cada actualización de progreso.",
        why: "Un `id` estable es lo que le permite a React (y a la región `aria-live` de la lista) tratarlo como la misma fila que cambia, no como una fila nueva que reemplaza a la anterior.",
      },
    ],
  },

  anatomy: {
    renderParts: () => <FileUploader label="Adjuntar archivos" files={sampleFiles} onFilesAdded={() => {}} onFileRemove={() => {}} />,
    partsCaption: "zona de arrastre + una fila por archivo, cada una con su propio estado",
    partsDescription:
      "Componente real, sin réplica — tampoco es un overlay. Las tres filas de ejemplo muestran los tres estados a la vez: uno subiendo con su barra de Progress, uno listo, uno con error y su motivo.",
    parts: [
      {
        name: "Fila",
        measure: "ícono attach-doc + nombre + tamaño",
        note: "La misma estructura para los tres estados — lo que cambia es únicamente lo que sigue al tamaño.",
      },
      {
        name: "Subiendo",
        measure: "Progress reusado, sin reimplementar",
        note: "La misma barra que ya publica el catálogo, con el valor de `progress` de esa fila — ninguna barra propia.",
      },
      {
        name: "Con error",
        measure: "ícono status-error + errorMessage",
        note: "El motivo aparece junto a esa fila únicamente — las demás filas no se enteran de que una falló.",
      },
      {
        name: "Lista",
        measure: "aria-live=\"polite\"",
        note: "Un cambio de estado (subiendo → listo o error) se anuncia solo, sin que la persona haya presionado nada en ese instante.",
      },
    ],
    renderState: (state) => {
      const item: FileUploaderItem =
        state.name === "Listo"
          ? { id: "1", file: new File(["x"], "contrato.pdf"), status: "success" }
          : state.name === "Con error"
            ? { id: "1", file: new File(["x"], "contrato.pdf"), status: "error", errorMessage: "Formato no admitido." }
            : { id: "1", file: new File(["x"], "contrato.pdf"), status: "uploading", progress: 35 };
      return <FileUploader label="Adjuntar archivos" files={[item]} onFilesAdded={() => {}} onFileRemove={() => {}} />;
    },
    states: [
      { name: "Subiendo", note: "Barra de Progress con el valor de esa fila." },
      { name: "Listo", note: "Ícono check, sin barra." },
      { name: "Con error", note: "Ícono status-error y el motivo, sin afectar otras filas." },
    ],
    statesCaption: "El estado vive por fila — una lista real mezcla los tres a la vez",
  },

  accessibility: [
    {
      aspect: "Alternativa al arrastre",
      value: "input nativo enfocable, con multiple",
      explanation: "Mismo mecanismo que FileInput: Tab hasta la zona, Enter o Espacio abren el selector nativo, ya preparado para elegir más de un archivo.",
    },
    {
      aspect: "Cambios de estado anunciados",
      value: "aria-live=\"polite\" en la lista",
      explanation: "Una subida que termina en éxito o error es un cambio de contenido que nadie disparó con una tecla en ese instante — sin la región viva, un lector de pantalla no tendría forma de anunciarlo.",
    },
    {
      aspect: "Un error no interrumpe",
      value: "polite, no assertive",
      explanation: "El error de una fila se anuncia en el turno normal de lectura, no interrumpe lo que la persona esté haciendo — no es una alerta crítica del sistema.",
    },
  ],
};
