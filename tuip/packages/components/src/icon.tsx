import { SVGAttributes } from "react";
import { iconPaths, type IconName } from "@/icons/paths";

/**
 * The sizes the library admits, each with its intended use. Nothing in
 * between: 18 or 22 blur the 1.5 stroke the icons are drawn with.
 */
export type IconSize = 16 | 20 | 24 | 32;

export interface IconProps extends Omit<SVGAttributes<SVGSVGElement>, "children"> {
  name: IconName;
  /**
   * 16 inside text and compact tables · 20 in buttons and navigation ·
   * 24 headers and empty states · 32 empty-state illustration only.
   */
  size?: IconSize;
  /**
   * The accessible name, for an icon that is the only label of a control.
   * Leave it out for an icon that accompanies text: the icon is then decorative
   * and is hidden, so a screen reader announces the label once, not twice.
   */
  label?: string;
}

/**
 * The SVG is never pasted loose into a screen — it comes from here, so stroke
 * width, caps and joins are applied in one place and cannot drift per icon.
 *
 * The icon inherits `currentColor` from the text it accompanies and never
 * carries a colour of its own. It is also never the sole carrier of meaning:
 * a status always comes with text or a background as well, because roughly
 * one in twelve men cannot tell red from green.
 */
export function Icon({ name, size = 20, label, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
      {...props}
    />
  );
}
