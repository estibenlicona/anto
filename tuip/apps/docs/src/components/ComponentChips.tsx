import { useState } from "react";
import type { ComponentStatus } from "../data/registry";

const STATUS_CLASSES: Record<ComponentStatus, string> = {
  stable: "bg-success-subtle text-success-bold",
  beta: "bg-warning-subtle text-warning-bold",
};

/** The install command, copyable without leaving the page. */
function CommandChip({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center gap-2.5 rounded-control bg-neutral-inverse px-3.5 py-1.5 font-mono text-body-sm text-neutral-inverse">
      <code className="whitespace-pre">{command}</code>
      <button
        type="button"
        onClick={copy}
        // `currentColor` en vez de un token: esta superficie es siempre la
        // opuesta al tema de la página (`bg-neutral-inverse`), así que un trazo
        // que siga el tema (como `border-neutral-soft`) queda con la polaridad
        // invertida. `currentColor` hereda el mismo color que ya usa el texto
        // del botón, que sí se invierte junto con el fondo y por eso siempre
        // contrasta. El modificador de opacidad (`/25`) no compila sobre ningún
        // color de este preset — confirmado en el CSS generado, `.border-current`
        // no tiene variante `/25` — así que la opacidad va como valor arbitrario
        // vía `color-mix`, no como modificador.
        className="border-l border-[color-mix(in_srgb,currentColor_25%,transparent)] pl-2.5 text-neutral-inverse/70 hover:text-neutral-inverse"
      >
        {copied ? "copiado ✓" : "copiar"}
      </button>
    </div>
  );
}

export function ComponentChips({
  command,
  status,
}: {
  command: string;
  status: ComponentStatus | null;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2.5">
      <CommandChip command={command} />
      {status && (
        <span
          className={`rounded-control px-2.5 py-1.5 font-mono text-body-sm ${STATUS_CLASSES[status]}`}
        >
          {status}
        </span>
      )}
    </div>
  );
}
