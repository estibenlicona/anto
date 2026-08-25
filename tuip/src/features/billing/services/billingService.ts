import { httpClient } from "@shared/services/httpClient";

/**
 * Revisión de **prefacturas** de terceros, mes vencido: la plataforma calcula
 * lo **esperado** (tarifa congelada − ausencias aprobadas + ajustes) y contra
 * eso se revisa lo que el proveedor propone cobrar por cada persona.
 *
 * Prefactura, no factura: una factura ya emitida se corrige por la vía
 * contable, mientras que una prefactura se objeta a tiempo. Nombrarlas igual
 * sugiere que la decisión llega tarde.
 *
 * La unidad es la **persona**, no el proveedor: quien valida gestiona
 * personas, y cada una se imputa a su propia célula, su centro de costos y su
 * orden de compra. El proveedor sigue presente como dato —es con quien se
 * reclama— pero no agrupa el recurso.
 *
 * El backend todavía no existe: el contrato lo fija el mock.
 */

/**
 * `Pending` es el esperado generado esperando la prefactura; `Received` la
 * prefactura recién registrada que nadie miró; `InReview` la que ya se está
 * revisando.
 */
export type BillingStatus =
  /** El esperado del período todavía no se generó para esta persona. */
  "None" | "Pending" | "Received" | "InReview" | "Approved" | "Objected";

/**
 * Motivos de un ajuste manual. Los días no laborados NO están: vienen de las
 * ausencias aprobadas y no se digitan (ver `absenceDiscount`).
 * `Overtime` es el ajuste típico hasta que exista el reporte de horas.
 */
export type AdjustmentReason = "Overtime" | "PartialEntry" | "Exit" | "Other";

/**
 * Hoy sólo COP. La diferencia se calcula contra un esperado en pesos, y
 * restar dos monedas sin una tasa trazada produce una cifra que parece válida
 * y no lo es. El tipo deja el lugar hecho para cuando exista la tasa.
 */
export type Currency = "COP";

export interface BillingAdjustmentDto {
  /** Entero con signo, en pesos: negativo descuenta. */
  amount: number;
  reason: AdjustmentReason;
  note: string;
}

/** El descuento derivado de las ausencias aprobadas de la persona en el período. */
export interface AbsenceDiscountDto {
  /** Días hábiles ausentes dentro del período. */
  businessDays: number;
  /** Monto descontado (positivo; se resta de la tarifa). */
  amount: number;
}

/**
 * A qué se carga esta prefactura. Todo `null`able salvo lo que el registro
 * exige: en la práctica el documento llega antes que la orden de compra, y
 * `null` es lo que permite distinguir un dato que falta de uno en blanco.
 */
export interface ImputationDto {
  /** Célula o CoE al que se carga el gasto. */
  costObject: string | null;
  concept: string | null;
  /** Nombre de la cuenta contable. */
  accountName: string | null;
  /** Número de la cuenta contable. */
  accountNumber: string | null;
  costCenter: string | null;
  purchaseOrder: string | null;
  /** Cuenta destinada al pago. */
  paymentAccount: string | null;
}

/** El documento que el proveedor propone cobrar por una persona. */
export interface PrefactureDocumentDto {
  number: string;
  /** ISO date en que se recibió la prefactura. */
  receivedAt: string;
  /** Valor total declarado en el documento. */
  amount: number;
  currency: Currency;
  imputation: ImputationDto;
}

/** Motivo de una objeción, trazado con la prefactura. */
export interface ObjectionDto {
  reason: string;
  objectedAtUtc: string;
}

/**
 * Una prefactura: una persona externa en un período. Tarifa, cargo y célula
 * quedan congelados al generar el esperado.
 */
export interface PrefactureDto {
  id: string;
  personId: string;
  personName: string;
  position: string;
  squadName: string | null;
  providerId: string;
  providerName: string;
  /** `YYYY-MM`. */
  period: string;
  status: BillingStatus;
  /** Tarifa mensual congelada al generar el esperado. */
  monthlyCost: number;
  /** Derivado de Ausencias, de sólo lectura acá. */
  absenceDiscount: AbsenceDiscountDto | null;
  adjustment: BillingAdjustmentDto | null;
  /** `monthlyCost − absenceDiscount + adjustment`. */
  expected: number;
  /** `null` mientras el esperado existe pero la prefactura no llegó. */
  document: PrefactureDocumentDto | null;
  /** Lo que el proveedor propone cobrar; `null` sin prefactura. */
  prefactured: number | null;
  /** `prefactured − expected`; `null` sin prefactura. Positivo = propone cobrar de más. */
  difference: number | null;
  /** La última objeción; sobrevive como historia cuando llega la corregida. */
  objection: ObjectionDto | null;
  /** Nota que justificó aprobar con diferencia distinta de cero. */
  approvalNote: string | null;
  createdAtUtc: string;
  approvedAtUtc: string | null;
}

export interface RegisterPrefactureRequest {
  number: string;
  receivedAt: string;
  amount: number;
  currency: Currency;
  imputation: ImputationDto;
}

const BASE = "/billing";

export const billingService = {
  listPeriod: async (period: string): Promise<PrefactureDto[]> => {
    const response = await httpClient.get<PrefactureDto[]>(
      `${BASE}?period=${encodeURIComponent(period)}`
    );
    return response.data;
  },

  generate: async (period: string): Promise<PrefactureDto[]> => {
    const response = await httpClient.post<PrefactureDto[]>(
      `${BASE}/generate`,
      { period }
    );
    return response.data;
  },

  get: async (id: string): Promise<PrefactureDto> => {
    const response = await httpClient.get<PrefactureDto>(`${BASE}/${id}`);
    return response.data;
  },

  /** Registra la prefactura recibida. Sobre una objetada, la devuelve a `Received`. */
  registerPrefacture: async (
    id: string,
    document: RegisterPrefactureRequest
  ): Promise<PrefactureDto> => {
    const response = await httpClient.post<PrefactureDto>(
      `${BASE}/${id}/prefacture`,
      document
    );
    return response.data;
  },

  setPrefactured: async (
    id: string,
    prefactured: number
  ): Promise<PrefactureDto> => {
    const response = await httpClient.put<PrefactureDto>(
      `${BASE}/${id}/prefactured`,
      { prefactured }
    );
    return response.data;
  },

  adjust: async (
    id: string,
    adjustment: BillingAdjustmentDto
  ): Promise<PrefactureDto> => {
    const response = await httpClient.put<PrefactureDto>(
      `${BASE}/${id}/adjustment`,
      adjustment
    );
    return response.data;
  },

  removeAdjustment: async (id: string): Promise<PrefactureDto> => {
    const response = await httpClient.delete<PrefactureDto>(
      `${BASE}/${id}/adjustment`
    );
    return response.data;
  },

  /** `note` es obligatoria cuando la diferencia no es cero. */
  approve: async (id: string, note?: string): Promise<PrefactureDto> => {
    const response = await httpClient.put<PrefactureDto>(
      `${BASE}/${id}/status`,
      { status: "Approved", note }
    );
    return response.data;
  },

  /** `reason` es obligatorio y queda trazado. */
  object: async (id: string, reason: string): Promise<PrefactureDto> => {
    const response = await httpClient.put<PrefactureDto>(
      `${BASE}/${id}/status`,
      { status: "Objected", reason }
    );
    return response.data;
  },
};
