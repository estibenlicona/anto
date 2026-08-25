import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  accentTones,
  Avatar,
  AvatarGroup,
  Card,
  CardBody,
  DistributionCard,
  Link,
  type AccentTone,
} from "@tuya-ui/components";
import { getPersonInitials } from "../adapters/PersonAdapter";
import type { PeopleStats } from "../services/personService";

// El tono de cada nivel se deriva de la posición en la escala ordinal que
// publica tuip (`accentTones`), exactamente como lo hace SeniorityCard en las
// filas del listado: el mismo nivel viste el mismo color en la card y en el
// medidor por construcción, y un cambio de matiz o de nombre en la escala llega
// con la sola actualización del paquete. Es lo contrario del color de los
// avatares de esta misma pantalla, que se reparte desde el id porque ahí el
// color no significa nada, sólo distingue personas.
const toneForSeniority = (seniority: number): AccentTone =>
  accentTones[seniority - 1] ?? accentTones[0];

/** Lo que la card de personas activas toma del overview de capacidad del chapter. */
export interface PeopleAssignmentSummary {
  /** Personas con al menos una asignación. */
  assigned: number;
  /** Células con al menos una persona. */
  squadsWithPeople: number;
}

export interface PeopleStatsCardsProps {
  stats: PeopleStats | null;
  loading: boolean;
  /** Sin él, la card de activas omite la lectura "N en M células". */
  assignment?: PeopleAssignmentSummary | null;
}

const pluralize = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

/**
 * Tres lecturas sobre todas las personas registradas. Cada card abre con la
 * cifra que manda y sigue con su respaldo: avatares, una barra de dos tramos
 * o la distribución por nivel. Las barras y sus leyendas son DistributionCard
 * con `headline`: la card no calcula ni pinta nada por su cuenta.
 */
export const PeopleStatsCards: React.FC<PeopleStatsCardsProps> = ({
  stats,
  loading,
  assignment,
}) => {
  if (loading || !stats) {
    return null;
  }

  const extraCount = Math.max(stats.activeCount - stats.sample.length, 0);
  const { distinct, atRisk } = stats.stackCoverage;
  const backed = Math.max(distinct - atRisk.length, 0);

  const total = stats.activeCount;
  const advanced = stats.bySeniority
    .filter((e) => e.seniority >= 3)
    .reduce((sum, e) => sum + e.count, 0);
  const advancedPct = total > 0 ? Math.round((advanced / total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-label text-neutral-subtle">
              PERSONAS ACTIVAS
            </span>
            {assignment && (
              <Link asChild tone="neutral" className="text-body-sm">
                <RouterLink to="/app/lead/celulas">Ver células</RouterLink>
              </Link>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-metric tabular-nums text-neutral-default">
              {stats.activeCount}
            </span>
            {assignment && (
              <span className="text-body-sm text-neutral-subtle">
                {assignment.assigned} en{" "}
                {pluralize(assignment.squadsWithPeople, "célula", "células")}
              </span>
            )}
          </div>
          <div className="mt-auto flex items-center gap-2">
            <AvatarGroup max={stats.sample.length || 1}>
              {stats.sample.map((person) => (
                <Avatar
                  key={person.id}
                  size="small"
                  label={person.name}
                  colorId={person.id}
                >
                  {getPersonInitials(person.name)}
                </Avatar>
              ))}
            </AvatarGroup>
            {extraCount > 0 && (
              <span className="text-body-sm text-neutral-subtle">
                +{extraCount} más
              </span>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Stacks sin respaldo: la cifra que importa es cuántos dependen de una
          sola persona; la barra muestra la proporción contra los cubiertos.
          Con respaldo en el azul de acento (la familia de la pantalla) y sin
          respaldo en el gris claro del sistema (heat low, con aro en la
          leyenda): la cifra y la etiqueta ya dicen el riesgo. */}
      <DistributionCard
        title="STACKS SIN RESPALDO"
        headline={{
          value: atRisk.length,
          note:
            distinct === 0
              ? "sin stacks registrados"
              : `de ${distinct} ${distinct === 1 ? "registrado" : "registrados"} · ${backed} con respaldo`,
        }}
        legend="inline"
        items={[
          { label: "Con 2 o más personas", value: backed, tone: "blue" },
          { label: "Sin respaldo", value: atRisk.length, heat: "low" },
        ]}
      />

      {/* Distribución por seniority: abre con el % en avanzado o superior — la
          lectura que el Chapter Lead usa — y la barra y la leyenda la respaldan
          con el mismo tono que el medidor de cada fila. */}
      <DistributionCard
        title="DISTRIBUCIÓN POR SENIORITY"
        headline={{
          value: `${advancedPct}%`,
          note: `${advanced} de ${total} en avanzado o superior`,
        }}
        legend="inline"
        items={stats.bySeniority.map((entry) => ({
          label: entry.label,
          value: entry.count,
          tone: toneForSeniority(entry.seniority),
        }))}
      />
    </div>
  );
};
