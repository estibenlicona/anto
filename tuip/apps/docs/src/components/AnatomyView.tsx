import type { AnatomyContent } from "../content";
import { Canvas } from "./Canvas";
import { ReferenceTable, type ReferenceColumn } from "./ReferenceTable";

const PART_COLUMNS: ReferenceColumn[] = [
  { key: "name", header: "Parte", width: 1.1 },
  { key: "measure", header: "Medida", mono: true, width: 1.3 },
  { key: "note", header: "Nota", width: 2 },
];

export function AnatomyView({ anatomy }: { anatomy: AnatomyContent }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Canvas caption={anatomy.partsCaption}>{anatomy.renderParts()}</Canvas>
        <p className="max-w-[68ch] leading-relaxed text-neutral-default">
          {anatomy.partsDescription}
        </p>
        <ReferenceTable
          caption="Partes del componente y sus medidas"
          columns={PART_COLUMNS}
          rows={anatomy.parts.map((part) => ({
            name: <span className="font-medium">{part.name}</span>,
            measure: part.measure,
            note: part.note,
          }))}
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-heading-md text-neutral-default">Estados</h3>
        <Canvas caption={anatomy.statesCaption}>
          {anatomy.states.map((state) => (
            // Each tile is the real component with the state forced onto it,
            // so the figure cannot drift from the implementation.
            <div key={state.name} className="flex flex-col items-start gap-2">
              {anatomy.renderState(state)}
              <span className="text-body-sm text-neutral-subtle">{state.name}</span>
            </div>
          ))}
        </Canvas>

        {anatomy.states.some((state) => state.note) && (
          <ul className="flex max-w-[68ch] flex-col gap-1.5 text-body-sm text-neutral-subtle">
            {anatomy.states
              .filter((state) => state.note)
              .map((state) => (
                <li key={state.name}>
                  <span className="font-medium text-neutral-default">{state.name}:</span>{" "}
                  {state.note}
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
