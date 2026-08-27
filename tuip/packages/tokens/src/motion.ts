export const motion = {
  duration: {
    fast: "100ms",
    normal: "200ms",
    slow: "300ms",
  },
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    entrance: "cubic-bezier(0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;

/** The two ends of a keyframe pair. Only properties the compositor animates. */
export interface MotionFrames {
  from: Record<string, string>;
  to: Record<string, string>;
}

export interface MotionRecipe {
  frames: MotionFrames;
  /**
   * What plays under `prefers-reduced-motion: reduce`. Omitted when the
   * recipe already moves nothing: an opacity change is not motion, and taking
   * it away would remove the feedback that something opened or closed.
   */
  reduced?: MotionFrames;
  duration: keyof typeof motion.duration;
  easing: keyof typeof motion.easing;
}

const fadeIn: MotionFrames = { from: { opacity: "0" }, to: { opacity: "1" } };
const fadeOut: MotionFrames = { from: { opacity: "1" }, to: { opacity: "0" } };

/**
 * How a surface arrives and leaves. Motion in a working tool confirms that
 * something happened and says where it came from; it does not entertain. Each
 * recipe is named by the kind of surface it moves, and one recipe covers every
 * surface of that kind, so a Modal and a Command Palette cannot arrive
 * differently by accident.
 *
 * - **fade** — the scrim behind a blocking surface, and the exit of anything
 *   whose departure needs no direction.
 * - **panel** — a centred surface (Modal, Command Palette). It settles from
 *   just below and a touch smaller, like a card set down on the desk; the
 *   8px is the `inline` step, far enough to read as arrival, not so far that
 *   it reads as travel.
 * - **float** — an anchored surface (Menu, Popover, Select, Tooltip). It grows
 *   from its anchor, so the eye reads which control it belongs to. The origin
 *   is the anchor's edge, set by whoever positions it.
 * - **slide** — a surface that comes in from a screen edge (Drawer, Toast).
 *   It travels its own width, which is why it is the one recipe on the slow
 *   step: distance, not importance, sets duration.
 *
 * Every exit is faster than its entrance and uses the exit curve: what is
 * leaving should get out of the way. Every reduced-motion path keeps the
 * fade, so opening and closing still register, and drops the travel.
 *
 * `generate-css.ts` writes these as `@keyframes` (with the reduced variants
 * under their media query) and the Tailwind preset exposes each as an
 * `animate-*` utility, so a component names the recipe and never the numbers.
 */
export const motionRecipe = {
  fadeIn: { frames: fadeIn, duration: "normal", easing: "entrance" },
  fadeOut: { frames: fadeOut, duration: "fast", easing: "exit" },
  panelIn: {
    frames: {
      from: { opacity: "0", transform: "translateY(8px) scale(0.98)" },
      to: { opacity: "1", transform: "none" },
    },
    reduced: fadeIn,
    duration: "normal",
    easing: "entrance",
  },
  panelOut: {
    frames: {
      from: { opacity: "1", transform: "none" },
      to: { opacity: "0", transform: "translateY(4px) scale(0.98)" },
    },
    reduced: fadeOut,
    duration: "fast",
    easing: "exit",
  },
  floatIn: {
    frames: {
      from: { opacity: "0", transform: "scale(0.96)" },
      to: { opacity: "1", transform: "none" },
    },
    reduced: fadeIn,
    duration: "fast",
    easing: "entrance",
  },
  floatOut: {
    frames: {
      from: { opacity: "1", transform: "none" },
      to: { opacity: "0", transform: "scale(0.98)" },
    },
    reduced: fadeOut,
    duration: "fast",
    easing: "exit",
  },
  slideInRight: {
    frames: { from: { transform: "translateX(100%)" }, to: { transform: "none" } },
    reduced: fadeIn,
    duration: "slow",
    easing: "entrance",
  },
  slideOutRight: {
    frames: { from: { transform: "none" }, to: { transform: "translateX(100%)" } },
    reduced: fadeOut,
    duration: "normal",
    easing: "exit",
  },
} as const satisfies Record<string, MotionRecipe>;

export type MotionRecipeName = keyof typeof motionRecipe;
