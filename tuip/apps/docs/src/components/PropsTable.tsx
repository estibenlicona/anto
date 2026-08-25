import type { RegistryComponentApi } from "../data/registry";
import { ReferenceTable, type ReferenceColumn } from "./ReferenceTable";

const COLUMNS: ReferenceColumn[] = [
  { key: "prop", header: "Prop", mono: true, width: 1.1 },
  { key: "type", header: "Tipo", mono: true, width: 1.1 },
  { key: "default", header: "Por defecto", mono: true, width: 0.8 },
  { key: "description", header: "Descripción", width: 2 },
];

function ApiTable({ api }: { api: RegistryComponentApi }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-heading-md text-neutral-default">
        {api.displayName}
      </h3>
      {api.props.length === 0 ? (
        <p className="text-body-sm text-neutral-subtle">
          No define props propias: se configura únicamente con los atributos nativos del elemento.
        </p>
      ) : (
        <ReferenceTable
          caption={`Props de ${api.displayName}`}
          columns={COLUMNS}
          rows={api.props.map((prop) => ({
            prop: (
              <>
                {prop.name}
                {prop.required && (
                  <span className="ml-1 text-danger-default" title="Requerida">
                    *
                  </span>
                )}
              </>
            ),
            type: <span className="text-brand-default">{prop.type}</span>,
            default: prop.defaultValue ?? "—",
            description: prop.description || "—",
          }))}
        />
      )}
    </div>
  );
}

export function PropsTable({
  api,
  extendsElement,
}: {
  api: RegistryComponentApi[];
  extendsElement: string | null;
}) {
  return (
    <div className="flex flex-col gap-8">
      {api.map((entry) => (
        <ApiTable key={entry.displayName} api={entry} />
      ))}

      {extendsElement && (
        <p className="rounded-control border border-neutral-default bg-neutral-subtle px-4 py-3 text-body-sm text-neutral-subtle">
          La tabla lista solo las props propias del componente. Además acepta todos los atributos
          nativos de <code className="font-mono text-neutral-default">{`<${extendsElement}>`}</code>{" "}
          — entre ellos <code className="font-mono">className</code>,{" "}
          <code className="font-mono">id</code> y los manejadores de eventos — que se aplican al
          elemento raíz.
        </p>
      )}
    </div>
  );
}
