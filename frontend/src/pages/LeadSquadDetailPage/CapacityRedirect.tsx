import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";

/**
 * La antigua pantalla de Capacidades (selector de célula + asignaciones) ya no
 * existe: la gestión del equipo vive en el detalle de cada célula. Esta ruta
 * queda sólo para no romper enlaces guardados: con `?celula=<id>` va al
 * detalle; sin id, al listado.
 */
export const CapacityRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const squadId = searchParams.get("celula");
  return (
    <Navigate
      replace
      to={
        squadId
          ? `/app/lead/celulas/${encodeURIComponent(squadId)}`
          : "/app/lead/celulas"
      }
    />
  );
};
