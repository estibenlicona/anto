import type { ReactNode } from "react";

export type CalloutTone = "info" | "warning" | "danger";

/**
 * Tone is carried by the title's wording as much as by the color: the heading
 * has to state the condition on its own, so the block still reads correctly
 * to someone who cannot tell the tones apart.
 */
const TONE_CLASSES: Record<CalloutTone, { container: string; title: string }> = {
  info: {
    container: "bg-discovery-subtle",
    title: "text-discovery-default",
  },
  warning: {
    container: "bg-warning-subtle",
    // The bold step, not the default one: the default warning orange sits at
    // 2.2:1 on its own tint, which is unreadable at this size.
    title: "text-warning-bold",
  },
  danger: {
    container: "bg-danger-subtle",
    title: "text-danger-default",
  },
};

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: CalloutTone;
  title: string;
  children: ReactNode;
}) {
  const classes = TONE_CLASSES[tone];

  return (
    <aside className={`max-w-[68ch] rounded-control px-[18px] py-4 ${classes.container}`}>
      <p className={`text-body-sm font-semibold ${classes.title}`}>{title}</p>
      <div className="mt-1.5 text-body-sm leading-relaxed text-neutral-default">
        {children}
      </div>
    </aside>
  );
}
