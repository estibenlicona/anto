import type {
  BillingAdjustmentDto,
  BillingStatus,
  PrefactureDocumentDto,
  ObjectionDto,
} from "@features/billing/services/billingService";

export const GFT = "c1111111-1111-1111-1111-111111111111";
export const TATA = "c2222222-2222-2222-2222-222222222222";
export const QVISION = "c3333333-3333-3333-3333-333333333333";

/**
 * Períodos relativos al mes corriente, como las semillas de ausencias: con
 * fechas fijas la pantalla se vaciaría al pasar el mes, y el descuento
 * derivado de las ausencias (que sí son relativas) no coincidiría con nada.
 * Mes vencido: en el mes en curso se revisa lo del mes en curso, y el anterior
 * ya está cerrado.
 */
function monthKey(offset: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export const CURRENT_PERIOD = monthKey(0);
export const PREVIOUS_PERIOD = monthKey(-1);

/** Día del mes anterior, para las fechas de recepción de las semillas. */
function dayOfPrevious(day: number): string {
  return `${PREVIOUS_PERIOD}-${String(day).padStart(2, "0")}`;
}

export interface BillingSeed {
  id: string;
  providerId: string;
  period: string;
  status: BillingStatus;
  /** Ajustes por nombre de persona; las líneas salen del mock de personas. */
  adjustments?: Record<string, BillingAdjustmentDto>;
  /**
   * Sin factura, el registro es sólo el esperado (estado `Pending`). El monto
   * es opcional: omitido, se toma la suma de las líneas facturadas — el caso
   * normal, en el que el documento cuadra con su propio desglose.
   */
  invoice?: Omit<
    PrefactureDocumentDto,
    "amount" | "currency" | "imputation"
  > & {
    amount?: number;
  };
  /** Centro de costos de la imputación; el mismo para las personas de esa semilla. */
  costCenter?: string;
  /**
   * Orden de compra. Ausente a propósito en el mes en curso: la prefactura
   * llega antes que la orden, y ése es el caso que prueba que un dato faltante
   * se distingue de uno en blanco.
   */
  purchaseOrder?: string;
  /** Facturado por persona cuando difiere de su tarifa; el resto factura completo. */
  invoicedOverrides?: Record<string, number>;
  objection?: ObjectionDto;
  approvalNote?: string;
  createdAtUtc: string;
}

/**
 * Mes anterior cerrado: GFT aprobada y QVision objetada. Mes en curso: el
 * esperado generado para los tres, con GFT en revisión facturando de más
 * (Carlos tiene una incapacidad aprobada que la factura no descontó — el caso
 * del diseño) y QVision todavía sin factura.
 */
export const BILLING_SEEDS: BillingSeed[] = [
  {
    id: "bill-prev-gft",
    providerId: GFT,
    period: PREVIOUS_PERIOD,
    status: "Approved",
    invoice: {
      number: "FE-2041",
      receivedAt: dayOfPrevious(5),
    },
    costCenter: "CC-1001",
    purchaseOrder: "OC-77120",
    createdAtUtc: `${PREVIOUS_PERIOD}-05T14:00:00Z`,
  },
  {
    id: "bill-prev-qvision",
    providerId: QVISION,
    period: PREVIOUS_PERIOD,
    status: "Objected",
    invoice: {
      number: "QV-8871",
      receivedAt: dayOfPrevious(6),
    },
    objection: {
      reason:
        "Facturaron a Camila completa: tuvo 4 días de permiso aprobados que no descontaron.",
      objectedAtUtc: `${PREVIOUS_PERIOD}-08T16:20:00Z`,
    },
    costCenter: "CC-2040",
    purchaseOrder: "OC-77135",
    createdAtUtc: `${PREVIOUS_PERIOD}-06T14:05:00Z`,
  },
  {
    id: "bill-cur-gft",
    providerId: GFT,
    period: CURRENT_PERIOD,
    status: "InReview",
    invoice: {
      number: "FE-2049",
      receivedAt: `${CURRENT_PERIOD}-05`,
    },
    createdAtUtc: `${CURRENT_PERIOD}-05T14:00:00Z`,
  },
];
