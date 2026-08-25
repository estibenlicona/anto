import type { ComponentType } from "react";

/**
 * Every example file under `examples/<component>/` exports this as `meta`
 * plus the example component itself as its default export. The file is both
 * executed (for the live render) and read as raw text (for the snippet), so
 * the two can never drift apart.
 */
export interface ExampleMeta {
  title: string;
  description?: string;
  /** Names what varies between the pieces on the canvas, shown as its caption. */
  caption?: string;
}

export interface ExampleModule {
  meta: ExampleMeta;
  default: ComponentType;
}

export interface LoadedExample {
  /** Stable id derived from the file name, e.g. "01-variantes". */
  id: string;
  meta: ExampleMeta;
  Component: ComponentType;
  /** File source with the `meta` export removed — scaffolding, not part of the example. */
  source: string;
}
