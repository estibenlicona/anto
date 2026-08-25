import type { ReactNode } from "react";
import type { CalloutTone } from "../components/Callout";
import type { ReferenceColumn, ReferenceRow } from "../components/ReferenceTable";

/**
 * A page is a list of sections, and a section a list of blocks. Keeping the
 * blocks as data (rather than free-form JSX) is what lets the compiler catch a
 * section that was left without content, and what lets every page publish its
 * own index without anyone maintaining that index by hand.
 */
export type DocBlock =
  | { kind: "prose"; text: string }
  | { kind: "code"; label: string; code: string }
  | { kind: "callout"; tone: CalloutTone; title: string; text: string }
  | { kind: "table"; columns: ReferenceColumn[]; rows: ReferenceRow[] }
  | { kind: "split"; items: Array<{ title: string; tone: CalloutTone; text: string }> }
  /** For visualisations that render values, e.g. a colour ramp or a type scale. */
  | { kind: "custom"; render: () => ReactNode };

export interface DocSection {
  id: string;
  label: string;
  blocks: DocBlock[];
}

export interface DocPage {
  title: string;
  lede: string;
  sections: DocSection[];
}
