import type { ReactNode } from "react";

export interface DoDontPair {
  /** Recommended application. */
  do: string;
  /** Application to avoid. */
  dont: string;
  /** Why the recommended one is preferable. */
  why: string;
}

export interface UsageGuidance {
  whenToUse: string[];
  whenNotToUse: string[];
  pairs: DoDontPair[];
}

/** One part of the component and the token that fixes its measure. */
export interface AnatomyPart {
  name: string;
  /** Expressed as the token that produces it, so it stays traceable to the source. */
  measure: string;
  note: string;
}

/**
 * How the component looks in one interaction state. The state is forced onto
 * the real component through `className` / `disabled` rather than redrawn, so
 * the illustration cannot drift from the implementation. A state that cannot
 * be forced reliably is shown at rest with `note` explaining that.
 */
export interface AnatomyState {
  name: string;
  className?: string;
  disabled?: boolean;
  note?: string;
}

export interface AnatomyContent {
  /** The component rendered with its parts visible, for the measures figure. */
  renderParts: () => ReactNode;
  partsCaption: string;
  partsDescription: string;
  parts: AnatomyPart[];
  /** Renders the component with the forced state applied. */
  renderState: (state: AnatomyState) => ReactNode;
  states: AnatomyState[];
  statesCaption: string;
}

/**
 * One accessibility concern, the concrete value the component applies for it,
 * and why. Concrete values (the actual ARIA attribute, the measured contrast
 * ratio) are what make the row checkable rather than reassuring.
 */
export interface AccessibilityRow {
  aspect: string;
  value: string;
  explanation: string;
}

export interface ComponentContent {
  usage: UsageGuidance;
  anatomy?: AnatomyContent;
  accessibility: AccessibilityRow[];
}
