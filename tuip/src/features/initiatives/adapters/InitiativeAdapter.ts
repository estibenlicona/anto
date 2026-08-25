import type { BadgeVariant, TagColor } from "@tuya-ui/components";
import type {
  InitiativeDto,
  InitiativeEvaluationDto,
  InitiativeStatus,
} from "../services/initiativeService";

/** La ruta de la evaluación de una iniciativa: la comparten Iniciativas y Células. */
export const evaluationPath = (id: string) =>
  `/app/lead/iniciativas/${id}/evaluacion`;

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

export interface Initiative extends InitiativeDto {
  statusLabel: string;
  statusVariant: BadgeVariant;
  talla: string | null;
  tallaColor: TagColor;
  fteText: string;
  plazoText: string;
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
      fteText: ev ? fteText(ev.fteExpected) : "—",
      plazoText: `${dto.targetMonths} m`,
      // Dos condiciones: sin evaluar no hay nada que activar, y una célula
      // sostiene un solo trabajo a la vez.
      canActivate:
        dto.status !== "Active" && ev !== null && !dto.squadHasOtherActive,
      canClose: dto.status === "Active",
    };
  },
};
