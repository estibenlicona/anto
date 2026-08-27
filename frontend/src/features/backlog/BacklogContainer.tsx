import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Alert, Button, Icon, useToast } from "@tuya-ui/components";
import { useCapacityOverview } from "@features/control-tower/hooks/useCapacityOverview";
import { useBacklogCatalogs } from "./hooks/useBacklogCatalogs";
import { useBacklogQueue } from "./hooks/useBacklogQueue";
import { useBacklogMutations } from "./hooks/useBacklogMutations";
import { useLeadBreadcrumbActions } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { BacklogDaySummary } from "./components/BacklogDaySummary";
import { BacklogQueue, type QueueView } from "./components/BacklogQueue";
import { CurrentStoryPanel } from "./components/CurrentStoryPanel";
import { RejectItemDrawer } from "./components/RejectItemDrawer";
import {
  validateDecision,
  type DecisionErrors,
  type DecisionValues,
} from "./components/backlogValidation";
import type { BacklogStory } from "./adapters/BacklogAdapter";
import type { RejectRequest } from "./services/backlogService";

const EMPTY: DecisionValues = { kind: "", initiativeId: "", bauCategory: "" };

function initialDecision(story: BacklogStory | null): DecisionValues {
  if (story?.suggestedInitiativeId) {
    return {
      kind: "Initiative",
      initiativeId: story.suggestedInitiativeId,
      bauCategory: "",
    };
  }
  return EMPTY;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable ||
    target.getAttribute("role") === "combobox" ||
    target.closest('[role="dialog"]') !== null
  );
}

export const BacklogContainer: React.FC = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const personFilterId = searchParams.get("persona");

  const [view, setView] = useState<QueueView>("pending");
  const [squadId, setSquadId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { catalogs } = useBacklogCatalogs();
  const filters = useMemo(
    () => ({
      squadId: squadId ?? undefined,
      personId: personFilterId ?? undefined,
      status:
        view === "pending" ? ("Pending" as const) : ("Classified" as const),
    }),
    [squadId, personFilterId, view]
  );
  const { items, summary, loading, error, refetch } = useBacklogQueue(
    filters,
    catalogs
  );
  const { classify, skip, undo, reject, saving } = useBacklogMutations();
  // Personas del chapter (para el nombre del filtro y las candidatas del rechazo).
  const overview = useCapacityOverview();

  const current: BacklogStory | null = useMemo(() => {
    if (view !== "pending") return null;
    return items.find((s) => s.id === selectedId) ?? items[0] ?? null;
  }, [items, selectedId, view]);

  // Formulario de decisión reiniciado por historia (design.md D6).
  const [decision, setDecision] = useState<DecisionValues>(() =>
    initialDecision(current)
  );
  const [errors, setErrors] = useState<DecisionErrors>({});
  const [decisionFor, setDecisionFor] = useState<string | null>(
    current?.id ?? null
  );
  if ((current?.id ?? null) !== decisionFor) {
    setDecisionFor(current?.id ?? null);
    setDecision(initialDecision(current));
    setErrors({});
  }

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectKey, setRejectKey] = useState(0);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const advance = () => {
    setSelectedId(null);
    refetch();
  };

  const handleSave = async () => {
    if (!current) return;
    const next = validateDecision(decision);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const result = await classify(current.id, {
      kind: decision.kind as Exclude<DecisionValues["kind"], "">,
      initiativeId: decision.initiativeId || undefined,
      bauCategory: decision.bauCategory || undefined,
    });
    if (result.success) {
      toast({
        message: "Historia clasificada",
        icon: <Icon name="status-success" size={16} />,
      });
      advance();
    } else {
      toast({ message: result.error ?? "No se pudo guardar" });
    }
  };

  const handleSkip = async () => {
    if (!current) return;
    const result = await skip(current.id);
    if (result.success) advance();
    else toast({ message: result.error ?? "No se pudo saltar" });
  };

  const handleUndo = async (story: BacklogStory) => {
    const result = await undo(story.id);
    if (result.success) {
      toast({
        message: "Vuelve a Por clasificar",
        icon: <Icon name="status-success" size={16} />,
      });
      refetch();
    } else {
      toast({ message: result.error ?? "No se pudo deshacer" });
    }
  };

  const openReject = () => {
    setRejectError(null);
    setRejectKey((k) => k + 1);
    setRejectOpen(true);
  };

  const handleReject = async (request: RejectRequest) => {
    if (!current) return;
    setRejectError(null);
    const result = await reject(current.id, request);
    if (result.success) {
      setRejectOpen(false);
      toast({
        message: "Historia rechazada",
        icon: <Icon name="status-success" size={16} />,
      });
      advance();
    } else {
      setRejectError(result.error ?? "No se pudo rechazar");
    }
  };

  // Atajos globales (design.md D5): fuera de campos de texto y sin drawer abierto.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (rejectOpen || !current || isTypingTarget(event.target)) return;
      if (event.key === "1") setDecision((d) => ({ ...d, kind: "Initiative" }));
      else if (event.key === "2") setDecision((d) => ({ ...d, kind: "Bau" }));
      else if (event.key === "3")
        setDecision((d) => ({ ...d, kind: "Discard" }));
      else if (event.key === "Enter") {
        event.preventDefault();
        void handleSave();
      } else if (event.key === "s" || event.key === "S") {
        event.preventDefault();
        void handleSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const personFilter = useMemo(() => {
    if (!personFilterId) return null;
    const p = overview.overview?.people.find((x) => x.id === personFilterId);
    return { id: personFilterId, name: p?.name ?? "…" };
  }, [personFilterId, overview.overview]);

  const candidates = useMemo(
    () =>
      (overview.overview?.people ?? [])
        .filter((p) => p.id !== current?.personId)
        .map((p) => ({ id: p.id, name: p.name })),
    [overview.overview, current?.personId]
  );

  const position = current
    ? items.findIndex((s) => s.id === current.id) + 1
    : 0;

  // Sin encabezado de módulo: el nombre de la pantalla ya lo da el breadcrumb
  // del shell, y el resumen del día sube a esa misma franja, a la derecha,
  // para que la cola y la historia en curso arranquen arriba. Sin resumen
  // (primera carga) se publica null: la franja queda sólo con el breadcrumb
  // y no salta de altura cuando el resumen llega.
  useLeadBreadcrumbActions(
    summary ? <BacklogDaySummary summary={summary} /> : null
  );

  return (
    <div className="flex flex-col gap-3">
      {error && !loading && (
        <Alert
          variant="danger"
          title="No se pudo cargar el backlog"
          action={
            <Button variant="secondary" size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && !summary && (
        <p className="text-body-sm text-neutral-subtle">Cargando el backlog…</p>
      )}

      {summary && (
        <div className="grid items-start gap-3 lg:grid-cols-[22rem_1fr]">
          <BacklogQueue
            items={items}
            summary={summary}
            currentId={current?.id ?? null}
            view={view}
            onViewChange={(v) => {
              setView(v);
              setSelectedId(null);
            }}
            squadId={squadId}
            onSquadChange={(id) => {
              setSquadId(id);
              setSelectedId(null);
            }}
            personFilter={personFilter}
            onClearPerson={() => setSearchParams({})}
            onSelect={(story) => setSelectedId(story.id)}
            onUndo={handleUndo}
          />
          {view === "pending" ? (
            <CurrentStoryPanel
              story={current}
              position={position}
              total={items.length}
              catalogs={catalogs}
              values={decision}
              errors={errors}
              onChange={(values) => {
                setDecision(values);
                setErrors({});
              }}
              onSave={handleSave}
              onSkip={handleSkip}
              onReject={openReject}
              saving={saving}
              onShowClassified={() => setView("classified")}
              hasFilter={squadId !== null || personFilterId !== null}
              onClearFilter={() => {
                setSquadId(null);
                setSearchParams({});
              }}
            />
          ) : (
            <section className="rounded-surface border border-neutral-default bg-neutral-default p-5 text-body-sm text-neutral-subtle">
              Las historias clasificadas y rechazadas de este filtro están a la
              izquierda, con su resultado.{" "}
              <b className="text-neutral-default">Deshacer</b> las devuelve a
              Por clasificar sin su clasificación.
            </section>
          )}
        </div>
      )}

      {current && rejectOpen && (
        <RejectItemDrawer
          key={rejectKey}
          open={rejectOpen}
          onOpenChange={setRejectOpen}
          story={current}
          catalogs={catalogs}
          candidates={candidates}
          saving={saving}
          serverError={rejectError}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
};
