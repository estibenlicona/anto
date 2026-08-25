import React from "react";

export interface StepFrameProps {
  title: string;
  help: string;
  aside?: React.ReactNode;
  footerText?: React.ReactNode;
  actions: React.ReactNode;
  children: React.ReactNode;
}

/** El marco de cada paso: encabezado, contenido y pie con un solo primario. */
export const StepFrame: React.FC<StepFrameProps> = ({
  title,
  help,
  aside,
  footerText,
  actions,
  children,
}) => (
  <section className="flex flex-col overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
    <div className="flex items-end justify-between gap-4 border-b border-neutral-default px-5 py-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-heading-md font-semibold text-neutral-default">
          {title}
        </h2>
        <p className="text-label font-normal tracking-normal text-neutral-subtle">
          {help}
        </p>
      </div>
      {aside && <div className="flex items-center gap-2">{aside}</div>}
    </div>
    {children}
    <div className="flex items-center justify-between gap-3 border-t border-neutral-default bg-neutral-subtlest px-5 py-3.5">
      <span className="text-label font-normal tracking-normal text-neutral-subtle">
        {footerText}
      </span>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  </section>
);
