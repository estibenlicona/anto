import React from "react";
import { Card, CardBody } from "@tuya-ui/components";

export interface TeamsStatsCardsProps {
  totalCount: number;
  totalSquadCount: number;
  loading: boolean;
}

/**
 * Dos lecturas sobre todos los equipos —siempre el conjunto completo, nunca
 * la página, la búsqueda o el filtro—: cuántos equipos hay y cuántas células
 * agrupan en total. Mismo tratamiento de card que el resumen de Células,
 * reducido a lo que pide la spec de Equipos.
 */
export const TeamsStatsCards: React.FC<TeamsStatsCardsProps> = ({
  totalCount,
  totalSquadCount,
  loading,
}) => {
  if (loading) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <span className="text-label text-neutral-subtle">EQUIPOS</span>
          <span className="text-metric tabular-nums text-neutral-default">
            {totalCount}
          </span>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="flex h-full flex-col gap-2">
          <span className="text-label text-neutral-subtle">
            CÉLULAS AGRUPADAS
          </span>
          <span className="text-metric tabular-nums text-neutral-default">
            {totalSquadCount}
          </span>
        </CardBody>
      </Card>
    </div>
  );
};
