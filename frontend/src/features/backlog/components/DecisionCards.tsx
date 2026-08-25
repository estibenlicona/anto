import React from "react";
import { OptionCard, OptionCardGroup, Select } from "@tuya-ui/components";
import type {
  BacklogCatalogsDto,
  ClassificationKind,
} from "../services/backlogService";
import type { DecisionErrors, DecisionValues } from "./backlogValidation";

export interface DecisionCardsProps {
  values: DecisionValues;
  errors: DecisionErrors;
  onChange: (values: DecisionValues) => void;
  catalogs: BacklogCatalogsDto | null;
  /** Célula de la persona: limita las iniciativas ofrecidas. */
  squadId: string | null;
  /** Iniciativa sugerida por el mapeo del Epic, para la leyenda. */
  suggestedInitiativeId: string | null;
}

/**
 * La decisión: tres tarjetas excluyentes. Iniciativa y BAU llevan su propio
 * Select dentro; elegir la tarjeta no guarda nada — guarda el pie.
 */
export const DecisionCards: React.FC<DecisionCardsProps> = ({
  values,
  errors,
  onChange,
  catalogs,
  squadId,
  suggestedInitiativeId,
}) => {
  const initiatives = (catalogs?.initiatives ?? []).filter(
    (i) => !squadId || i.squadId === squadId
  );
  const suggested = initiatives.find((i) => i.id === suggestedInitiativeId);

  return (
    <div className="flex flex-col gap-3 px-5 pb-5 pt-4">
      <span className="text-label text-neutral-subtle">
        ¿QUÉ ES ESTE TRABAJO?
      </span>
      <OptionCardGroup
        label="¿Qué es este trabajo?"
        value={values.kind === "" ? undefined : values.kind}
        onValueChange={(kind) =>
          onChange({ ...values, kind: kind as ClassificationKind })
        }
        columns={3}
      >
        <OptionCard
          value="Initiative"
          title="Iniciativa"
          description="Trabajo de una iniciativa activa de la célula."
          shortcut="1"
        >
          <div className="flex flex-col gap-1.5">
            <Select
              label="Iniciativa"
              options={initiatives.map((i) => ({ value: i.id, label: i.name }))}
              value={values.initiativeId || undefined}
              onValueChange={(initiativeId) =>
                onChange({ ...values, kind: "Initiative", initiativeId })
              }
              placeholder="Elegir iniciativa…"
              error={errors.initiativeId}
            />
            {suggested && values.initiativeId === suggested.id && (
              <span className="text-label font-normal tracking-normal text-success-default">
                Sugerida: el Epic está mapeado a esta iniciativa.
              </span>
            )}
          </div>
        </OptionCard>
        <OptionCard
          value="Bau"
          title="BAU"
          description="Operación, soporte o mantenimiento del día a día."
          shortcut="2"
        >
          <Select
            label="Categoría"
            options={(catalogs?.bauCategories ?? []).map((c) => ({
              value: c,
              label: c,
            }))}
            value={values.bauCategory || undefined}
            onValueChange={(bauCategory) =>
              onChange({ ...values, kind: "Bau", bauCategory })
            }
            placeholder="Categoría…"
            hint={errors.bauCategory ? undefined : "9 categorías del catálogo."}
            error={errors.bauCategory}
          />
        </OptionCard>
        <OptionCard
          value="Discard"
          title="Descartar"
          description="No cuenta como FTE: duplicada, técnica, de otro equipo."
          shortcut="3"
        >
          <span className="text-label font-normal tracking-normal text-neutral-subtle">
            Reversible desde Clasificadas.
          </span>
        </OptionCard>
      </OptionCardGroup>
      {errors.kind && (
        <span role="alert" className="text-body-sm text-danger-default">
          {errors.kind}
        </span>
      )}
    </div>
  );
};
