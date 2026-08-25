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
  const [sort, setSort] = useState<SpanSort>("gaps");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-neutral-default">
            Competencias
          </h1>
          <p className="max-w-prose text-body-sm text-neutral-subtle">
            Brecha entre el nivel que pide cada cargo y el nivel evaluado de
            cada persona. El color dice una sola cosa: cuántos niveles faltan.
            Haz clic en un cuadro para ver el detalle.
          </p>
        </div>
        {span && !span.empty && (
          /* "a la vista" y no "en el span": esta cifra sigue al recorte de
             habilidades, y llamarla del span la ponía a contradecir —arriba y
             al lado— a la card de brechas críticas, que sí cuenta el span
             entero. */
          <p className="shrink-0 text-body font-medium text-neutral-default">
            {span.totalGaps}{" "}
            {span.totalGaps === 1 ? "brecha a la vista" : "brechas a la vista"}
          </p>
        )}
      </div>

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
          <SpanControls
            span={span}
            groups={groups}
            sort={sort}
            onGroupsChange={setGroups}
            onSortChange={setSort}
          />

          {pending && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-body-sm text-neutral-subtle">
                {pending}. Sin evaluación cerrada no hay brecha que medir.
              </p>
              {/* El aviso ofrece qué hacer: enterarse de que faltan
                  evaluaciones y no poder ir a abrirlas deja al lector con el
                  problema y sin el camino. */}
              <Button
                variant="subtle"
                size="small"
                onClick={() => navigate("/app/lead/personas")}
              >
                Abrir evaluaciones
              </Button>
            </div>
          )}

          {/*
            Dos zonas: el mapa con su leyenda, y la columna de apoyo. El
            detalle de una celda vive acá dentro y no en un panel flotante
            porque lo que la pantalla habilita es comparar la celda abierta con
            el resto del mapa, y un panel anclado tapa justo a sus vecinas.
          */}
          <div className="flex flex-wrap items-start gap-6">
            {/*
              Sin `flex-1`: la tabla mide lo que mide su contenido. Estirada
              al ancho disponible, la holgura caía entera en la columna de
              persona —la única elástica— y dejaba un hueco largo entre el
              nombre y sus cuadros.
            */}
            <div className="flex min-w-0 max-w-full flex-col gap-4">
              <SpanMatrixTable
                span={span}
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
              <SpanLegend />
            </div>

            {/* Ancho completo hasta `lg`, donde pasa a ser una columna de 20rem
                al lado del mapa. */}
            <aside className="flex w-full min-w-0 flex-col gap-4 lg:w-80">
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
