import React from "react";

export const SECONDARY_TEXT =
  "text-label font-normal tracking-normal text-neutral-subtle";

export interface DetailPanelProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Superficie de panel del detalle: encabezado con título, apostilla y acción a la derecha. */
export const DetailPanel: React.FC<DetailPanelProps> = ({
  title,
  subtitle,
  right,
  children,
  className = "",
}) => (
  <section className="overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
    <div className="flex items-center justify-between gap-4 border-b border-neutral-default px-4 py-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-body font-semibold text-neutral-default">
          {title}
        </h2>
        {subtitle && <span className={SECONDARY_TEXT}>{subtitle}</span>}
      </div>
      {right}
    </div>
    <div className={className}>{children}</div>
  </section>
);
