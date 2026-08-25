import React from "react";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Icon,
  Kbd,
  Link,
} from "@tuya-ui/components";
import type { BacklogStory } from "../adapters/BacklogAdapter";
import type { BacklogCatalogsDto } from "../services/backlogService";
import { DecisionCards } from "./DecisionCards";
import type { DecisionErrors, DecisionValues } from "./backlogValidation";

export interface CurrentStoryPanelProps {
  story: BacklogStory | null;
  position: number;
  total: number;
  catalogs: BacklogCatalogsDto | null;
  values: DecisionValues;
  errors: DecisionErrors;
  onChange: (values: DecisionValues) => void;
  onSave: () => void;
  onSkip: () => void;
  onReject: () => void;
  saving: boolean;
  /** Estado vacío: qué ofrecer (quitar filtro / ver clasificadas). */
  onShowClassified: () => void;
  hasFilter: boolean;
  onClearFilter: () => void;
}

const SECONDARY = "text-label font-normal tracking-normal text-neutral-subtle";

/**
 * La historia en curso en tres zonas separadas — qué es, de quién es, la
 * decisión — y un pie con un único primario: Guardar y siguiente.
 */
export const CurrentStoryPanel: React.FC<CurrentStoryPanelProps> = ({
  story,
  position,
  total,
  catalogs,
  values,
  errors,
  onChange,
  onSave,
  onSkip,
  onReject,
  saving,
  onShowClassified,
  hasFilter,
  onClearFilter,
}) => {
  if (!story) {
    return (
      <section className="overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
        <EmptyState
          icon={<Icon name="status-success" size={32} />}
          title="Nada por clasificar acá"
          description={
            hasFilter
              ? "Con este filtro no queda ninguna historia pendiente."
              : "Todas las historias que llegaron están clasificadas."
          }
          action={
            hasFilter ? (
              <Button variant="secondary" onClick={onClearFilter}>
                Quitar el filtro
              </Button>
            ) : (
              <Button variant="secondary" onClick={onShowClassified}>
                Ver clasificadas
              </Button>
            )
          }
        />
      </section>
    );
  }

  const firstName = story.personName?.split(" ")[0] ?? "";
  return (
    <section className="flex min-w-0 flex-col overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
      {/* Qué es */}
      <div className="flex flex-col gap-3 border-b border-neutral-default px-5 pb-4 pt-5">
        <div className="flex items-center justify-between gap-4">
          <span className={SECONDARY}>
            {story.epicTitle ? (
              <>
                Epic{" "}
                <b className="font-medium text-neutral-default">
                  {story.epicTitle}
                </b>{" "}
                <span aria-hidden="true">›</span> Historia de usuario
              </>
            ) : (
              "Historia de usuario sin Epic"
            )}
          </span>
          <span className={SECONDARY}>
            {position} de {total} · ingesta {story.ingestedLabel}
          </span>
        </div>
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-body-sm text-neutral-subtle">
            #{story.number}
          </span>
          <h2 className="text-heading-md font-semibold text-neutral-default">
            {story.title}
          </h2>
        </div>
        {story.description && (
          <p className="max-w-3xl text-body-sm text-neutral-subtle">
            {story.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <span className={SECONDARY}>
            <b className="font-medium text-neutral-default">{story.points}</b>{" "}
            puntos
          </span>
          <Badge variant="info">{story.devOpsStateLabel}</Badge>
          <span className={SECONDARY}>
            Tablero{" "}
            <b className="font-medium text-neutral-default">{story.board}</b>
          </span>
          <span className={SECONDARY}>
            Sprint{" "}
            <b className="font-medium text-neutral-default">{story.sprint}</b>
          </span>
          <Link
            href="#"
            tone="neutral"
            className="ml-auto text-label font-normal tracking-normal underline underline-offset-2"
          >
            Abrir en DevOps
          </Link>
        </div>
      </div>

      {/* De quién es */}
      <div className="flex items-center justify-between gap-4 border-b border-neutral-default bg-neutral-subtlest px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar
            size="large"
            label={story.personName ?? ""}
            colorId={story.personId ?? story.id}
          >
            {story.initials}
          </Avatar>
          <div className="flex flex-col">
            <span className="text-body-sm font-medium text-neutral-default">
              {story.personName}{" "}
              <span className={SECONDARY}>
                · {story.personPosition} · {story.squadName ?? "Sin célula"}
              </span>
            </span>
            <span
              className={`inline-flex items-center gap-1.5 ${SECONDARY} ${story.changedAssignee ? "text-warning-default" : ""}`}
            >
              <span
                className={`size-1.5 rounded-pill ${story.changedAssignee ? "bg-warning-bold" : "bg-success-bold"}`}
              />
              {story.changedAssignee
                ? `Cambió de asignado: antes ${story.previousAssignedTo}, ahora ${story.assignedTo}`
                : `Asignado en DevOps a ${story.assignedTo} · identidad vinculada`}
            </span>
          </div>
        </div>
        <Button variant="subtle" size="small" onClick={onReject}>
          No es de {firstName}…
        </Button>
      </div>

      {/* La decisión */}
      <DecisionCards
        values={values}
        errors={errors}
        onChange={onChange}
        catalogs={catalogs}
        squadId={story.squadId}
        suggestedInitiativeId={story.suggestedInitiativeId}
      />

      {/* Acciones */}
      <div className="flex items-center justify-between gap-3 border-t border-neutral-default bg-neutral-subtlest px-5 py-3.5">
        <span
          className={`inline-flex flex-wrap items-center gap-2 ${SECONDARY}`}
        >
          <Kbd size="sm">1</Kbd>
          <Kbd size="sm">2</Kbd>
          <Kbd size="sm">3</Kbd> elegir · <Kbd size="sm">↵</Kbd> guardar y
          seguir · <Kbd size="sm">S</Kbd> saltar
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onSkip} disabled={saving}>
            Saltar por ahora
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            isLoading={saving}
            iconAfter={<Icon name="chevron-right" size={16} />}
          >
            Guardar y siguiente
          </Button>
        </div>
      </div>
    </section>
  );
};
