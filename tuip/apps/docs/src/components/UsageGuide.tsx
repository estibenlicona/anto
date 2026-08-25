import type { UsageGuidance } from "../content";

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="text-body-sm text-neutral-subtle">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function UsageGuide({ usage }: { usage: UsageGuidance }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <section className="rounded-surface border border-success-default bg-success-subtle p-4">
          <h3 className="mb-2 text-heading-md text-success-bold">Cuándo usarlo</h3>
          <BulletList items={usage.whenToUse} />
        </section>
        <section className="rounded-surface border border-danger-default bg-danger-subtle p-4">
          <h3 className="mb-2 text-heading-md text-danger-bold">Cuándo no usarlo</h3>
          <BulletList items={usage.whenNotToUse} />
        </section>
      </div>

      <section>
        <h3 className="mb-3 text-heading-md text-neutral-default">Recomendaciones</h3>
        <div className="flex flex-col gap-4">
          {usage.pairs.map((pair) => (
            <div
              key={pair.do}
              className="overflow-hidden rounded-surface border border-neutral-default"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2">
                <div className="border-b border-neutral-default p-4 sm:border-b-0 sm:border-r">
                  <p className="mb-1 text-label font-semibold uppercase tracking-wide text-success-bold">
                    Hacé
                  </p>
                  <p className="text-body-sm text-neutral-default">{pair.do}</p>
                </div>
                <div className="p-4">
                  <p className="mb-1 text-label font-semibold uppercase tracking-wide text-danger-bold">
                    Evitá
                  </p>
                  <p className="text-body-sm text-neutral-default">{pair.dont}</p>
                </div>
              </div>
              <p className="border-t border-neutral-default bg-neutral-subtle px-4 py-3 text-body-sm text-neutral-subtle">
                {pair.why}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
