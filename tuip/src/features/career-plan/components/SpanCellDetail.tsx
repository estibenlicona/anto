import React from "react";
import { Avatar, Button, Icon, Link, Skeleton } from "@tuya-ui/components";
import type { PersonPlanView } from "../adapters/PersonPlanAdapter";
import type {
  SpanCellView,
  SpanPersonView,
} from "../adapters/SpanMatrixAdapter";
import { PlanSkillMeter } from "./PlanSkillMeter";

interface SpanCellDetailProps {
  person: SpanPersonView;
  cell: SpanCellView;
  /** El plan de esa persona; `null` mientras se pide. */
  plan: PersonPlanView | null;
  loading: boolean;
  error: string | null;
  onOpenPlan: () => void;
  onOpenSkill: () => void;
  onAssess: () => void;
  /** Cierra el panel. Vive en la columna, así que se cierra desde su propio encabezado. */
  onClose: () => void;
}

/** Tres alcanzan para hacer concreta la conversación; el resto está en el plan. */
const CRITERIA_SHOWN = 3;

/**
 * Cada bloque lleva su propia línea arriba en vez de resolverlo con `divide`:
 * las utilidades de color del sistema llegan pre-generadas del paquete, y
 * `divide-*` no está entre ellas.
 */
const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-t-default border-neutral-default px-4 py-3 first:border-t-0">
    {children}
  </div>
);

/**
 * El detalle de una celda. No repite lo que el color ya dijo: agrega lo que el
 * mapa no puede mostrar —de quién es y de cuándo, cuánto le falta, qué
 * exactamente le falta, qué tan sola está esa persona en esa habilidad, y qué
 * se está haciendo al respecto—. Sin eso el clic no valdría la pena.
 */
export const SpanCellDetail: React.FC<SpanCellDetailProps> = ({
  person,
  cell,
  plan,
  loading,
  error,
  onOpenPlan,
  onOpenSkill,
  onAssess,
  onClose,
}) => {
  const skill = plan?.skills.find((s) => s.skillId === cell.skillId) ?? null;
  const action = plan?.actions.find((a) => a.skillId === cell.skillId) ?? null;

  return (
    <div className="flex flex-col">
      <Section>
        <div className="flex items-center gap-3">
          <Avatar
            size="small"
            label={person.personName}
            colorId={person.personId}
          >
            {person.initials}
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-body font-semibold text-neutral-default">
              {person.personName}
            </p>
            <p className="text-body-sm text-neutral-subtle">
              {person.position}
              {/* La evaluación lleva fecha a propósito: una brecha de hace un
                  año no es lo mismo que una de este mes. */}
              {plan?.assessedOnLabel
                ? ` · evaluada el ${plan.assessedOnLabel}`
                : ""}
            </p>
          </div>
          {/* El panel vive en la columna, no flota: si no trae su propio
              cierre, la única salida es la tecla Escape. */}
          <Button
            variant="subtle"
            size="small"
            aria-label="Cerrar el detalle"
            onClick={onClose}
          >
            <Icon name="close" size={16} />
          </Button>
        </div>
        <p className="mt-3 text-body-sm font-semibold text-neutral-default">
          {cell.skillName}
        </p>
      </Section>

      {cell.state === "unevaluated" ? (
        <Section>
          <p className="text-body-sm text-neutral-subtle">
            {person.personName} no tiene ninguna evaluación cerrada, así que su
            fila entera está sin dato y no suma ni resta a los totales.
          </p>
          <Button
            variant="secondary"
            size="small"
            className="mt-3"
            onClick={onAssess}
          >
            Evaluar a {person.personName.split(" ")[0]}
          </Button>
        </Section>
      ) : (
        <>
          <Section>
            {loading && <Skeleton className="h-12 w-full" />}
            {error && (
              <p className="text-body-sm text-danger-default">{error}</p>
            )}
            {skill && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <PlanSkillMeter skill={skill} />
                  <span className="text-body-sm font-semibold text-neutral-default">
                    {skill.levelLabel}
                  </span>
                  <span
                    className={
                      cell.state === "gap"
                        ? "text-body-sm font-semibold text-danger-default"
                        : "text-body-sm text-neutral-subtle"
                    }
                  >
                    {skill.stateLabel}
                  </span>
                </div>

                {cell.expectedLabel !== null ? (
                  <p className="text-body-sm text-neutral-subtlest">
                    La marca es lo que su cargo pide: {cell.expectedLabel}.
                  </p>
                ) : (
                  // Sin nivel declarado no hay marca ni brecha: el hueco está
                  // en el catálogo, y se llena en Administración.
                  <p className="text-body-sm text-neutral-subtlest">
                    El cargo de {person.position} no declara nivel en esta
                    habilidad, así que no genera brecha. Se declara desde el
                    catálogo, en Administración.
                  </p>
                )}

                {/* Estar por encima no se pinta en el mapa —un color para eso
                    competiría con el rojo—, pero acá sí se dice: es quien puede
                    acompañar a los que están cortos. */}
                {cell.exceeds && (
                  <p className="text-body-sm text-neutral-subtle">
                    Está por encima de lo que su cargo pide — puede acompañar a
                    quien esté corto acá.
                  </p>
                )}
              </div>
            )}
          </Section>

          {skill?.missingGroup && (
            <Section>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-body-sm font-semibold text-neutral-default">
                  Le falta para {cell.expectedLabel}
                </p>
                <span className="text-body-sm tabular-nums text-neutral-subtle">
                  {skill.missingGroup.counterLabel}
                </span>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {skill.missingGroup.criteria
                  .slice(0, CRITERIA_SHOWN)
                  .map((criterion) => (
                    <li
                      key={criterion}
                      className="flex gap-2 text-body-sm text-neutral-subtle"
                    >
                      <span aria-hidden="true">·</span>
                      <span>{criterion}</span>
                    </li>
                  ))}
              </ul>
              {skill.missingGroup.criteria.length > CRITERIA_SHOWN && (
                <p className="mt-1 text-body-sm text-neutral-subtlest">
                  y {skill.missingGroup.criteria.length - CRITERIA_SHOWN} más
                </p>
              )}
            </Section>
          )}

          {cell.state === "gap" && (
            <Section>
              {/* Es la diferencia que decide qué hacer a continuación: un
                  nivel se cierra en el trabajo real; dos o más no se cierran
                  solos por mucho acompañamiento que haya. */}
              <p className="text-body-sm text-neutral-subtle">
                {(cell.gap ?? 0) >= 2
                  ? `Brecha de ${cell.gap} niveles: requiere un plan formal, no sólo acompañamiento en la operación.`
                  : "Brecha de un nivel: se cierra con acompañamiento en trabajo real."}
              </p>
              {/* El número sale del mismo cálculo que el pie de la columna:
                  una persona corta se acompaña, cinco cortas es un problema
                  del chapter y se resuelve distinto. */}
              <p className="mt-2 text-body-sm text-neutral-subtle">
                {cell.columnGapCount === 1
                  ? "Es la única persona del span con brecha acá."
                  : `${cell.columnGapCount} personas del span tienen brecha acá.`}
              </p>
            </Section>
          )}

          {cell.state === "gap" && skill && (
            <Section>
              {action ? (
                <div className="flex flex-col gap-1">
                  <p className="text-body-sm font-semibold text-neutral-default">
                    Con plan
                  </p>
                  <p className="text-body-sm text-neutral-subtle">
                    {action.title} · {action.dueLabel}
                  </p>
                </div>
              ) : (
                // Lo accionable de la pantalla: una brecha sin acción es la que
                // todavía no tiene a nadie haciéndose cargo.
                <p className="text-body-sm text-neutral-subtle">
                  Sin ninguna acción del plan sobre esta brecha.
                </p>
              )}
            </Section>
          )}
        </>
      )}

      {/* A sangre: el pie lleva su borde superior hasta el límite de la
          superficie, que es para lo que el Popover deja reemplazar el
          relleno. Enlaces neutros: con uno por celda, el rojo de marca
          aparecería ciento veintiséis veces sobre la misma tabla. */}
      <div className="flex items-center justify-between gap-2 border-t-default border-neutral-default bg-neutral-subtlest px-4 py-2">
        <Link
          tone="neutral"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenPlan();
          }}
        >
          Ver su plan
        </Link>
        <Link
          tone="neutral"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onOpenSkill();
          }}
        >
          Ver la habilidad
        </Link>
      </div>
    </div>
  );
};
