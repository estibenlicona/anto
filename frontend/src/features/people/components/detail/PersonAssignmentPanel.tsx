import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Button, Icon, Link, SegmentedBar } from "@tuya-ui/components";
import { MIX_COLORS } from "@features/squads/components/mixColors";
import type { Criticality } from "@features/squads/services/squadService";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";

// Mismo mapa que el listado y el detalle de Células.
export const criticalityVariant: Record<
  Criticality,
  "danger" | "warning" | "info" | "neutral"
> = {
  Critical: "danger",
  High: "warning",
  Medium: "info",
  Low: "neutral",
};

export interface PersonAssignmentPanelProps {
  detail: PersonDetail;
  onRaise: () => void;
  onMove: () => void;
  onRemove: () => void;
}

function joinNames(names: string[]): string {
  const first = names.map((n) => n.split(" ")[0]);
  if (first.length === 0) return "sin compañeros todavía";
  if (first.length === 1) return `con ${first[0]}`;
  return `con ${first.slice(0, -1).join(", ")} y ${first[first.length - 1]}`;
}

const Signal: React.FC<{
  tone: "success" | "warning";
  title: string;
  detail: string;
}> = ({ tone, title, detail }) => (
  <div
    className={`flex items-center gap-2.5 rounded-control px-3 py-3 ${
      tone === "success" ? "bg-success-subtle" : "bg-warning-subtle"
    }`}
  >
    <Icon
      name={tone === "success" ? "status-success" : "status-warning"}
      size={16}
      className={
        tone === "success" ? "text-success-default" : "text-warning-default"
      }
    />
    <div className="flex flex-col">
      <span className="text-body-sm font-medium text-neutral-default">
        {title}
      </span>
      <span className={SECONDARY_TEXT}>{detail}</span>
    </div>
  </div>
);

/**
 * La única vez que la página muestra la célula, la dedicación y el mix. Las dos
 * señales son lo que el Chapter Lead debe mirar antes de tocar la asignación.
 */
export const PersonAssignmentPanel: React.FC<PersonAssignmentPanelProps> = ({
  detail,
  onRaise,
  onMove,
  onRemove,
}) => {
  const a = detail.allocation;
  if (!a) return null;
  const firstName = detail.person.name.split(" ")[0];
  return (
    <DetailPanel
      title="Asignación"
      subtitle="una persona, una célula"
      right={
        <Link asChild tone="neutral" className="text-body-sm">
          <RouterLink to={`/app/lead/celulas/${a.squadId}`}>
            Ver la célula
          </RouterLink>
        </Link>
      }
      className="flex flex-col gap-4 p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <Link
              asChild
              tone="neutral"
              className="text-heading-sm font-semibold"
            >
              <RouterLink to={`/app/lead/celulas/${a.squadId}`}>
                {a.squadName}
              </RouterLink>
            </Link>
            <Badge dot={false} variant={criticalityVariant[a.squadCriticality]}>
              {a.criticalityLabel}
            </Badge>
          </div>
          <span className={SECONDARY_TEXT}>
            {a.squadTribe} · {joinNames(a.teammates)} · desde el {a.sinceLabel}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-heading-lg font-bold tabular-nums text-neutral-default">
            {a.dedicationPercentage}%
          </span>
          <span className={SECONDARY_TEXT}>de dedicación</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <SegmentedBar
          separated
          total={100}
          segments={[
            { label: "BAU", value: a.bauPercentage, color: MIX_COLORS.bau },
            {
              label: "Transformación",
              value: a.transformationPercentage,
              color: MIX_COLORS.transformation,
            },
          ]}
        />
        <div className={`flex justify-between ${SECONDARY_TEXT}`}>
          <span>
            BAU {a.bauPercentage}% · Transformación {a.transformationPercentage}
            %
          </span>
          <span className="tabular-nums">
            {a.freePercentage}% libre · {a.freeFte.toFixed(1)} FTE
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {a.sfiaGap === "Adequate" ? (
          <Signal
            tone="success"
            title={`SFIA ${detail.sfiaLevel} acorde al requerido`}
            detail={`La célula pide SFIA ${a.requiredSfia} en ${detail.person.position}`}
          />
        ) : (
          <Signal
            tone="warning"
            title={`SFIA ${detail.sfiaLevel} por debajo del requerido`}
            detail={`La célula pide SFIA ${a.requiredSfia} en ${detail.person.position}`}
          />
        )}
        {detail.overReportingStreak >= 2 ? (
          <Signal
            tone="warning"
            title="Reporta más de lo asignado"
            detail={`${detail.overReportingStreak} sprints seguidos por encima del ${a.dedicationPercentage} %`}
          />
        ) : (
          <Signal
            tone="success"
            title="Reporta lo asignado"
            detail={
              detail.sprints.some((s) => s.validated)
                ? `Sus sprints validados van en línea con el ${a.dedicationPercentage} %`
                : `${firstName} todavía no tiene sprints validados`
            }
          />
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-neutral-default pt-3">
        <Button
          variant="secondary"
          size="small"
          onClick={onRaise}
          disabled={a.dedicationPercentage >= 100}
          iconBefore={<Icon name="plus" size={16} />}
        >
          Subir dedicación
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={onMove}
          iconBefore={<Icon name="rebalance" size={16} />}
        >
          Mover a otra célula
        </Button>
        <Button
          variant="subtle"
          size="small"
          onClick={onRemove}
          className="ml-auto"
        >
          Quitar de la célula
        </Button>
      </div>
    </DetailPanel>
  );
};
