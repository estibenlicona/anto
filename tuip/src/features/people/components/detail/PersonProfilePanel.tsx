import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Badge, Link } from "@tuya-ui/components";
import {
  formatDate,
  type PersonDetail,
} from "../../adapters/PersonDetailAdapter";
import { DetailPanel, SECONDARY_TEXT } from "./DetailPanel";

export interface PersonProfilePanelProps {
  detail: PersonDetail;
  onEdit: () => void;
}

const Row: React.FC<{
  label: string;
  children: React.ReactNode;
  last?: boolean;
}> = ({ label, children, last }) => {
  const border = last ? "" : "border-b border-neutral-default";
  return (
    <>
      <dt
        className={`flex items-center px-4 py-3 text-label text-neutral-subtle ${border}`}
      >
        {label}
      </dt>
      <dd
        className={`flex items-center gap-2 px-4 py-3 text-body-sm text-neutral-default ${border}`}
      >
        {children}
      </dd>
    </>
  );
};

/** Lo administrativo. Nada de lo que está en el encabezado se repite acá. */
export const PersonProfilePanel: React.FC<PersonProfilePanelProps> = ({
  detail,
  onEdit,
}) => {
  const { person } = detail;
  const cost = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(person.monthlyCost);
  const costVariant = detail.costReading === "InRange" ? "success" : "warning";

  const rows: Array<{ label: string; content: React.ReactNode }> = [
    {
      label: "Chapter",
      // Quien figura acá es quien tiene a esta persona a su cargo, y es el
      // mismo que la ve en su listado: sale de la relación que decide el
      // alcance. Antes salía del líder de su línea de expertise, que es otra
      // jerarquía y podía nombrar a alguien que no la ve.
      content: detail.chapterName ? (
        <>
          {detail.chapterName}
          <span className={SECONDARY_TEXT}>
            {detail.chapterLeadName === null
              ? "· Sin lead"
              : detail.chapterLeadName === person.name
                ? "· Lidera este chapter"
                : `· Lead: ${detail.chapterLeadName}`}
          </span>
        </>
      ) : (
        <span className={SECONDARY_TEXT}>Sin chapter asignado</span>
      ),
    },
    {
      label: "Línea de expertise",
      content: detail.expertiseLineName ? (
        <>
          {detail.expertiseLineName}
          <span className={SECONDARY_TEXT}>
            {/*
              Tres lecturas distintas, y ninguna se puede dar por la otra: la
              línea sin lead todavía no tiene quién responda, y la persona que
              lidera la suya no se anuncia como si el lead fuera otro.
            */}
            {detail.expertiseLineLeadName === null
              ? "· Sin lead"
              : detail.expertiseLineLeadName === person.name
                ? "· Lidera esta línea"
                : `· Lead: ${detail.expertiseLineLeadName}`}
          </span>
        </>
      ) : (
        <>
          <span className={SECONDARY_TEXT}>Sin línea asignada</span>
          <Link asChild tone="neutral" className="ml-2 text-body-sm">
            <RouterLink to="/app/admin/lineas">Asignar una línea</RouterLink>
          </Link>
        </>
      ),
    },
    {
      label: "Ingreso",
      content: (
        <>
          <span className="tabular-nums">{detail.startDateLabel}</span>
          <span className={SECONDARY_TEXT}>· {detail.tenureLabel}</span>
        </>
      ),
    },
    {
      label: "FTE disponible",
      content: (
        <>
          <span className="tabular-nums">{person.availableFte.toFixed(1)}</span>
          <span className={SECONDARY_TEXT}>· declarado, base del asignado</span>
        </>
      ),
    },
    {
      label: "Costo mensual",
      content: (
        <>
          <span className="tabular-nums">{cost}</span>
          <Badge variant={costVariant}>{detail.costReadingLabel}</Badge>
        </>
      ),
    },
  ];
  if (detail.isExternal) {
    rows.push({
      label: "Proveedor",
      content: (
        <>
          {detail.providerName ?? "—"}
          {detail.contractEndsAt && (
            <span className={SECONDARY_TEXT}>
              · contrato hasta {formatDate(detail.contractEndsAt)}
            </span>
          )}
        </>
      ),
    });
  }
  rows.push(
    {
      label: "Documento",
      content: <span className="tabular-nums">{person.documentId}</span>,
    },
    {
      label: "Identidad DevOps",
      content: detail.devOpsIdentity ? (
        <>
          <span className="font-mono text-[13px]">
            {detail.devOpsIdentity.userName}
          </span>
          <span className={SECONDARY_TEXT}>
            · vinculada el {formatDate(detail.devOpsIdentity.linkedAt)}
          </span>
        </>
      ) : (
        <span className="text-danger-default">Sin vincular</span>
      ),
    }
  );

  return (
    <DetailPanel
      title="Ficha"
      right={
        <Link
          href="#"
          tone="neutral"
          className="text-body-sm"
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
        >
          Editar
        </Link>
      }
    >
      <dl className="grid grid-cols-[10rem_minmax(0,1fr)]">
        {rows.map((r, i) => (
          <Row key={r.label} label={r.label} last={i === rows.length - 1}>
            {r.content}
          </Row>
        ))}
      </dl>
    </DetailPanel>
  );
};
