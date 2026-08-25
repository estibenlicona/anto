import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const tabsContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Para dividir una vista en secciones relacionadas que el usuario alterna sin cambiar de página ni perder contexto.",
      "Cuando conviene mostrar cuántos ítems tiene cada sección antes de entrar — el contador junto a la etiqueta es para eso.",
    ],
    whenNotToUse: [
      "Para más de cinco secciones, o si no entran en una sola fila: a partir de ahí, Tabs deja de comunicar todas las opciones de un vistazo — considerá un Select o una navegación lateral.",
      "Para pasos de un flujo secuencial (como un wizard): Tabs implica que cualquier sección se puede visitar en cualquier orden, no un progreso lineal.",
    ],
    pairs: [
      {
        do: "Mantener el número de pestañas en una sola fila, sin que se envuelvan a una segunda línea.",
        dont: "Dejar que las pestañas se acomoden en dos filas cuando no caben.",
        why: "Dos filas rompen la lectura de \"todas las opciones visibles a la vez\" que hace útil a Tabs frente a un menú desplegable.",
      },
      {
        do: "Usar el contador solo cuando el número ayuda a decidir qué sección abrir primero.",
        dont: "Agregar un contador a pestañas donde la cantidad no importa (como \"Resumen\").",
        why: "Un contador en cada pestaña sin excepción se vuelve ruido visual — es útil justo donde el volumen es parte de la decisión.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <Tabs defaultValue="capacidades">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="capacidades" count={24}>
            Capacidades
          </TabsTrigger>
          <TabsTrigger value="iniciativas" count={7}>
            Iniciativas
          </TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen">
          <p className="text-body-sm text-neutral-subtle">Contenido de Resumen.</p>
        </TabsContent>
        <TabsContent value="capacidades">
          <p className="text-body-sm text-neutral-subtle">Contenido de Capacidades.</p>
        </TabsContent>
        <TabsContent value="iniciativas">
          <p className="text-body-sm text-neutral-subtle">Contenido de Iniciativas.</p>
        </TabsContent>
        <TabsContent value="historial">
          <p className="text-body-sm text-neutral-subtle">Contenido de Historial.</p>
        </TabsContent>
      </Tabs>
    ),
    partsCaption: "lista de pestañas + panel de contenido — un TabsContent por TabsTrigger, unidos por value",
    partsDescription:
      "Las cuatro partes son un espejo directo de Root, List, Trigger y Content de Radix. No hay una prop `tabs: { label, content }[]`: cada TabsContent es JSX de página normal, así que puede llevar cualquier contenido — un formulario, una tabla, un gráfico — sin pasar por una prop de datos.",
    parts: [
      {
        name: "Espaciado entre pestañas",
        measure: "gap-7 (28px)",
        note: "Mismo valor que ilustra la definición; el espacio amplio evita que dos etiquetas cortas se lean como una sola.",
      },
      {
        name: "Indicador de pestaña activa",
        measure: "border-b-2 border-brand-default",
        note: "Mismo tratamiento —línea de marca— que la navegación lateral de la app, para que el eco visual sea intencional.",
      },
      {
        name: "Contador",
        measure: "font-mono, text-label",
        note: "Se distingue tipográficamente de la etiqueta sin depender solo del color.",
      },
    ],
    renderState: (state) => (
      <Tabs defaultValue="capacidades">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="capacidades" disabled={state.disabled}>
            Capacidades
          </TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen">
          <p className="text-body-sm text-neutral-subtle">Contenido de Resumen.</p>
        </TabsContent>
        <TabsContent value="capacidades">
          <p className="text-body-sm text-neutral-subtle">Contenido de Capacidades.</p>
        </TabsContent>
        <TabsContent value="historial">
          <p className="text-body-sm text-neutral-subtle">Contenido de Historial.</p>
        </TabsContent>
      </Tabs>
    ),
    states: [
      { name: "Activa", note: "Ilustrada en el diagrama de partes de arriba (\"Capacidades\")." },
      { name: "Inactiva", note: "\"Resumen\" y \"Historial\" en el mismo diagrama: mismo peso de fuente, sin línea de marca." },
      { name: "Deshabilitada", disabled: true, note: "\"Capacidades\" deshabilitada — no recibe foco ni se puede activar." },
    ],
    statesCaption: "Activa, inactiva y deshabilitada — exactamente una pestaña está activa en todo momento",
  },

  accessibility: [
    {
      aspect: "Patrón",
      value: 'role="tablist" / "tab" / "tabpanel"',
      explanation:
        "Resuelto por @radix-ui/react-tabs: el mismo patrón ARIA completo que Select y Combobox ya adoptan, sin reimplementar roving tabindex a mano.",
    },
    {
      aspect: "Teclado",
      value: "Flechas mueven pestaña activa, Home/End a los extremos",
      explanation:
        "El foco y la pestaña activa se mueven juntos con las flechas, igual que RadioGroup — sin depender de Tab entre cada pestaña.",
    },
    {
      aspect: "Contenido inactivo",
      value: "no se renderiza",
      explanation:
        "TabsContent de una pestaña inactiva no está en el DOM accesible, así que una tecnología de asistencia nunca lo anuncia por error.",
    },
    {
      aspect: "Contador",
      value: "parte del nombre accesible",
      explanation:
        "Al estar dentro de TabsTrigger, el contador se anuncia junto con la etiqueta como un solo nombre accesible, no como un elemento aparte que haya que descubrir.",
    },
  ],
};
