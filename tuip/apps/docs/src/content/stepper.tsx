import { Stepper, StepperStep } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const stepperContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para un flujo con validación entre pasos, donde cada paso depende de que el anterior esté resuelto — una solicitud de ampliación, un alta con aprobación.",
      "Bajo tres pasos alcanza con un formulario simple; por encima de cinco la persona pierde el hilo del flujo y conviene guardar el progreso como borrador.",
    ],
    whenNotToUse: [
      "Para navegación entre secciones sin dependencia entre ellas: eso es Tabs, no Stepper — un paso de un Stepper no tiene sentido si se lo mira aislado del resto.",
      "Como indicador de progreso sin pasos discretos y nombrados: eso es Progress.",
    ],
    pairs: [
      {
        do: "Calcular el `status` de cada `StepperStep` a partir del estado que el propio flujo ya mantiene (`índice < actual` → completado, etc.).",
        dont: "Buscar un prop `currentIndex` en `Stepper` que calcule el estado por vos.",
        why: "Stepper no inspecciona sus `children` para inferir nada — la misma razón por la que Table no ordena sus filas ni Menu reordena su ítem destructivo. El cálculo es una expresión de una línea que el consumidor ya necesita para su propio estado.",
      },
      {
        do: "Dejar como mucho un StepperStep en `current` a la vez.",
        dont: "Marcar dos pasos como `current` simultáneamente.",
        why: "Stepper no lo valida — confía en que quien arma la lista la arme bien, igual que confía en el orden de MenuItem.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Stepper>
        <StepperStep status="completed" step={1} label="Recurso" description="CEL-00842" />
        <StepperStep status="current" step={2} label="Dimensionamiento" description="en curso" />
        <StepperStep status="pending" step={3} label="Aprobación" description="pendiente" />
      </Stepper>
    ),
    partsCaption: "círculo + etiqueta + descripción, conectados por una línea",
    partsDescription:
      "Cada paso es un StepperStep: un círculo cuyo color y contenido dependen de `status`, una etiqueta en negrita y una descripción opcional debajo. La línea que conecta un paso con el siguiente la dibuja el propio paso — desaparece sola después del último, sin que Stepper tenga que saber cuál es.",
    parts: [
      {
        name: "Círculo",
        measure: "h-7 w-7 (28px)",
        note: "Coincide exacto con un paso de la escala de espaciado por defecto de Tailwind — no es un valor arbitrario.",
      },
      {
        name: "Completado",
        measure: "bg-success-bold + ícono check",
        note: "El mismo verde que ya usan los badges y alerts de éxito — ningún tono nuevo para esta sola sección.",
      },
      {
        name: "En curso",
        measure: "bg-brand-bold text-brand-on-bold",
        note: "Exacto el mismo par que ya prueban el botón primario y el día seleccionado del calendario.",
      },
      {
        name: "Pendiente",
        measure: "border-neutral-default, opacity-[.55]",
        note: "La atenuación cubre el círculo y la etiqueta, no la línea de conexión — la línea se ve igual sin importar el estado de los pasos que une.",
      },
    ],
    renderState: (state) => (
      <Stepper>
        <StepperStep status={state.disabled ? "pending" : "current"} step={2} label="Dimensionamiento" description={state.disabled ? "pendiente" : "en curso"} />
      </Stepper>
    ),
    states: [
      { name: "Current", note: "El color distingue el paso activo de uno completado o pendiente." },
      { name: "Pending", disabled: true, note: "Atenuado como grupo — círculo y etiqueta bajan de opacidad juntos." },
    ],
    statesCaption: "El color y la atenuación son las dos señales que distinguen los tres estados",
  },

  accessibility: [
    {
      aspect: "Estructura",
      value: "<ol> / <li>",
      explanation: "Es una secuencia, no una lista sin orden — un lector de pantalla anuncia la posición de cada paso dentro del total.",
    },
    {
      aspect: "Estado completado",
      value: "color + ícono, no solo posición",
      explanation: "El círculo de un paso completado se distingue por el verde y por el ícono de check, no únicamente por estar antes en la secuencia — quien no percibe el color igual identifica el ícono.",
    },
    {
      aspect: "Estado en curso",
      value: "único color reservado para \"activo\"",
      explanation: "bg-brand-bold no se reutiliza para ningún otro estado del componente, así que su presencia es inequívoca.",
    },
  ],
};
