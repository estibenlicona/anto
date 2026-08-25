/**
 * The measurements that shape a screen rather than a component: how tall a
 * control is, how wide a kind of content may grow, what stacks above what, and
 * where the layout changes. They are tokens for the same reason colours are —
 * a `z-index: 9999` in a stylesheet is always a symptom of a layout nobody
 * resolved, and it only appears when the layers were never named.
 */

/** Control heights. Nothing between these three. */
export const controlHeight = {
  /** Inside tables and toolbars. */
  sm: "32px",
  /** The default in forms. */
  md: "40px",
  /** Primary action, and anything meant to be touched. */
  lg: "48px",
} as const;

/**
 * The minimum activable area on touch, regardless of how tall the control
 * looks: a 32px row control still has to be reachable with a thumb.
 */
export const touchTarget = "44px";

/**
 * Maximum widths by kind of content. Reading text stops because past roughly 75
 * characters the eye loses the line; data does not stop, because a table always
 * welcomes the extra width — more room is more visible columns.
 */
export const maxWidth = {
  prose: "680px",
  form: "640px",
  panel: "480px",
  page: "1728px",
} as const;

/** Overlay surface widths, by what the surface is for. */
export const overlayWidth = {
  /** Confirm · short form · compare. Never full screen on desktop. */
  modalSm: "480px",
  modalMd: "640px",
  modalLg: "880px",
  /** Row detail without losing the table behind it. */
  drawerSm: "480px",
  drawerLg: "720px",
  /** Column filters, multi-selects. */
  popoverMin: "280px",
  popoverMax: "360px",
  /** One sentence. If it needs two, it was a popover. */
  tooltip: "240px",
} as const;

/**
 * The application shell every screen of the system shares. The content
 * changes, the frame does not: whoever learns to move around one application
 * moves around all of them.
 */
export const shell = {
  railWidth: "264px",
  /** The rail collapses to icons only below the medium breakpoint. */
  railCollapsedWidth: "68px",
  topBarHeight: "64px",
} as const;

/**
 * Six layers, nothing in between. A component picks the layer it belongs to
 * rather than a number it hopes is high enough.
 */
export const layer = {
  content: "0",
  stickyTableHeader: "10",
  navigation: "100",
  overlay: "400",
  menu: "600",
  notification: "800",
} as const;

/**
 * Where the layout changes. The 1440 range is the width screens are designed
 * for first; 1024 is the minimum the management screens target.
 */
export const breakpoint = {
  sm: "640px",
  md: "1024px",
  lg: "1440px",
  xl: "1920px",
} as const;

/** What changes at each range, for the documentation to render. */
export const breakpointBehaviour: Array<{ range: string; columns: string; changes: string }> = [
  {
    range: "< 640",
    columns: "1",
    changes:
      "Una columna. Navegación en cajón superpuesto. Las tablas se vuelven tarjetas apiladas, sin scroll horizontal.",
  },
  {
    range: "640 – 1023",
    columns: "8",
    changes:
      "Rail colapsado a iconos. Los indicadores en 2×2. Los paneles laterales se superponen en vez de dividir la pantalla.",
  },
  {
    range: "1024 – 1439",
    columns: "12",
    changes: "Layout completo, rail expandido. Es el mínimo para el que se diseñan las pantallas.",
  },
  {
    range: "1440 – 1919",
    columns: "12",
    changes: "Ancho de trabajo objetivo. Todo se diseña primero aquí.",
  },
  {
    range: "≥ 1920",
    columns: "12",
    changes:
      "El contenido se topa en el ancho de página y se centra. Las tablas siguen creciendo: más ancho es más columnas visibles.",
  },
];
