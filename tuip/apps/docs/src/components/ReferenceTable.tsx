import type { ReactNode } from "react";

export interface ReferenceColumn {
  key: string;
  header: string;
  /** Identifiers, types and literal values read as code, so they get the mono face. */
  mono?: boolean;
  /** Relative width, as a CSS grid fraction. Defaults to 1. */
  width?: number;
}

export type ReferenceRow = Record<string, ReactNode>;

/**
 * One table shape for every reference surface on the site — props, CLI
 * commands, accessibility rows, token scales — so a reader learns to read it
 * once. Rendered as a real table: the rows are tabular data, and screen
 * readers announce headers with them.
 */
export function ReferenceTable({
  columns,
  rows,
  caption,
}: {
  columns: ReferenceColumn[];
  rows: ReferenceRow[];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-control border border-neutral-default">
      <table className="w-full border-collapse text-left text-body-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-neutral-subtle">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={{ width: `${((column.width ?? 1) / totalWidth(columns)) * 100}%` }}
                className="px-3.5 py-2.5 text-label font-semibold uppercase tracking-[0.09em] text-neutral-subtle"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              className="border-t border-neutral-default align-top text-neutral-default"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3.5 py-2.5 ${column.mono ? "font-mono text-body-sm" : ""}`}
                >
                  {row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function totalWidth(columns: ReferenceColumn[]): number {
  return columns.reduce((total, column) => total + (column.width ?? 1), 0);
}
