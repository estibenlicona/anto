import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Icon,
  Link,
  Progress,
  SegmentedBar,
} from "@tuya-ui/components";
import { MIX_COLORS } from "@features/squads/components/mixColors";
import type { HoursReportStatus } from "../../services/personDetailService";
import {
  formatDate,
  type PersonDetail,
} from "../../adapters/PersonDetailAdapter";

export interface PersonDetailStatsCardsProps {
  detail: PersonDetail;
  onValidateHours: () => void;
  onLinkIdentity: () => void;
  validating: boolean;
}

export const REPORT_STATUS: Record<
  HoursReportStatus,
  { label: string; variant: "neutral" | "info" | "warning" | "success" }
> = {
  NotReported: { label: "Sin reportar", variant: "neutral" },
  Draft: { label: "Borrador", variant: "info" },
  Submitted: { label: "Por validar", variant: "warning" },
  Validated: { label: "Validado", variant: "success" },
};

const CardTitle: React.FC<{
  children: React.ReactNode;
  right?: React.ReactNode;
}> = ({ children, right }) => (
  <div className="flex items-center justify-between">
    <span className="text-label text-neutral-subtle">{children}</span>
    {right}
  </div>
);

/**
 * Tres preguntas distintas del Chapter Lead sobre la persona: ¿trabaja lo que
 * le asigné? · ¿me debe algo este sprint? · ¿cuentan sus items?
 */
export const PersonDetailStatsCards: React.FC<PersonDetailStatsCardsProps> = ({
  detail,
  onValidateHours,
  onLinkIdentity,
  validating,
}) => {
  const hasSquad = detail.allocation !== null;
  const report = detail.currentReport;
  const reportedHours = report
    ? report.bauHours + report.initiativeHours + report.freeHours
    : 0;
  const assignedPct = detail.allocation?.dedicationPercentage ?? 0;
  const realPct =
    detail.realFte === null
      ? null
      : Math.round((detail.realFte / (detail.person.availableFte || 1)) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Asignado vs real */}
      <Card>
        <CardBody className="flex flex-col gap-2">
          <CardTitle
            right={
              <Icon name="fte" size={16} className="text-neutral-subtle" />
            }
          >
            ASIGNADO VS REAL
          </CardTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">
              {detail.assignedFte.toFixed(1)}
            </span>
            <span className="text-heading-md tabular-nums text-neutral-subtle">
              / {detail.person.availableFte.toFixed(1)} FTE asignado
            </span>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            {/* Brecha de tuip: Progress no admite un marcador; la marca del
                real se dibuja encima con un token de texto, anotado en tasks. */}
            <div className="relative">
              <Progress value={assignedPct} label="FTE asignado" />
              {realPct !== null && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 h-3.5 w-0.5 rounded-sm bg-neutral-default"
                  style={{ left: `${Math.min(realPct, 100)}%` }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-body-sm text-neutral-subtle">
              {detail.realFte === null ? (
                <span>Sin sprints reportados</span>
              ) : (
                <span>
                  Real último sprint{" "}
                  <span className="font-bold tabular-nums text-neutral-default">
                    {detail.realFte.toFixed(2)} FTE
                  </span>
                </span>
              )}
              {detail.deltaPoints === null ? (
                <span className="font-semibold tabular-nums text-danger-default">
                  {detail.allocation
                    ? `${detail.allocation.freePercentage}% libre`
                    : "1.0 FTE libre"}
                </span>
              ) : (
                <span
                  className={`font-semibold tabular-nums ${
                    detail.deltaPoints > 0
                      ? "text-warning-default"
                      : "text-neutral-default"
                  }`}
                >
                  {detail.deltaPoints > 0 ? "+" : ""}
                  {detail.deltaPoints} pts sobre lo asignado
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Reporte de horas del sprint */}
      <Card
        className={
          report?.status === "Submitted" ? "border-warning-default" : undefined
        }
      >
        <CardBody className="flex flex-col gap-2">
          <CardTitle
            right={
              report ? (
                <Badge variant={REPORT_STATUS[report.status].variant}>
                  {REPORT_STATUS[report.status].label}
                </Badge>
              ) : (
                <Badge variant="neutral">No aplica</Badge>
              )
            }
          >
            REPORTE DE HORAS ·{" "}
            {report ? `SPRINT ${report.sprint}` : "SPRINT ACTUAL"}
          </CardTitle>
          {!hasSquad || !report ? (
            <>
              <span className="text-heading-md font-semibold text-neutral-subtle">
                Sin célula no reporta
              </span>
              <p className="mt-auto text-body-sm text-neutral-subtle">
                Empezará a reportar en el primer sprint después de asignarla.
              </p>
            </>
          ) : report.status === "NotReported" ? (
            <>
              <span className="text-heading-md font-semibold text-neutral-subtle">
                Todavía no reportó
              </span>
              <p className="mt-auto text-body-sm text-neutral-subtle">
                El sprint cierra el {formatDate(report.closesAt)}.
              </p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-metric tabular-nums text-neutral-default">
                  {reportedHours}
                </span>
                <span className="text-heading-md tabular-nums text-neutral-subtle">
                  / {report.sprintHours} h
                </span>
                <span className="ml-auto text-label font-normal tracking-normal text-neutral-subtle">
                  {detail.hoursWithinTolerance
                    ? `dentro de ${report.toleranceMin}–${report.toleranceMax} h`
                    : `fuera de ${report.toleranceMin}–${report.toleranceMax} h`}
                </span>
              </div>
              <SegmentedBar
                separated
                total={report.sprintHours}
                segments={[
                  {
                    label: "BAU",
                    value: report.bauHours,
                    color: MIX_COLORS.bau,
                  },
                  {
                    label: "Iniciativa",
                    value: report.initiativeHours,
                    color: MIX_COLORS.transformation,
                  },
                ]}
              />
              <div className="flex items-center gap-3 text-body-sm text-neutral-subtle">
                <span>
                  <b className="tabular-nums text-neutral-default">
                    {report.bauHours} h
                  </b>{" "}
                  BAU
                </span>
                <span>
                  <b className="tabular-nums text-neutral-default">
                    {report.initiativeHours} h
                  </b>{" "}
                  Iniciativa
                </span>
                <span>
                  <b className="tabular-nums text-neutral-default">
                    {report.freeHours} h
                  </b>{" "}
                  libres
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-neutral-default pt-2">
                <span className="text-label font-normal tracking-normal text-neutral-subtle">
                  {report.submittedAt
                    ? `Enviado el ${formatDate(report.submittedAt)} · `
                    : ""}
                  cierra el {formatDate(report.closesAt)}
                </span>
                {report.status === "Submitted" && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={onValidateHours}
                    isLoading={validating}
                  >
                    Validar
                  </Button>
                )}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Trabajo en DevOps */}
      <Card
        className={detail.devOpsIdentity ? undefined : "border-danger-default"}
      >
        <CardBody className="flex flex-col gap-2">
          <CardTitle
            right={
              detail.devOpsIdentity ? (
                <Icon
                  name="devops-branch"
                  size={16}
                  className="text-neutral-subtle"
                />
              ) : (
                <Badge variant="danger">Sin vincular</Badge>
              )
            }
          >
            TRABAJO EN DEVOPS
          </CardTitle>
          {detail.devOpsIdentity ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-metric tabular-nums text-neutral-default">
                  {detail.devOpsIdentity.activeItems}
                </span>
                <span className="text-heading-md text-neutral-subtle">
                  items activos
                </span>
              </div>
              <div className="flex items-center gap-3 text-body-sm text-neutral-subtle">
                <span>
                  <b className="tabular-nums text-neutral-default">
                    {detail.devOpsIdentity.initiativeItems}
                  </b>{" "}
                  iniciativa
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <b className="tabular-nums text-neutral-default">
                    {detail.devOpsIdentity.bauItems}
                  </b>{" "}
                  BAU
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-neutral-default pt-2 text-body-sm">
                <span className="text-neutral-subtle">
                  <b
                    className={`tabular-nums ${
                      detail.devOpsIdentity.pendingCuration > 0
                        ? "text-warning-default"
                        : "text-neutral-default"
                    }`}
                  >
                    {detail.devOpsIdentity.pendingCuration}
                  </b>{" "}
                  pendientes de curación
                </span>
                <Link
                  asChild
                  tone="neutral"
                  className="text-label font-normal tracking-normal"
                >
                  <RouterLink
                    to={`/app/lead/backlog?persona=${detail.person.id}`}
                  >
                    Ir a la bandeja
                  </RouterLink>
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className="text-heading-md font-semibold text-neutral-default">
                Sus items no cuentan
              </span>
              <p className="text-body-sm text-neutral-subtle">
                Sin identidad vinculada, nada de lo que haga en DevOps entra al
                FTE real ni al board.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-neutral-default pt-2">
                <span className="text-label font-normal tracking-normal text-neutral-subtle">
                  {detail.devOpsCandidates.length === 0
                    ? "Sin candidatas por nombre"
                    : `${detail.devOpsCandidates.length} identidad${
                        detail.devOpsCandidates.length === 1 ? "" : "es"
                      } candidata${detail.devOpsCandidates.length === 1 ? "" : "s"} por nombre`}
                </span>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={onLinkIdentity}
                  disabled={detail.devOpsCandidates.length === 0}
                  iconBefore={<Icon name="link" size={16} />}
                >
                  Vincular identidad
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
