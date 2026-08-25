import type { AccessibilityRow } from "../content";
import { ReferenceTable, type ReferenceColumn } from "./ReferenceTable";

const COLUMNS: ReferenceColumn[] = [
  { key: "aspect", header: "Aspecto", width: 1.1 },
  { key: "value", header: "Valor", mono: true, width: 1.1 },
  { key: "explanation", header: "Por qué", width: 2 },
];

export function AccessibilityNotesView({ rows }: { rows: AccessibilityRow[] }) {
  return (
    <ReferenceTable
      caption="Comportamiento de accesibilidad del componente"
      columns={COLUMNS}
      rows={rows.map((row) => ({
        aspect: <span className="font-medium">{row.aspect}</span>,
        value: <span className="text-neutral-subtle">{row.value}</span>,
        explanation: row.explanation,
      }))}
    />
  );
}
