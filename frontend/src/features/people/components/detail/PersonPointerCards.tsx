import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Button, Card, CardBody, Icon, Link } from "@tuya-ui/components";
import { BalanceSignalBadge } from "@features/dedication/components/BalanceSignalBadge";
import type { PersonPlanView } from "@features/career-plan/adapters/PersonPlanAdapter";
import type { PersonDetail } from "../../adapters/PersonDetailAdapter";
import { SECONDARY_TEXT } from "./DetailPanel";
import { modulePath } from "@shared/services/modulePath";

export interface PersonPointerCardsProps {
  detail: PersonDetail;
  /** `null` mientras carga o si el plan no se pudo traer (design D3). */
  plan: PersonPlanView | null;
  /** Ruta del plan de la persona en Competencias. */
  planHref: string;
  onLinkIdentity: () => void;
}

const PointerCard: React.FC<{
  title: string;
  href?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, href, right, children }) => (
  <Card>
    <CardBody className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-label text-neutral-subtle">{title}</span>
        {right ??
          (href && (
            <Link asChild tone="neutral" className="text-body-sm">
              <RouterLink to={href}>Ver</RouterLink>
            </Link>
          ))}
      </div>
      {children}
    </CardBody>
  </Card>
);

/**
 * Los dos punteros del costado: cada módulo sirve su resumen ya resuelto
 * —badge + un dato— y la ficha sólo enlaza. Nada de SP, barras, horas ni
 * la matriz de competencias: eso vive en Capacidad y en Competencias.
 */
export const PersonPointerCards: React.FC<PersonPointerCardsProps> = ({
  detail,
  plan,
  planHref,
  onLinkIdentity,
}) => {
  const pointer = detail.sprintPointer;
  const dedicationHref = modulePath(`dedicacion/${detail.person.id}`);

  return (
    <>
      <PointerCard title="Competencias" href={planHref}>
        {plan && plan.assessed ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            {plan.openGapCount > 0 ? (
              <Badge variant="warning">
                {plan.openGapCount} brecha{plan.openGapCount === 1 ? "" : "s"}{" "}
                abierta{plan.openGapCount === 1 ? "" : "s"}
              </Badge>
            ) : (
              <Badge variant="success">Sin brechas</Badge>
            )}
            {plan.assessedOnLabel && (
              <span className={SECONDARY_TEXT}>
                evaluado el {plan.assessedOnLabel}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="neutral" dot={false}>
              Sin evaluación
            </Badge>
            <span className={SECONDARY_TEXT}>se evalúa en Competencias</span>
          </div>
        )}
      </PointerCard>

      <PointerCard
        title="Capacidad en el sprint"
        href={pointer.kind === "unlinked" ? undefined : dedicationHref}
        right={
          pointer.kind === "unlinked" ? (
            <Badge variant="danger">Sin vincular</Badge>
          ) : undefined
        }
      >
        {pointer.kind === "unlinked" ? (
          <div className="flex flex-col items-start gap-2">
            <span className="text-body-sm text-neutral-default">
              Sus items no cuentan
            </span>
            {/* Siempre disponible: la identidad se busca en DevOps por el
                correo, sin depender de coincidencias previas. */}
            <Button
              variant="secondary"
              size="small"
              onClick={onLinkIdentity}
              iconBefore={<Icon name="link" size={16} />}
            >
              Vincular con Azure DevOps
            </Button>
          </div>
        ) : pointer.kind === "noSprint" || !pointer.balance ? (
          <span className="text-body-sm text-neutral-default">
            Sin sprint en curso
          </span>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BalanceSignalBadge balance={pointer.balance} phrase={false} />
            {pointer.meta && (
              <span className={`${SECONDARY_TEXT} tabular-nums`}>
                {pointer.meta}
              </span>
            )}
          </div>
        )}
      </PointerCard>
    </>
  );
};
