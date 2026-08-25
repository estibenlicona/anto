import { PaginationBar } from "@tuya-ui/components";
import type { ComponentContent } from "./types";

export const paginationBarContent: ComponentContent = {
  usage: {
    whenToUse: [
      "Debajo de cualquier tabla o lista paginada, cuando además del cambio de página hace falta comunicar cuántos resultados hay y dejar elegir cuántos mostrar por página.",
    ],
    whenNotToUse: [
      "Cuando sólo hace falta navegar entre páginas, sin resumen ni tamaño de página — usa Pagination directamente.",
    ],
    pairs: [
      {
        do: "Recalcular `page` en el consumidor cuando cambia `pageSize` (por ejemplo, volver a la página 1).",
        dont: "Esperar que PaginationBar decida qué página mostrar al cambiar el tamaño.",
        why: "PaginationBar sólo notifica el nuevo tamaño — no tiene forma de saber si el consumidor quiere reiniciar la página, mantenerla, o recalcularla de otra forma.",
      },
    ],
  },

  anatomy: {
    renderParts: () => (
      <PaginationBar
        page={1}
        pageCount={2}
        onPageChange={() => {}}
        total={10}
        pageSize={5}
        pageSizeOptions={[5, 10, 25]}
        onPageSizeChange={() => {}}
      />
    ),
    partsCaption: "Resumen a la izquierda, tamaño de página y Pagination a la derecha",
    partsDescription:
      "PaginationBar no reimplementa navegación: pasa page/pageCount/onPageChange directo a Pagination, sin tocarlos. Sólo agrega el resumen calculado y el selector de tamaño.",
    parts: [
      {
        name: "Resumen",
        measure: `"Mostrando X–Y de Z"`,
        note: "Calculado a partir de page, pageSize y total — no es un string que el consumidor arma a mano.",
      },
      {
        name: "Selector de tamaño",
        measure: "Select, size=\"small\"",
        note: "Su label es visualmente oculto (sr-only): en este contexto el propio valor seleccionado ya se lee como \"N por página\".",
      },
    ],
    renderState: (state) => (
      <PaginationBar
        page={1}
        pageCount={state.name === "Una sola página" ? 1 : 2}
        onPageChange={() => {}}
        total={state.name === "Sin resultados" ? 0 : 10}
        pageSize={5}
        pageSizeOptions={[5, 10, 25]}
        onPageSizeChange={() => {}}
        className={state.className}
      />
    ),
    states: [{ name: "Varias páginas" }, { name: "Una sola página" }, { name: "Sin resultados" }],
    statesCaption: "El resumen y el selector se muestran igual en los tres casos — sólo cambia lo que Pagination habilita",
  },

  accessibility: [
    {
      aspect: "Selector de tamaño",
      value: "label asociado, visualmente oculto",
      explanation:
        "Un <label> sr-only apunta al id del Select, así que sigue teniendo nombre accesible aunque no haya texto visible arriba del control.",
    },
    {
      aspect: "Navegación",
      value: "hereda de Pagination",
      explanation:
        "Pagination ya resuelve su propia semántica de navegación (landmark, aria-current, deshabilitado en los extremos) — PaginationBar no la reimplementa ni la altera.",
    },
  ],
};
