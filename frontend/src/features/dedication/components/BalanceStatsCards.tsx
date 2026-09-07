import React from "react";
import {
  Avatar,
  AvatarGroup,
  Card,
  CardBody,
  Icon,
  Skeleton,
  type IconName,
} from "@tuya-ui/components";
import { getPersonInitials } from "@features/people/adapters/PersonAdapter";
import type { CollaboratorDedicationSummaryDto } from "../services/dedicationService";

export interface BalanceStatsCardsProps {
  /** `null` mientras llega la primera respuesta: se dibuja el hueco, no se salta. */
  summary: CollaboratorDedicationSummaryDto | null;
}

const SAMPLE = 3;

/**
 * El punto de color delante del rótulo enseña el vocabulario en la primera
 * pasada: es el mismo rol con el que la fila pinta su icono y su barra.
 */
const CardTitle: React.FC<{
  children: React.ReactNode;
  icon: IconName;
  dot: string;
}> = ({ children, icon, dot }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`size-1.5 shrink-0 rounded-pill ${dot}`}
      />
      <span className="text-label text-neutral-subtle">{children}</span>
    </span>
    <Icon name={icon} size={16} className="text-neutral-subtle" />
  </div>
);

/** Quiénes son, con avatar: hasta tres y el resto contado. */
const People: React.FC<{
  people: Array<{ id: string; name: string }>;
  emptyLabel: string;
}> = ({ people, emptyLabel }) => {
  if (people.length === 0) {
    return (
      <span className="text-body-sm text-neutral-subtle">{emptyLabel}</span>
    );
  }
  const shown = people.slice(0, SAMPLE);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center gap-2">
      <AvatarGroup max={shown.length}>
        {shown.map((p) => (
          <Avatar key={p.id} size="small" label={p.name} colorId={p.id}>
            {getPersonInitials(p.name)}
          </Avatar>
        ))}
      </AvatarGroup>
      <span className="truncate text-body-sm text-neutral-subtle">
        {shown.map((p) => p.name).join(", ")}
        {extra > 0 ? ` +${extra} más` : ""}
      </span>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <Card>
    <CardBody className="flex h-full flex-col gap-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="mt-auto h-6 w-48" />
    </CardBody>
  </Card>
);

/**
 * Un indicador por señal del sprint elegido sobre los colaboradores a cargo.
 * Los cuatro enseñan el vocabulario en la primera pasada —cuatro estados
 * siguen siendo algo que hay que aprender— y describen el chapter, **no el
 * filtro** de la tabla: cambiar el filtro no cambia lo que hay en el sprint.
 */
export const BalanceStatsCards: React.FC<BalanceStatsCardsProps> = ({
  summary,
}) => {
  const grid = "grid gap-3 sm:grid-cols-2 xl:grid-cols-4";
  if (!summary) {
    return (
      <div className={grid} aria-busy="true">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  // Por qué no se pudo evaluar a cada quien: sin el desglose, el indicador
  // sólo dice "faltan datos" y no dice cuáles ni de quién dependen.
  const reasons = [
    { label: "sin identidad", value: summary.noIdentity },
    { label: "sin sprint", value: summary.noSprint },
    { label: "histórico insuficiente", value: summary.insufficientHistory },
  ].filter((r) => r.value > 0);

  return (
    <div className={grid}>
      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <CardTitle icon="trend-up" dot="bg-danger-bold">
            POSIBLE SOBREASIGNACIÓN
          </CardTitle>
          {/* En peligro sólo cuando hay alguien: un cero no avisa nada. */}
          <span
            className={`text-metric tabular-nums ${
              summary.possibleOverload > 0
                ? "text-danger-default"
                : "text-neutral-default"
            }`}
          >
            {summary.possibleOverload}
          </span>
          <div className="mt-auto">
            <People
              people={summary.overloadPeople}
              emptyLabel="Nadie con señal de sobrecarga"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <CardTitle icon="trend-down" dot="bg-warning-bold">
            POSIBLE SUBASIGNACIÓN
          </CardTitle>
          <span
            className={`text-metric tabular-nums ${
              summary.possibleUnderload > 0
                ? "text-warning-default"
                : "text-neutral-default"
            }`}
          >
            {summary.possibleUnderload}
          </span>
          <div className="mt-auto">
            <People
              people={summary.underloadPeople}
              emptyLabel="Nadie con demanda por debajo"
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <CardTitle icon="check" dot="bg-success-bold">
            CARGA HABITUAL
          </CardTitle>
          <span className="text-metric tabular-nums text-neutral-default">
            {summary.usual}
          </span>
          <div className="mt-auto text-body-sm text-neutral-subtle">
            Dentro de la tolerancia de sus señales
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <CardTitle icon="status-empty" dot="bg-neutral-bold">
            NO EVALUABLES
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">
              {summary.notEvaluable}
            </span>
            <span className="text-heading-md tabular-nums text-neutral-subtle">
              / {summary.total}
            </span>
          </div>
          <div className="mt-auto text-body-sm text-neutral-subtle">
            {reasons.length === 0
              ? "Todos evaluables"
              : reasons.map((reason, index) => (
                  <React.Fragment key={reason.label}>
                    {index > 0 && " · "}
                    <b className="font-semibold tabular-nums text-neutral-default">
                      {reason.value}
                    </b>{" "}
                    {reason.label}
                  </React.Fragment>
                ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
