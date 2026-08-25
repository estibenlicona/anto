import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Button, Icon, Link } from "@tuya-ui/components";
import { CRITICALITY_LABELS } from "@features/squads/adapters/SquadAdapter";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";
import { criticalityVariant } from "./PersonAssignmentPanel";

export interface PersonUnassignedPanelProps {
  detail: PersonDetail;
  /** "Asignar acá": abre el drawer con esa célula como destino. */
  onAssignTo: (squadId: string) => void;
}

/** Estado vacío de la asignación: la acción dominante es asignar, y dónde. */
export const PersonUnassignedPanel: React.FC<PersonUnassignedPanelProps> = ({
  detail,
  onAssignTo,
}) => {
  const firstName = detail.person.name.split(" ")[0];
  return (
    <DetailPanel
      title="Asignación"
      subtitle="una persona, una célula"
      className="flex flex-col gap-4 p-4"
    >
      <div className="flex items-center gap-3">
        <Icon name="cell" size={24} className="text-neutral-subtle" />
        <div className="flex flex-col gap-0.5">
          <span className="text-body font-semibold text-neutral-default">
            {firstName} no está en ninguna célula
          </span>
          <span className={SECONDARY_TEXT}>
            Disponible desde el alta ({detail.tenureLabel} en el chapter). Al
            asignarla se define dedicación y reparto BAU / Transformación.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-label text-neutral-subtle">
          DÓNDE HACE FALTA {detail.person.position.toUpperCase()}
        </span>
        {detail.suggestedSquads.length === 0 ? (
          <p className={`py-2 ${SECONDARY_TEXT}`}>
            Ninguna célula pide ese cargo ahora mismo; puedes asignarla igual
            desde el botón de arriba.
          </p>
        ) : (
          <ul className="flex flex-col">
            {detail.suggestedSquads.map((s, index) => (
              <li
                key={s.id}
                className={`flex items-center gap-3 py-2.5 ${
                  index > 0 ? "border-t border-neutral-default" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <Link
                      asChild
                      tone="neutral"
                      className="text-body-sm font-medium"
                    >
                      <RouterLink to={`/app/lead/celulas/${s.id}`}>
                        {s.name}
                      </RouterLink>
                    </Link>
                    <Badge
                      dot={false}
                      variant={criticalityVariant[s.criticality]}
                    >
                      {CRITICALITY_LABELS[s.criticality] ?? s.criticality}
                    </Badge>
                  </span>
                  <span className={SECONDARY_TEXT}>
                    {s.reason} · pide SFIA {s.requiredSfia}
                  </span>
                </div>
                <span className={`tabular-nums ${SECONDARY_TEXT}`}>
                  {s.allocatedFte.toFixed(1)} / {s.teamAvailableFte.toFixed(1)}{" "}
                  FTE
                </span>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => onAssignTo(s.id)}
                  iconBefore={<Icon name="plus" size={16} />}
                >
                  Asignar acá
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DetailPanel>
  );
};
