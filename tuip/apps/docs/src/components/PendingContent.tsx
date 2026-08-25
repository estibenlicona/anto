export function PendingContent({ what, componentName }: { what: string; componentName: string }) {
  return (
    <div className="rounded-surface border border-dashed border-neutral-default px-6 py-10 text-center">
      <p className="text-body-sm font-medium text-neutral-default">
        Documentación pendiente: {what}
      </p>
      <p className="mt-1 text-body-sm text-neutral-subtle">
        Todavía no se escribió esta sección para <code className="font-mono">{componentName}</code>.
        Se agrega en <code className="font-mono">apps/docs/src/content/{componentName}.ts</code>.
      </p>
    </div>
  );
}
