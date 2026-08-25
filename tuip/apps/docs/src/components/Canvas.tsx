import type { ReactNode } from "react";

/**
 * A framed stage that separates a live component from the prose around it.
 * The caption names what the example varies, so the reader does not have to
 * infer the point of the arrangement from the pieces alone.
 */
export function Canvas({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <figure className="overflow-hidden rounded-control">
      <div
        className="flex flex-wrap items-center gap-3.5 px-7 py-9"
        style={{
          backgroundImage:
            "radial-gradient(var(--color-border-neutral-default) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      >
        {children}
      </div>
      {caption && (
        <figcaption className="border-t border-neutral-default bg-neutral-subtle px-3.5 py-2.5 text-body-sm text-neutral-subtle">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
