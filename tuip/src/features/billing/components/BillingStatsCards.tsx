import React from "react";
import { Card, CardBody, Icon } from "@tuya-ui/components";
import type { BillingPeriodStats } from "../adapters/BillingAdapter";
import { money, periodLabel, signedMoney } from "../adapters/BillingAdapter";

export interface BillingStatsCardsProps {
  stats: BillingPeriodStats;
  period: string;
  loading: boolean;
}

/**
 * Las tres lecturas del período del diseño aprobado: cuántas facturas
 * llegaron y en qué estado, cómo va lo prefacturado contra lo esperado, y qué
 * novedades sustentan ese esperado.
 */
export const BillingStatsCards: React.FC<BillingStatsCardsProps> = ({
  stats,
  period,
  loading,
}) => {
  if (loading) return null;
  const diff = stats.difference;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-neutral-subtle">
              Prefacturas · {periodLabel(period)}
            </span>
            <Icon name="document" size={16} className="text-neutral-subtle" />
          </div>
          <span className="text-metric tabular-nums text-neutral-default">
            {stats.prefactureCount}
          </span>
          {/* La unidad es la persona: la cifra creció al cambiarla, y decirlo
              evita leer el salto como más volumen. */}
          <span className="mt-auto text-body-sm text-neutral-subtle">
            una por persona ·{" "}
            <b className="font-bold tabular-nums text-neutral-default">
              {stats.toReviewCount}
            </b>{" "}
            por revisar ·{" "}
            <b className="font-bold tabular-nums text-neutral-default">
              {stats.objectedCount}
            </b>{" "}
            {stats.objectedCount === 1 ? "objetada" : "objetadas"}
          </span>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-neutral-subtle">
              Esperado vs prefacturado
            </span>
            <Icon name="capacity" size={16} className="text-neutral-subtle" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-heading-md font-semibold tabular-nums text-neutral-default">
              {money(stats.prefactured)}
            </span>
            <span className="text-body-sm text-neutral-subtle">
              vs {money(stats.expected)} esperado
            </span>
          </div>
          <span className="mt-auto text-body-sm text-neutral-subtle">
            {stats.prefactureCount === 0 ? (
              "Sin prefacturas registradas todavía"
            ) : diff === 0 ? (
              <>
                <b className="font-bold text-success-default">Sin diferencia</b>{" "}
                contra lo esperado
              </>
            ) : (
              <>
                <b className="font-bold tabular-nums text-danger-default">
                  {signedMoney(diff)}
                </b>{" "}
                {diff > 0 ? "por encima" : "por debajo"} de lo esperado
              </>
            )}
          </span>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-label uppercase text-neutral-subtle">
              Novedades del período
            </span>
            <Icon name="calendar" size={16} className="text-neutral-subtle" />
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-heading-md font-semibold tabular-nums text-neutral-default">
              {stats.absenceDays} {stats.absenceDays === 1 ? "día" : "días"}
            </span>
            <span className="text-body-sm text-neutral-subtle">
              de ausencia ·{" "}
              <b className="font-bold tabular-nums text-neutral-default">
                {stats.overtimeCount}
              </b>{" "}
              con horas extra
            </span>
          </div>
          {/* Antes decía de dónde viene el dato ("Nacen en Ausencias"), que a
              quien revisa no le cambia la decisión. Lo que sí le sirve es qué
              se comprueba con esos días. */}
          <span className="mt-auto text-body-sm text-neutral-subtle">
            Justifican el descuento que las prefacturas del mes tienen que
            reflejar
          </span>
        </CardBody>
      </Card>
    </div>
  );
};
