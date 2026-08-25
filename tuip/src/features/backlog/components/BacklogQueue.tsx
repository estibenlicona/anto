import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Chip,
  EmptyState,
  Icon,
  Link,
  SegmentedControl,
} from "@tuya-ui/components";
import type { BacklogStory, BacklogSummary } from "../adapters/BacklogAdapter";

export type QueueView = "pending" | "classified";

export interface BacklogQueueProps {
  items: BacklogStory[];
  summary: BacklogSummary | null;
  currentId: string | null;
  view: QueueView;
  onViewChange: (view: QueueView) => void;
  squadId: string | null;
  onSquadChange: (squadId: string | null) => void;
  /** Filtro por persona llegado por la URL: se muestra como chip removible. */
  personFilter: { id: string; name: string } | null;
  onClearPerson: () => void;
  onSelect: (story: BacklogStory) => void;
  onUndo: (story: BacklogStory) => void;
}

const SECONDARY = "text-label font-normal tracking-normal text-neutral-subtle";

/**
 * La cola: filtros, las historias en orden y la que está en curso resaltada.
 * Las que cambiaron de asignado avisan en ámbar (RN-54). Lo que no tiene
 * persona vinculada no entra: se cuenta al pie (RN-23).
 */
export const BacklogQueue: React.FC<BacklogQueueProps> = ({
  items,
  summary,
  currentId,
  view,
  onViewChange,
  squadId,
  onSquadChange,
  personFilter,
  onClearPerson,
  onSelect,
  onUndo,
}) => {
  const totalPending = summary?.pending ?? 0;
  return (
    <section className="flex flex-col overflow-hidden rounded-surface border border-neutral-default bg-neutral-default">
      <div className="flex flex-col gap-2.5 border-b border-neutral-default px-3 pb-3 pt-3.5">
        <h2 className="px-1 text-body font-semibold text-neutral-default">
          {view === "pending" ? "Por clasificar" : "Clasificadas"}{" "}
          <span className="font-mono text-label font-normal tracking-normal text-neutral-subtle">
            {view === "pending" ? totalPending : items.length}
          </span>
        </h2>
        <div className="px-1">
          <SegmentedControl
            label="Vista"
            value={view}
            onValueChange={(v) => onViewChange(v as QueueView)}
            options={[
              { value: "pending", label: "Por clasificar" },
              { value: "classified", label: "Clasificadas" },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {personFilter ? (
            <Chip
              onRemove={onClearPerson}
              removeLabel="Quitar el filtro por persona"
            >
              Persona: {personFilter.name}
            </Chip>
          ) : (
            <>
              <Chip
                selectable
                selected={squadId === null}
                onSelectedChange={() => onSquadChange(null)}
                count={totalPending}
              >
                Todas
              </Chip>
              {(summary?.pendingBySquad ?? []).map((s) => (
                <Chip
                  key={s.squadId}
                  selectable
                  selected={squadId === s.squadId}
                  onSelectedChange={(on) =>
                    onSquadChange(on ? s.squadId : null)
                  }
                  count={s.pending}
                >
                  {s.squadName}
                </Chip>
              ))}
            </>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Icon name="check" size={32} />}
          title={
            view === "pending"
              ? "No queda nada por clasificar"
              : "Todavía no hay clasificadas"
          }
          description={
            view === "pending"
              ? "En este filtro no hay historias pendientes."
              : "Lo que clasifiques aparece acá, con la opción de deshacer."
          }
        />
      ) : (
        <ol className="flex flex-col">
          {items.map((story, index) => {
            const current = story.id === currentId;
            return (
              <li
                key={story.id}
                className={`grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-neutral-default py-2.5 pr-3 ${
                  current
                    ? "border-l-bold border-l-brand-default bg-brand-subtle pl-[9px]"
                    : "pl-3"
                }`}
              >
                <span className="font-mono text-[11px] text-neutral-subtle">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  {view === "pending" ? (
                    <button
                      type="button"
                      onClick={() => onSelect(story)}
                      className={`truncate text-left text-body-sm text-neutral-default outline-none focus-visible:underline ${
                        current ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {story.title}
                    </button>
                  ) : (
                    <span className="truncate text-body-sm font-medium text-neutral-default">
                      {story.title}
                    </span>
                  )}
                  <span
                    className={`truncate ${SECONDARY} ${story.changedAssignee ? "text-warning-default" : ""}`}
                  >
                    <span className="font-mono">#{story.number}</span> ·{" "}
                    {view === "classified" && story.outcomeLabel
                      ? story.outcomeLabel
                      : story.changedAssignee
                        ? `cambió de asignado · ${story.personName}`
                        : `${story.squadName ?? "Sin célula"} · ${story.personName}`}
                  </span>
                </div>
                {view === "pending" ? (
                  <Avatar
                    size="small"
                    label={story.personName ?? ""}
                    colorId={story.personId ?? story.id}
                  >
                    {story.initials}
                  </Avatar>
                ) : (
                  <Link
                    href="#"
                    tone="neutral"
                    className="text-label font-normal tracking-normal"
                    onClick={(e) => {
                      e.preventDefault();
                      onUndo(story);
                    }}
                  >
                    Deshacer
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {summary && summary.excludedWithoutIdentity > 0 && (
        <p
          className={`border-t border-neutral-default px-4 py-2.5 ${SECONDARY}`}
        >
          {summary.excludedWithoutIdentity} historias de personas sin identidad
          DevOps no entran a la cola ·{" "}
          <Link asChild tone="neutral" className="underline underline-offset-2">
            <RouterLink to="/app/lead/personas">
              vincular identidades
            </RouterLink>
          </Link>
        </p>
      )}
    </section>
  );
};
