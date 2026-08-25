import React from "react";
import { Card, CardBody, Icon } from "@tuya-ui/components";
import type { InitiativesStats } from "../services/initiativeService";
import {
  fteText,
  tallaIconScale,
  tallaTextClass,
} from "../adapters/InitiativeAdapter";

export interface InitiativesStatsCardsProps {
  stats: InitiativesStats | null;
  loading: boolean;
}

const Metric: React.FC<{
  label: string;
  children: React.ReactNode;
  foot: string;
}> = ({ label, children, foot }) => (
  <Card>
    <CardBody className="flex h-full flex-col justify-between gap-1">
      <span className="text-label text-neutral-subtle">{label}</span>
      <span className="text-metric tabular-nums text-neutral-default">
        {children}
      </span>
      <span className="text-body-sm text-neutral-subtle">{foot}</span>
    </CardBody>
  </Card>
);

/**
 * Tres lecturas sobre todas las iniciativas. La de activas lleva, tras un
 * filete, las cinco tallas como columnas fijas: camiseta que crece con la
 * talla, la letra en el matiz categórico de su Tag y la cifra debajo — las
 * tallas en cero se quedan, en gris, para que la escala se lea siempre igual.
 */
export const InitiativesStatsCards: React.FC<InitiativesStatsCardsProps> = ({
  stats,
  loading,
}) => {
  if (loading || !stats) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
      <Card className="sm:col-span-2 lg:col-span-1">
        <CardBody className="flex h-full items-stretch gap-5">
          <div className="flex min-w-24 flex-col justify-between gap-1">
            <span className="text-label text-neutral-subtle">ACTIVAS</span>
            <span className="text-metric tabular-nums text-neutral-default">
              {stats.active}
            </span>
            <span className="text-body-sm text-neutral-subtle">
              de {stats.total}{" "}
              {stats.total === 1 ? "iniciativa" : "iniciativas"}
            </span>
          </div>
          <ul
            className="flex flex-1 items-end justify-between border-l-default border-neutral-default pl-5"
            aria-label="Activas por talla"
          >
            {stats.activeByTalla.map((t) => (
              <li
                key={t.talla}
                className="flex min-w-11 flex-col items-center gap-1"
              >
                <span
                  className={`inline-flex h-6 items-end ${tallaTextClass(t.talla)}`}
                  style={{
                    transform: `scale(${tallaIconScale(t.talla)})`,
                    transformOrigin: "bottom center",
                  }}
                >
                  <Icon name="shirt" size={20} />
                </span>
                <span className={`text-label ${tallaTextClass(t.talla)}`}>
                  {t.talla}
                </span>
                <span
                  className={`text-heading-md font-semibold tabular-nums ${
                    t.count === 0
                      ? "text-neutral-disabled"
                      : "text-neutral-default"
                  }`}
                >
                  {t.count}
                </span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Metric
        label="FTE DEMANDADO"
        foot="FTE esperado que suman las iniciativas activas."
      >
        {fteText(stats.fteDemand)}
        <span className="ml-1 text-body-sm font-medium text-neutral-subtle">
          FTE
        </span>
      </Metric>

      <Metric label="SIN EVALUAR" foot="Sin talla no entran a la demanda.">
        {stats.unevaluated}
      </Metric>
    </div>
  );
};
