import React from "react";
import { Link } from "@tuya-ui/components";
import {
  STACK_LEVEL_LABELS,
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

/**
 * La ficha administrativa — el panel protagonista del perfil. Acá vive toda la
 * identidad que el encabezado ya no muestra: nivel, modalidad, vinculación,
 * correo e identidad DevOps, junto con lo organizacional. Cada dato aparece
 * una sola vez en la página.
 */
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

  const rows: Array<{ label: string; content: React.ReactNode }> = [
    {
      // La escala de cuatro niveles — Principiante, Competente, Avanzado,
      // Experto — sin número SFIA: el número no se muestra en esta vista.
      label: "Nivel",
      content:
        person.levelLabel ??
        STACK_LEVEL_LABELS[detail.level] ??
        String(detail.level),
    },
    {
      // La otra escala, separada a propósito: Junior, Intermedio o Senior.
      label: "Seniority",
      content: person.seniorityLabel,
    },
    { label: "Modalidad", content: detail.modalityLabel },
    {
      label: "Vinculación",
      content: detail.isExternal
        ? `Externa · ${detail.providerName ?? "proveedor"}`
        : "Interna",
    },
    {
      label: "Correo",
      content: (
        <span className="font-mono text-[13px]">
          {person.userPrincipalName}
        </span>
      ),
    },
    {
      label: "Identidad DevOps",
      content: detail.devOpsIdentity ? (
        <>
          <span
            aria-hidden="true"
            className="size-1.5 rounded-pill bg-success-bold"
          />
          Vinculada
        </>
      ) : (
        <span className="text-danger-default">Sin vincular</span>
      ),
    },
    {
      // La fila lleva a la persona, no a la unidad: quién es su Líder de
      // Expertise. La unidad se lee en la fila de la línea, abajo.
      label: "Líder de expertise",
      content: detail.chapterLeadName ? (
        detail.chapterLeadName === person.name ? (
          <>
            {person.name}
            <span className={SECONDARY_TEXT}>· lidera este chapter</span>
          </>
        ) : (
          detail.chapterLeadName
        )
      ) : (
        <span className={SECONDARY_TEXT}>Sin líder de expertise</span>
      ),
    },
    {
      // A qué línea pertenece, a secas.
      label: "Línea de expertise",
      content: detail.expertiseLineName ?? (
        <span className={SECONDARY_TEXT}>Sin línea asignada</span>
      ),
    },
    {
      label: "Ingreso",
      content: (
        <>
          {detail.startDateLabel}
          <span className={SECONDARY_TEXT}>· {detail.tenureLabel}</span>
        </>
      ),
    },
    {
      // La cifra sola: la lectura de concordancia con el nivel salió de la
      // ficha con el rediseño.
      label: "Costo mensual",
      content: <span className="tabular-nums">{cost}</span>,
    },
  ];

  return (
    <DetailPanel
      title="Perfil"
      subtitle="lo administrativo"
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
      <dl className="grid grid-cols-[190px_minmax(0,1fr)]">
        {rows.map((row, i) => (
          <Row key={row.label} label={row.label} last={i === rows.length - 1}>
            {row.content}
          </Row>
        ))}
      </dl>
    </DetailPanel>
  );
};
