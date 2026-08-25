import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Icon,
  Skeleton,
  Tag,
  useToast,
} from "@tuya-ui/components";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { useAssessment } from "./hooks/useAssessment";
import { firstToWorkOn, previewGap } from "./adapters/AssessmentAdapter";
import { AssessmentHeader } from "./components/AssessmentHeader";
import { AssessmentIndex } from "./components/AssessmentIndex";
import { CloseAssessmentDialog } from "./components/CloseAssessmentDialog";
import { SkillLevelPicker } from "./components/SkillLevelPicker";
import { GapBlock } from "./components/GapBlock";
import type { SkillLevel } from "@features/skills/services/skillsService";

/** Lo que se está editando de la habilidad abierta, antes de guardarlo. */
interface Draft {
  level: SkillLevel | null;
  /** Textos marcados por nivel; índice 0..3 = niveles 1..4. */
  met: string[][];
  note: string;
}

export const AssessmentContainer: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { assessment, loading, error, saving, open, saveSkill, close } =
    useAssessment(id);

  // Tercer nivel del breadcrumb: la persona a quien se evalúa, igual que en
  // su detalle — se evalúa a alguien, no se "hace una evaluación".
  useLeadBreadcrumbTrailing(
    assessment ? `${assessment.personName} · evaluación` : null
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [confirmingClose, setConfirmingClose] = useState(false);

  // La habilidad abierta se deriva: al entrar es la primera sin evaluar, y si
  // la elegida ya no está en el alcance, cae a esa misma.
  const currentId =
    assessment?.skills.find((s) => s.skillId === selectedId)?.skillId ??
    (assessment ? firstToWorkOn(assessment) : null);
  const current =
    assessment?.skills.find((s) => s.skillId === currentId) ?? null;

  // El borrador arranca de lo guardado y se descarta al cambiar de habilidad.
  const saved = useMemo<Draft | null>(
    () =>
      current
        ? {
            level: current.level,
            met: current.levels.map((l) =>
              l.criteria.filter((c) => c.met).map((c) => c.text)
            ),
            note: current.note,
          }
        : null,
    [current]
  );
  const working = draft ?? saved;

  const index =
    assessment?.skills.findIndex((s) => s.skillId === currentId) ?? -1;
  const total = assessment?.skills.length ?? 0;

  const goTo = (skillId: string) => {
    setSelectedId(skillId);
    setDraft(null);
    setNoteError(null);
  };

  const step = (delta: number) => {
    if (!assessment || index < 0) return;
    const next = assessment.skills[index + delta];
    if (next) goTo(next.skillId);
  };

  const setLevel = (level: SkillLevel) =>
    setDraft({ ...(working as Draft), level });

  const toggleCriterion = (
    level: SkillLevel,
    criterion: string,
    met: boolean
  ) => {
    if (!working) return;
    const next = working.met.map((list, i) =>
      i === level - 1
        ? met
          ? [...list, criterion]
          : list.filter((c) => c !== criterion)
        : list
    );
    setDraft({ ...working, met: next });
  };

  /**
   * La brecha que se muestra y se exige es la del borrador, no la de lo último
   * guardado: se arma mientras se decide, que es el punto de la pantalla.
   */
  const gap =
    current && working ? previewGap(current, working.level, working.met) : null;
  const draftHasGap = gap?.gapState === "gap";

  const persist = async (): Promise<boolean> => {
    if (!current || !working || working.level === null) return false;
    if (draftHasGap && working.note.trim().length === 0) {
      setNoteError("Con brecha la nota es obligatoria.");
      return false;
    }
    const result = await saveSkill(current.skillId, {
      level: working.level,
      met: working.met,
      note: working.note,
    });
    if (result.success) {
      setDraft(null);
      setNoteError(null);
      return true;
    }
    setNoteError(result.error ?? null);
    return false;
  };

  const saveAndNext = async () => {
    if (await persist()) step(1);
  };

  /**
   * Lo que ocurre al pedir cerrar: no cierra, pide confirmación. Antes de
   * ofrecerla comprueba que el cierre pueda efectivamente ocurrir — confirmar
   * algo que va a fallar es peor que no preguntar.
   */
  const requestClose = async () => {
    setCloseError(null);
    // Lo que está en pantalla sin guardar cuenta: cerrar con un nivel elegido
    // pero no persistido diría que falta una habilidad que en realidad está.
    if (draft && working?.level != null && !(await persist())) {
      // El motivo real queda junto al campo, allá abajo. Acá se repite el
      // porqué: el botón está arriba y sin esto el cierre parece no hacer nada.
      setCloseError(
        `No se pudo cerrar: ${current?.skillName} quedó sin guardar. Revisa lo que falta más abajo.`
      );
      return;
    }

    // Con habilidades sin nivel el cierre no procede, y eso se sabe acá: el
    // adapter ya trae cuáles faltan. Decirlo antes evita una confirmación que
    // sólo llevaría a un error.
    if (assessment && !assessment.complete) {
      setCloseError(
        `Faltan por evaluar: ${assessment.pendingNames.join(", ")}.`
      );
      return;
    }

    setConfirmingClose(true);
  };

  const confirmClose = async () => {
    const result = await close();
    setConfirmingClose(false);
    if (result.success) {
      toast({
        message: "Evaluación cerrada",
        icon: <Icon name="status-success" size={16} />,
      });
      return;
    }
    // El servidor sigue siendo la última palabra: si rechaza el cierre por un
    // motivo que la pantalla no vio, se dice tal cual.
    setCloseError(result.error ?? null);
  };

  const backToPerson = () => navigate(`/app/lead/personas/${id}`);

  /**
   * Abre una evaluación nueva sobre la cerrada. La anterior queda como
   * historia: es lo que el sistema entiende por corregir.
   */
  const reopen = async () => {
    setCloseError(null);
    const result = await open();
    if (result.success) {
      setSelectedId(null);
      setDraft(null);
      toast({
        message: "Evaluación nueva abierta",
        icon: <Icon name="status-success" size={16} />,
      });
      return;
    }
    setCloseError(result.error ?? null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!assessment) {
    return (
      <EmptyState
        icon={<Icon name="expertise" size={32} />}
        title="Esta persona todavía no tiene evaluación"
        description="La evaluación recorre las habilidades activas del catálogo y deja registrado el nivel y los criterios que cumple."
        action={
          <Button variant="primary" isLoading={saving} onClick={() => open()}>
            Abrir evaluación
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <AssessmentHeader
        assessment={assessment}
        saving={saving}
        onClose={requestClose}
        onLeave={backToPerson}
      />

      {assessment.readOnly && (
        <Alert
          variant="info"
          /*
            La salida va dentro del aviso que enuncia la regla: decir "se
            evalúa de nuevo" sin ofrecer hacerlo deja la regla sin forma de
            cumplirse, y es lo único que puede mover una brecha.
          */
          action={
            <Button
              variant="secondary"
              size="small"
              isLoading={saving}
              onClick={reopen}
            >
              Evaluar de nuevo
            </Button>
          }
        >
          Cerrada con la versión {assessment.catalogVersion} del catálogo. No se
          corrige: si algo cambió, se evalúa de nuevo.
        </Alert>
      )}

      {closeError && <Alert variant="danger">{closeError}</Alert>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <AssessmentIndex
          assessment={assessment}
          currentSkillId={currentId}
          onSelect={goTo}
        />

        {current && working && (
          <Card className="space-y-6 p-6">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-heading-md text-neutral-default">
                  {current.skillName}
                </h2>
                <Tag>{current.group === "human" ? "Humana" : "Técnica"}</Tag>
              </div>
              {/*
                Las dos variantes juntas y acá: es donde ya se decide entre
                "el cargo declara nivel" y "no lo declara", y separarlas haría
                que la próxima corrección de texto tocara dos lugares. El
                nombre del cargo sale del dato tal cual — cómo se llama un cargo
                es del catálogo, no de esta pantalla.
              */}
              <p className="mt-1 text-body-sm text-neutral-subtle">
                {current.expectedLevel === null
                  ? `El cargo de ${assessment.position} no requiere un nivel en esta habilidad.`
                  : `El cargo de ${assessment.position} requiere un nivel ${current.expectedLabel} en esta habilidad.`}
              </p>
            </header>

            <SkillLevelPicker
              skill={{
                ...current,
                level: working.level,
                levels: current.levels.map((l) => ({
                  ...l,
                  criteria: l.criteria.map((c) => ({
                    ...c,
                    met: working.met[l.level - 1].includes(c.text),
                  })),
                  metCount: working.met[l.level - 1].length,
                  counterLabel:
                    l.total === 0
                      ? "Sin criterios"
                      : `cumple ${working.met[l.level - 1].length} de ${l.total}`,
                })),
              }}
              readOnly={assessment.readOnly}
              onLevelChange={setLevel}
              onCriterionToggle={toggleCriterion}
            />

            <GapBlock
              skill={{ ...current, ...gap! }}
              note={working.note}
              readOnly={assessment.readOnly}
              error={noteError}
              onNoteChange={(note) => setDraft({ ...working, note })}
            />

            {!assessment.readOnly && (
              <footer className="flex items-center justify-between gap-3 border-t-default border-neutral-default pt-4">
                <Button
                  variant="subtle"
                  disabled={index <= 0}
                  onClick={() => step(-1)}
                >
                  Anterior
                </Button>
                <span className="text-body-sm text-neutral-subtle">
                  Habilidad {index + 1} de {total}
                </span>
                <Button
                  variant="secondary"
                  isLoading={saving}
                  disabled={working.level === null}
                  onClick={saveAndNext}
                >
                  Guardar y siguiente
                </Button>
              </footer>
            )}
          </Card>
        )}
      </div>

      <CloseAssessmentDialog
        assessment={assessment}
        open={confirmingClose}
        saving={saving}
        onOpenChange={setConfirmingClose}
        onConfirm={confirmClose}
      />
    </div>
  );
};
