import React from "react";
import type {
  AttentionStep,
  CellState,
  SpanCellView,
} from "../adapters/SpanMatrixAdapter";

interface SpanCellProps {
  cell: SpanCellView;
  /** La celda que tiene el detalle abierto: es la que ancla el popover. */
  active: boolean;
  /**
   * Recibe el propio elemento: el popover de la pantalla se ancla por
   * referencia y no envolviendo la celda. Envolver sólo la activa cambiaría la
   * forma del árbol en esa posición, React remontaría el botón y se llevaría
   * el foco justo cuando el usuario acaba de activarlo con el teclado.
   */
  onActivate: (element: HTMLButtonElement) => void;
}

/**
 * El lado del cuadro. No sale de un token porque no es una medida del sistema
 * de diseño sino de esta matriz: lo suficiente para apuntar con el mouse y para
 * que el color tenga superficie donde leerse, y lo bastante chico para que las
 * habilidades entren sin desplazar la tabla.
 *
 * Empezó en 26 px. Se subió al ver que la fila dejaba un hueco largo entre el
 * nombre y sus cuadros: la tabla se estiraba al ancho disponible y, como las
 * columnas de habilidad estaban fijas, toda la holgura caía en la única
 * columna elástica. Con el cuadro más grande el mapa ocupa ese ancho en vez de
 * dejarlo en blanco, y de paso el color se lee mejor. Es la medida más frágil
 * del diseño: con muchas más habilidades habrá que revisarla.
 */
export const CELL_SIZE = 44;

const SQUARE = { width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` };

const ATTENTION_FILL: Record<AttentionStep, string> = {
  low: "bg-attention-low-fill",
  medium: "bg-attention-medium-fill",
  high: "bg-attention-high-fill",
};

/**
 * Los tres casos que no son brecha, cada uno con su propio aspecto y ninguno
 * con color de la escala de atención. No es coquetería: si "está en orden"
 * llevara color, el mapa tendría color en todas partes y el rojo dejaría de
 * saltar. Los tres se distinguen entre sí porque llevan a acciones distintas
 * —nada, llenar el catálogo, evaluar— y un solo gris los confundiría.
 */
const NEUTRAL_FILL: Record<"met" | "undefined" | "unevaluated", string> = {
  met: "bg-neutral-subtle-pressed",
  undefined: "bg-neutral-canvas border-default border-neutral-default",
  unevaluated:
    "bg-neutral-default border-default border-dashed border-neutral-default",
};

/**
 * El relleno de un cuadro. Exportado para que la leyenda pinte sus muestras
 * con esta misma función: mismo color por construcción y no por parecido, que
 * es lo único que hace que la leyenda siga sirviendo si la escala cambia.
 */
export function cellFillClass(
  state: CellState,
  attention: AttentionStep | null
): string {
  if (state === "gap") return ATTENTION_FILL[attention!];
  return NEUTRAL_FILL[state];
}

/**
 * El id de la región donde vive el detalle. El cuadro lo apunta con
 * `aria-controls` mientras está abierto: el panel aparece lejos, en la columna
 * de apoyo, y sin esa atadura no hay forma de saber qué abrió qué.
 */
export const detailRegionId = "span-cell-detail";

/**
 * Una celda del mapa: un cuadro de color y nada más. El nivel evaluado ya no
 * se lee acá —es el precio declarado del cambio— y vuelve en el detalle, a un
 * clic. Lo que el color dice es cuánto le falta a esa persona para lo que su
 * cargo le pide, que es la única pregunta que la matriz responde ahora.
 */
export const SpanCell: React.FC<SpanCellProps> = ({
  cell,
  active,
  onActivate,
}) => {
  return (
    <button
      type="button"
      onClick={(event) => onActivate(event.currentTarget)}
      // El cuadro no tiene contenido: sin nombre accesible sería un botón
      // vacío, y con nueve por fila, nueve botones vacíos.
      aria-label={cell.description}
      // Sin `aria-haspopup`: el detalle dejó de ser un diálogo flotante y pasó
      // a la columna de apoyo. Anunciar un diálogo que no se abre es peor que
      // no anunciar nada. `aria-expanded` sí queda: el cuadro sigue mostrando
      // y ocultando contenido, y `aria-controls` lo ata a ese contenido.
      aria-expanded={active}
      aria-controls={active ? detailRegionId : undefined}
      style={SQUARE}
      className={[
        "rounded-control transition-transform",
        // El foco se dibuja con el color de foco del sistema y por fuera del
        // cuadro: un aro adentro competiría con el color que la celda usa
        // para decir su estado.
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-[color:var(--color-border-neutral-focus)]",
        "hover:scale-110",
        cellFillClass(cell.state, cell.attention),
      ].join(" ")}
    />
  );
};
