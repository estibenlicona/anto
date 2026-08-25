import type { BadgeVariant } from "@tuya-ui/components";
import type {
  AdjustmentReason,
  BillingStatus,
  ImputationDto,
  PrefactureDto,
} from "../services/billingService";

export const STATUS_LABELS: Record<BillingStatus, string> = {
  None: "Sin esperado",
  Pending: "Sin prefactura",
  Received: "Recibida",
  InReview: "En revisión",
  Approved: "Aprobada",
  Objected: "Objetada",
};

export const STATUS_VARIANTS: Record<BillingStatus, BadgeVariant> = {
  None: "neutral",
  Pending: "neutral",
  Received: "info",
  InReview: "warning",
  Approved: "success",
  Objected: "danger",
};

// Los días no laborados ya no se digitan: vienen de las ausencias aprobadas.
export const REASON_LABELS: Record<AdjustmentReason, string> = {
  Overtime: "Horas extra",
  PartialEntry: "Ingreso parcial",
  Exit: "Retiro",
  Other: "Otro",
};

export const REASON_OPTIONS = (
  Object.keys(REASON_LABELS) as AdjustmentReason[]
).map((value) => ({ value, label: REASON_LABELS[value] }));

/** Pesos, separador de miles, sin decimales. */
export const money = (n: number) =>
  n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

/** Con signo explícito, para ajustes. */
export const signedMoney = (n: number) => (n > 0 ? `+${money(n)}` : money(n));

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "2026-08" → "agosto 2026". */
export function periodLabel(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return `${MONTHS[(m ?? 1) - 1] ?? period} ${y}`;
}

/**
 * Mes vencido: el período por defecto es el mes en curso, calculado y no
 * fijo, para que la pantalla no quede anclada a un mes viejo.
 */
export function currentPeriod(today: Date = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

/** El mes dado y los anteriores, del más reciente al más viejo. */
export function availablePeriods(current: string, count = 6): string[] {
  const [y, m] = current.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

/**
 * Severidad de la diferencia: en cero es conforme, distinta de cero pide
 * mirada. No es decorativa — es la señal de la pantalla.
 */
export function differenceTone(
  difference: number | null
): "none" | "ok" | "over" | "under" {
  if (difference === null) return "none";
  if (difference === 0) return "ok";
  return difference > 0 ? "over" : "under";
}

/** Las novedades que sustentan el esperado de una prefactura. */
export function noveltiesText(p: PrefactureDto): string {
  const days = p.absenceDiscount?.businessDays ?? 0;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "día" : "días"} ausencia`);
  if (p.adjustment?.reason === "Overtime") parts.push("horas extra");
  return parts.length > 0 ? parts.join(" · ") : "—";
}

/**
 * Los datos de imputación en el orden en que se leen, con su rótulo. Un valor
 * `null` es un dato que nadie llenó, y la interfaz tiene que distinguirlo de
 * uno en blanco: en un control de ejecución se leen igual y no son lo mismo.
 */
export const IMPUTATION_FIELDS: { key: keyof ImputationDto; label: string }[] =
  [
    { key: "costObject", label: "Célula o CoE" },
    { key: "concept", label: "Concepto" },
    { key: "accountName", label: "Cuenta contable" },
    { key: "accountNumber", label: "Número de cuenta contable" },
    { key: "costCenter", label: "Centro de costos" },
    { key: "purchaseOrder", label: "Orden de compra" },
    { key: "paymentAccount", label: "Cuenta destinada al pago" },
  ];

/** Cuántos datos de imputación quedaron sin llenar. */
export function missingImputationCount(p: PrefactureDto): number {
  if (!p.document) return IMPUTATION_FIELDS.length;
  return IMPUTATION_FIELDS.filter((f) => !p.document!.imputation[f.key]).length;
}

export interface BillingRow extends PrefactureDto {
  statusLabel: string;
  statusVariant: BadgeVariant;
  prefacturedText: string;
  expectedText: string;
  differenceText: string;
  differenceTone: "none" | "ok" | "over" | "under";
  noveltiesText: string;
  /** Célula o CoE imputado; cae en la célula congelada mientras no se registre. */
  costObjectText: string;
  missingImputation: number;
  canRegisterPrefacture: boolean;
  canApprove: boolean;
  canObject: boolean;
}

export interface BillingPeriodStats {
  /** Prefacturas registradas en el mes — la unidad es la persona. */
  prefactureCount: number;
  /** Recibidas o en revisión: las que esperan decisión. */
  toReviewCount: number;
  objectedCount: number;
  prefactured: number;
  expected: number;
  difference: number;
  absenceDays: number;
  overtimeCount: number;
}

/** Revisable = la prefactura llegó y todavía no se aprobó ni objetó. */
function isReviewable(p: PrefactureDto): boolean {
  return p.status === "Received" || p.status === "InReview";
}

export const billingAdapter = {
  toRow(dto: PrefactureDto): BillingRow {
    const difference = dto.difference;
    return {
      ...dto,
      statusLabel: STATUS_LABELS[dto.status],
      statusVariant: STATUS_VARIANTS[dto.status],
      prefacturedText: dto.prefactured != null ? money(dto.prefactured) : "—",
      expectedText: money(dto.expected),
      differenceText:
        difference === null
          ? "—"
          : difference === 0
            ? money(0)
            : signedMoney(difference),
      differenceTone: differenceTone(difference),
      noveltiesText: noveltiesText(dto),
      // Mientras no se registre la prefactura, lo imputado es la célula con la
      // que se congeló el esperado: es la mejor respuesta disponible, y no un
      // guion que haría pensar que no se sabe.
      costObjectText:
        dto.document?.imputation.costObject ?? dto.squadName ?? "—",
      missingImputation: missingImputationCount(dto),
      // La objetada acepta la corregida.
      canRegisterPrefacture:
        dto.status !== "None" &&
        (dto.document === null || dto.status === "Objected"),
      canApprove: isReviewable(dto),
      canObject: isReviewable(dto),
    };
  },

  stats(rows: PrefactureDto[]): BillingPeriodStats {
    const withDocument = rows.filter((p) => p.document !== null);
    const prefactured = withDocument.reduce(
      (a, p) => a + (p.prefactured ?? 0),
      0
    );
    // El esperado del mes se lee contra lo prefacturado: sólo suma el de las
    // prefacturas que llegaron, o la comparación mezclaría peras con manzanas.
    const expected = withDocument.reduce((a, p) => a + p.expected, 0);
    return {
      prefactureCount: withDocument.length,
      toReviewCount: rows.filter(isReviewable).length,
      objectedCount: rows.filter((p) => p.status === "Objected").length,
      prefactured,
      expected,
      difference: prefactured - expected,
      absenceDays: rows.reduce(
        (a, p) => a + (p.absenceDiscount?.businessDays ?? 0),
        0
      ),
      overtimeCount: rows.filter((p) => p.adjustment?.reason === "Overtime")
        .length,
    };
  },
};
