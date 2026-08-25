import React from "react";
import {
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@tuya-ui/components";
import {
  levelLabel,
  type PositionExpectationView,
} from "../adapters/SkillsAdapter";
import { SKILL_LEVELS, type SkillLevel } from "../services/skillsService";

interface PositionExpectationsTableProps {
  expectations: PositionExpectationView[];
  disabled: boolean;
  onChange: (position: string, level: SkillLevel | null) => void;
}

/**
 * "Sin definir" necesita un valor propio y no la cadena vacía: el Select
 * reserva la cadena vacía para "nada elegido" y un item con ese valor no se
 * puede seleccionar. Acá sin definir SÍ es una elección.
 */
const UNDEFINED = "none";

/** Un id estable por rol, para poder etiquetar el Select desde afuera. */
function fieldId(position: string): string {
  return `nivel-esperado-${position.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

const options = [
  { value: UNDEFINED, label: "Sin definir" },
  ...SKILL_LEVELS.map((level) => ({
    value: String(level),
    label: `${level} · ${levelLabel(level)}`,
  })),
];

export const PositionExpectationsTable: React.FC<
  PositionExpectationsTableProps
> = ({ expectations, disabled, onChange }) => (
  <div>
    <div className="mb-3 flex flex-wrap items-baseline gap-2">
      <h3 className="text-body font-semibold text-neutral-default">
        Nivel esperado por cargo
      </h3>
      {/*
        Dicho acá y no en un tooltip: es la razón de existir de esta tabla, y
        sin ella el número de al lado parece una etiqueta más.
      */}
      <span className="text-body-sm text-neutral-subtle">
        es lo que convierte un nivel evaluado en brecha
      </span>
    </div>

    <Table density="compact">
      <TableHeader>
        <TableRow>
          <TableHead>Cargo</TableHead>
          <TableHead>Nivel que exige</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expectations.map((expectation) => (
          <TableRow key={expectation.position}>
            <TableCell>{expectation.position}</TableCell>
            <TableCell className="w-64">
              {/*
                El nombre accesible va en un label propio y no en `aria-label`:
                `Select` sólo nombra su disparador desde su prop `label`, que
                acá sería una etiqueta visible repetida en cada fila cuando la
                cabecera y la columna de al lado ya lo dicen.
              */}
              <label
                htmlFor={fieldId(expectation.position)}
                className="sr-only"
              >
                Nivel esperado de {expectation.position}
              </label>
              <Select
                id={fieldId(expectation.position)}
                options={options}
                size="small"
                disabled={disabled}
                value={
                  expectation.level === null
                    ? UNDEFINED
                    : String(expectation.level)
                }
                onValueChange={(value) =>
                  onChange(
                    expectation.position,
                    value === UNDEFINED ? null : (Number(value) as SkillLevel)
                  )
                }
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
