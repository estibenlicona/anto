import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, EmptyState, Icon, Skeleton } from "@tuya-ui/components";
import type { SkillGroup } from "@features/skills/services/skillsService";
import { useSpanMatrix } from "./hooks/useSpanMatrix";
import { useSpanCellDetail } from "./hooks/useSpanCellDetail";
import { useSpanSummary } from "./hooks/useSpanSummary";
import { pendingLabel, type SpanSort } from "./adapters/SpanMatrixAdapter";
import { toSkillBreakdown } from "./adapters/SkillBreakdownAdapter";
import { SpanControls } from "./components/SpanControls";
import { SpanVisibleGaps } from "./components/SpanVisibleGaps";
import { SpanSummaryCards } from "./components/SpanSummaryCards";
import { SpanFocusSkills } from "./components/SpanFocusSkills";
import { SpanPendingWork } from "./components/SpanPendingWork";
import { SpanLegend } from "./components/SpanLegend";
import { detailRegionId } from "./components/SpanCell";
import { cellKey, SpanMatrixTable } from "./components/SpanMatrixTable";
import { SpanCellDetail } from "./components/SpanCellDetail";
import { SkillBreakdownDrawer } from "./components/SkillBreakdownDrawer";

interface ActiveCell {
  personId: string;
  skillId: string;
  /** El cuadro mismo: el popover se ancla a él por referencia. */
  element: HTMLButtonElement;
}

export const SpanMatrixContainer: React.FC = () => {
  const [groups, setGroups] = useState<SkillGroup[]>([]);
  // Orden fijo: la matriz se mira por brechas, de mayor a menor. Se quitó el
  // control para ponerla por nombre — era una decisión más sin tarea detrás.
  const sort: SpanSort = "gaps";
  const [openSkillId, setOpenSkillId] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const navigate = useNavigate();

  const { span, loading, error } = useSpanMatrix({ groups, sort });
  // Aparte de la matriz a propósito: son cifras del chapter entero, así que no
  // se recargan ni se recalculan al acotar o reordenar lo que está a la vista.
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = useSpanSummary();

  // El detalle se deriva de lo visible: si la habilidad abierta sale del
  // acotado, el panel se cierra solo en vez de mostrar un span que ya no es.
  const breakdown = useMemo(
    () => (span && openSkillId ? toSkillBreakdown(span, openSkillId) : null),
    [span, openSkillId]
  );

  // Lo mismo con la celda: acotar o reordenar puede sacarla del mapa, y un
  // popover anclado a una celda que ya no está no tiene dónde apoyarse.
  const active = useMemo(() => {
    if (!span || !activeCell) return null;
    const person = span.people.find((p) => p.personId === activeCell.personId);
    const cell = person?.cells.find((c) => c.skillId === activeCell.skillId);
    return person && cell ? { person, cell } : null;
  }, [span, activeCell]);

  const detail = useSpanCellDetail(
    active && active.cell.state !== "unevaluated"
      ? active.person.personId
      : null
  );

  /**
   * Cerrar devuelve el foco al cuadro que abrió el detalle. El panel dejó de
   * ser un popover —que se encargaba solo de esto— y sin devolverlo, el foco
   * se queda en un botón que acaba de desaparecer y el recorrido por teclado
   * vuelve a empezar desde el principio de la página.
   */
  const closeDetail = useCallback(() => {
    // Sólo si el foco está en el panel o en el propio cuadro: cerrar con Escape
    // mientras se escribe en otra parte de la pantalla no debe arrastrar el
    // foco hasta la matriz.
    const foco = document.activeElement;
    const dentro =
      foco === activeCell?.element ||
      (foco instanceof Node &&
        document.getElementById(detailRegionId)?.contains(foco) === true);
    if (dentro) activeCell?.element.focus();
    setActiveCell(null);
  }, [activeCell]);

  // Escape sigue cerrando, como cuando el detalle flotaba: es lo que la gente
  // ya intenta con un panel abierto.
  useEffect(() => {
    if (activeCell === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDetail();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeCell, closeDetail]);

  const pending = span ? pendingLabel(span) : null;

  // Sin encabezado de módulo: el nombre de la pantalla ya lo da el breadcrumb
  // del shell, y el resumen arranca arriba. El contador de brechas a la vista
  // va en la fila de notas sobre el mapa (SpanVisibleGaps), con el aviso de
  // pendientes; el filtro de habilidades, en la barra de la card del mapa.
  return (
    <div className="flex flex-col gap-3">
      {/* Los indicadores van fuera del bloque de la matriz: describen al
          chapter, así que no dependen de que haya algo que dibujar abajo ni
          del recorte que el usuario tenga puesto. */}
      {/* El resumen puede fallar sin que falle la matriz. Sin este aviso, sus
          cuatro indicadores y los dos bloques de la columna desaparecían en
          silencio y la pantalla parecía no tenerlos nunca. */}
      {summaryError && (
        <Alert variant="warning">
          No se pudo cargar el resumen del chapter: {summaryError}. La matriz y
          sus totales siguen siendo correctos.
        </Alert>
      )}

      <SpanSummaryCards
        summary={summary}
        loading={summaryLoading}
        onSeePeople={() => navigate("/app/lead/personas")}
      />

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {span && span.empty && (
        <EmptyState
          icon={<Icon name="expertise" size={32} />}
          title="Todavía no hay evaluaciones cerradas"
          description="La matriz se arma con las evaluaciones cerradas del chapter. Evalúa a alguien para empezar a ver el span."
          action={
            <Button
              variant="primary"
              onClick={() => navigate("/app/lead/personas")}
            >
              Ir a Personas
            </Button>
          }
        />
      )}

      {span && !span.empty && (
        <>
          {/* Una fila de notas sobre el mapa: el aviso de pendientes a la
              izquierda y el contador de brechas a la vista a la derecha. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {pending && (
              /* Sólo el aviso, sin botón: el camino para evaluar está en el
               detalle de cada celda ("Evaluar a …"), que apunta a la persona
               y la competencia concretas; mandar al listado de Personas desde
               acá era un desvío. */
              <p className="text-body-sm text-neutral-subtle">
                {pending}. Sin evaluación cerrada no hay brecha que medir.
              </p>
            )}
            <SpanVisibleGaps span={span} />
          </div>

          {/*
            Dos zonas: el mapa, y la columna de apoyo con el detalle, los
            bloques del chapter y la leyenda. El
            detalle de una celda vive acá dentro y no en un panel flotante
            porque lo que la pantalla habilita es comparar la celda abierta con
            el resto del mapa, y un panel anclado tapa justo a sus vecinas.
          */}
          <div className="flex flex-wrap items-start gap-3">
            {/*
              Sin `flex-1`: la tabla mide lo que mide su contenido. Estirada
              al ancho disponible, la holgura caía entera en la columna de
              persona —la única elástica— y dejaba un hueco largo entre el
              nombre y sus cuadros.
            */}
            <div className="flex min-w-0 max-w-full flex-col">
              {/* El filtro va en la barra de la card del mapa (slot toolbar
                  de Table): dentro del marco, pegado a las columnas que
                  recorta, y el marco arranca a la altura de las cards de al
                  lado en vez de una fila más abajo. */}
              <SpanMatrixTable
                span={span}
                toolbar={
                  <SpanControls groups={groups} onGroupsChange={setGroups} />
                }
                activeCellKey={
                  activeCell
                    ? cellKey(activeCell.personId, activeCell.skillId)
                    : null
                }
                onActivateCell={(personId, cell, element) =>
                  setActiveCell({ personId, skillId: cell.skillId, element })
                }
                onOpenPerson={(personId) =>
                  navigate(`/app/lead/competencias/${personId}`)
                }
              />
            </div>

            {/* Elástica: se queda con todo el ancho que el mapa no usa y
                reparte sus cards en una rejilla de 1 a 3 columnas según ese
                ancho, para no dejar el resto de la fila en blanco. Si al lado
                del mapa no caben ni 20rem, baja debajo de él a ancho completo
                (flex-wrap del padre) y ahí también se reparte. */}
            <aside className="grid min-w-[20rem] flex-1 grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] items-start gap-3">
              {active && (
                <div
                  // Con cargo de región y nombre: es contenido que aparece lejos
                  // del clic que lo abrió, y sin nombre no hay forma de saltar
                  // hasta él.
                  id={detailRegionId}
                  role="region"
                  aria-label="Detalle de la celda"
                  className="overflow-hidden rounded-surface border-default border-neutral-default bg-neutral-default"
                >
                  <SpanCellDetail
                    person={active.person}
                    cell={active.cell}
                    plan={detail.plan}
                    loading={detail.loading}
                    error={detail.error}
                    onOpenPlan={() =>
                      navigate(
                        `/app/lead/competencias/${active.person.personId}`
                      )
                    }
                    onOpenSkill={() => {
                      closeDetail();
                      setOpenSkillId(active.cell.skillId);
                    }}
                    onAssess={() =>
                      navigate(
                        `/app/lead/personas/${active.person.personId}/evaluacion`
                      )
                    }
                    onClose={closeDetail}
                  />
                </div>
              )}

              {/* Sin celda activa la columna no deja el hueco esperando: los
                  dos bloques del chapter suben a ocupar su lugar. */}
              <SpanFocusSkills skills={summary?.topSkills ?? []} />
              {summary && (
                <SpanPendingWork
                  pending={summary.pending}
                  onOpenAssessments={() => navigate("/app/lead/personas")}
                  onOpenPeople={() => navigate("/app/lead/personas")}
                  onOpenCatalog={() => navigate("/app/admin/habilidades")}
                />
              )}
              {/* La leyenda cierra la columna, no el mapa: debajo de una
                  matriz de muchas filas quedaba fuera de la vista justo
                  cuando se necesita, y como card suelta al pie parecía otra
                  sección. Al lado del mapa, con las demás, se lee de un
                  vistazo. */}
              <SpanLegend />
            </aside>
          </div>
        </>
      )}

      <SkillBreakdownDrawer
        breakdown={breakdown}
        onOpenChange={(open) => !open && setOpenSkillId(null)}
      />
    </div>
  );
};
