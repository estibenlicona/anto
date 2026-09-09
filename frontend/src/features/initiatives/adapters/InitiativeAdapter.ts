import type { BadgeVariant, TagColor } from "@tuya-ui/components";
import { modulePath } from "@shared/services/modulePath";
import type {
  InitiativeDto,
  InitiativeEvaluationDto,
  InitiativeStatus,
} from "../services/initiativeService";

/**
 * La ficha de una iniciativa (`iniciativas/:id`): el destino de su nombre,
 * desde el listado y desde el detalle de la célula.
 */
export const initiativePath = (id: string) => modulePath(`iniciativas/${id}`);

/**
 * La ruta de la evaluación de una iniciativa (`iniciativas/:id/evaluacion`,
 * relativa a la base del módulo): la comparten Iniciativas y Células.
 */
export const evaluationPath = (id: string) =>
  modulePath(`iniciativas/${id}/evaluacion`);

export const STATUS_LABELS: Record<InitiativeStatus, string> = {
  Evaluating: "En evaluación",
  Active: "Activa",
  Closed: "Cerrada",
};

/**
 * Un color por estado, y los tres distintos entre sí.
 *
 * "En evaluación" y "Cerrada" compartían el neutro, y son los dos extremos
 * del ciclo: una espera evaluación y la otra ya terminó. Con el mismo color,
 * distinguirlas dependía de leer la etiqueta.
 *
 * "En evaluación" toma el rol de información, el mismo con el que la
 * evaluación de una persona se marca "En curso": algo en proceso se dice
 * igual en las dos pantallas. "Cerrada" se queda en neutro, que es lo que le
 * corresponde a un estado terminal que no pide nada.
 */
export const STATUS_VARIANTS: Record<InitiativeStatus, BadgeVariant> = {
  Evaluating: "info",
  Active: "success",
  Closed: "neutral",
};

/**
 * La talla es una categoría, no un estado: se viste con `Tag` (sin punto) y
 * un matiz del reparto categórico que crece con la talla. No hay colores
 * locales.
 */
export const TALLA_COLORS: Record<string, TagColor> = {
  XS: "gray",
  S: "green",
  M: "amber",
  L: "purple",
  XL: "red",
};

export function tallaColor(talla: string): TagColor {
  return TALLA_COLORS[talla] ?? "gray";
}

/** El mismo matiz del Tag, como color de texto e ícono (tokens semánticos de tuip). */
const TEXT_BY_COLOR: Record<TagColor, string> = {
  gray: "text-neutral-subtle",
  green: "text-success-default",
  blue: "text-info-default",
  amber: "text-warning-default",
  red: "text-danger-default",
  purple: "text-discovery-default",
};

export function tallaTextClass(talla: string): string {
  return TEXT_BY_COLOR[tallaColor(talla)];
}

/**
 * La camiseta crece con la talla: de 0,7× (XS) a 1,1× (XL) sobre el ícono de
 * 20 px. Icon sólo admite sus cuatro tamaños; el resto es una escala.
 */
export function tallaIconScale(talla: string): number {
  const order = Object.keys(TALLA_COLORS);
  const index = Math.max(0, order.indexOf(talla));
  return 0.7 + index * 0.1;
}

export const fteText = (value: number) =>
  value.toLocaleString("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const monthsText = (months: number) =>
  `${months} ${months === 1 ? "mes" : "meses"}`;

/**
 * El punto medio de la banda de PM, que es lo que el motor ya usa para el FTE
 * (`(pmMin + pmMax) / 2 / meses`). El listado lo muestra al lado del FTE
 * porque son dos lecturas distintas: el esfuerzo no depende del plazo y la
 * capacidad sí, y con sólo el FTE a la vista esa diferencia no se ve.
 */
export const pmExpectedText = (min: number, max: number) =>
  ((min + max) / 2).toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

/**
 * Lo único que le falta a la iniciativa para avanzar, que es distinto de
 * "todo lo que se le puede hacer" —eso vive en el menú de la fila—. Sin esta
 * columna la acción principal de cada fila queda escondida detrás de los tres
 * puntos, y sin evaluar era además la única forma de llegar a la evaluación.
 */
export type InitiativeNextStep =
  | { kind: "evaluate"; label: string }
  | { kind: "activate"; label: string }
  | { kind: "close"; label: string }
  | { kind: "none" };

export function nextStepOf(dto: InitiativeDto): InitiativeNextStep {
  if (dto.evaluation === null) return { kind: "evaluate", label: "Evaluar" };
  if (dto.status === "Evaluating")
    return { kind: "activate", label: "Activar" };
  if (dto.status === "Active") return { kind: "close", label: "Cerrar" };
  return { kind: "none" };
}

export interface Initiative extends InitiativeDto {
  statusLabel: string;
  statusVariant: BadgeVariant;
  talla: string | null;
  tallaColor: TagColor;
  pmText: string;
  fteText: string;
  plazoText: string;
  nextStep: InitiativeNextStep;
  canActivate: boolean;
  canClose: boolean;
}

export const initiativeAdapter = {
  toEntity(dto: InitiativeDto): Initiative {
    const ev: InitiativeEvaluationDto | null = dto.evaluation;
    return {
      ...dto,
      statusLabel: STATUS_LABELS[dto.status],
      statusVariant: STATUS_VARIANTS[dto.status],
      talla: ev?.talla ?? null,
      tallaColor: tallaColor(ev?.talla ?? ""),
      pmText: ev ? pmExpectedText(ev.pmMin, ev.pmMax) : "—",
      fteText: ev ? fteText(ev.fteExpected) : "—",
      plazoText: `${dto.targetMonths} m`,
      nextStep: nextStepOf(dto),
      // Una sola condición: sin evaluar no hay nada que activar. Que la célula
      // tenga otras activas ya no importa: sostiene varias a la vez (change
      // estado-asignacion-celulas).
      canActivate: dto.status !== "Active" && ev !== null,
      canClose: dto.status === "Active",
    };
  },
};
