import { Avatar, AvatarGroup, identityColorNames } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const avatarContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para representar a una persona por sus iniciales, en una lista, una tabla o un encabezado.",
      "Para mostrar quiénes son los miembros de un grupo sin ocupar el espacio de listarlos a todos — usa AvatarGroup.",
    ],
    whenNotToUse: [
      "Como botón: Avatar no es interactivo por sí solo. Si necesitás que abra un menú o navegue a un perfil, envolvelo en un control que sí lo sea.",
      "Con una foto de perfil real todavía no soportada: esta versión solo cubre iniciales sobre un color de fondo.",
    ],
    pairs: [
      {
        do: "Calcular las iniciales a partir del nombre completo antes de pasarlas como children.",
        dont: "Pasar el nombre completo como contenido de Avatar.",
        why: "Avatar no trunca ni deriva iniciales por su cuenta — muestra exactamente lo que recibe, así que un nombre completo desborda el círculo.",
      },
      {
        do: "Pasar `label` con el nombre completo cuando las iniciales por sí solas no bastan para identificar a la persona.",
        dont: "Confiar en que las iniciales visibles sean suficientes para tecnologías de asistencia.",
        why: "Dos personas distintas pueden compartir iniciales; el nombre completo en `label` es lo que realmente identifica a alguien.",
      },
      {
        do: "Pasar en `colorId` un identificador inmutable de la persona — su id — y dejar que Avatar derive el color.",
        dont: "Pasar el nombre, el correo o cualquier dato editable, ni asignar el color por índice de fila.",
        why: "El color sirve para reconocer a alguien de un vistazo, y eso sólo funciona si no cambia nunca. Derivarlo de un dato editable lo cambia cuando ese dato se corrige; asignarlo por índice lo cambia al ordenar, filtrar o pasar de página, que es peor todavía.",
      },
      {
        do: "Dejar que el mismo `colorId` viaje a todas las pantallas donde aparece la persona.",
        dont: "Calcular el color en la capa de feature y pasarlo por `color`.",
        why: "El reparto vive en un solo lugar justamente para que dos pantallas no puedan llegar a colores distintos para la misma persona. `color` existe para el caso en que no haya identificador estable a mano, no para reimplementar el reparto afuera.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <div className="flex items-center gap-4">
        <Avatar size="small" colorId="p-1">MG</Avatar>
        <Avatar size="medium" colorId="p-2">JP</Avatar>
        <Avatar size="large" colorId="p-3">LR</Avatar>
        <AvatarGroup max={3}>
          <Avatar label="María González" colorId="p-1">MG</Avatar>
          <Avatar label="Julián Pérez" colorId="p-2">JP</Avatar>
          <Avatar label="Laura Ruiz" colorId="p-3">LR</Avatar>
          <Avatar label="Carlos Mora" colorId="p-4">CM</Avatar>
          <Avatar label="Sofía Vargas">SV</Avatar>
        </AvatarGroup>
      </div>
    ),
    partsCaption: "small · medium · large — y un grupo apilado con overflow",
    partsDescription:
      "Avatar es una sola pieza: un círculo con iniciales. AvatarGroup no fusiona varios Avatar en un componente nuevo — los recibe como children y les agrega la superposición y el borde de separación por fuera, así que sigue siendo el mismo Avatar por dentro.",
    parts: [
      {
        name: "Tamaños",
        measure: "24px · 32px · 40px (h-6 · h-8 · h-10)",
        note: "Los tres comparten el mismo tratamiento tipográfico — solo cambia el diámetro del círculo.",
      },
      {
        name: "Relleno",
        measure: "bg-identity-* + text-identity-* del mismo color",
        note: "Fondo tenue y texto del mismo tono en un paso oscuro — el par que Fluent usa para los avatares de Teams, y de donde salen los 12 colores. En tema oscuro los dos valores intercambian roles, así que el contraste entre iniciales y fondo es el mismo en ambos temas.",
      },
      {
        name: "Reparto del color",
        measure: "colorId → uno de los 12",
        note: "El color se deriva del identificador con un hash estable: la misma persona obtiene siempre el mismo color, en cualquier pantalla y entre sesiones. Con 12 colores dos personas de la misma pantalla pueden coincidir; el color acompaña a las iniciales y al nombre, nunca identifica por sí solo. Sin `colorId` ni `color`, el relleno es neutro.",
      },
      {
        name: "Separación en grupo",
        measure: "bg-neutral-default p-0.5 + -ml-2.5",
        note: "El espacio entre avatares superpuestos es en realidad un anillo del color de fondo de la página, no un borde — así se adapta automáticamente si la página cambia de fondo.",
      },
    ],
    renderState: (state) => {
      if (state.name === "Los 12 colores") {
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {identityColorNames.map((name) => (
              <Avatar key={name} size="medium" color={name} label={name}>
                {name.slice(0, 2).toUpperCase()}
              </Avatar>
            ))}
          </div>
        );
      }
      return (
        <Avatar
          size="medium"
          className={state.className}
          colorId={state.name === "Derivado de colorId" ? "p-1" : undefined}
        >
          {state.name === "Con overflow" ? "+6" : "MG"}
        </Avatar>
      );
    },
    states: [
      { name: "Sin color", note: "Sin `colorId` ni `color`, el relleno es neutro." },
      { name: "Derivado de colorId" },
      {
        name: "Los 12 colores",
        note: "El vocabulario completo. El reparto elige uno de éstos a partir del identificador.",
      },
      { name: "Con overflow", note: "Lo genera AvatarGroup automáticamente al superar `max` — no se construye a mano." },
    ],
    statesCaption: "Avatar no tiene estados de interacción — lo que varía es el color, el tamaño y, dentro de un grupo, si es el indicador de overflow",
  },

  accessibility: [
    {
      aspect: "Nombre accesible",
      value: "label (opcional)",
      explanation:
        "Cuando se pasa, las iniciales visibles se ocultan a tecnologías de asistencia y el nombre completo se anuncia en su lugar — evita que un lector de pantalla deletree \"M G\" en vez de decir el nombre.",
    },
    {
      aspect: "Indicador de overflow",
      value: "label automático",
      explanation:
        "El Avatar de \"+N\" que genera AvatarGroup ya lleva un label (\"N más\"), así que el conteo restante no se pierde para quien no ve el texto \"+N\".",
    },
    {
      aspect: "Interacción",
      value: "no participa",
      explanation:
        "Avatar no es un control: no recibe foco ni responde a teclado. Si necesita ser accionable, se envuelve en un elemento interactivo real.",
    },
  ],
};
