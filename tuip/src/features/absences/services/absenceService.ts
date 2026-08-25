import { httpClient } from "@shared/services/httpClient";

/**
 * Ausencias del chapter. El backend todavía no las conoce: el contrato lo
 * fija el mock, con los días y los impactos calculados del lado del dato
 * (design.md) para que `add-provider-billing` los consuma tal cual.
 */

export type AbsenceType = "Vacation" | "Leave" | "SickLeave";
export type AbsenceStatus = "Requested" | "Approved" | "Rejected";

/** Reparto del impacto de una ausencia sobre una célula, para el mes pedido. */
export interface AbsenceSquadImpactDto {
  squadId: string;
  squadName: string;
  dedicationPct: number;
  /** FTE del mes que la célula pierde por esta ausencia (fracción, no %). */
  fteImpact: number;
}

export interface AbsenceDto {
  id: string;
  personId: string;
  personName: string;
  /** Nombre del proveedor cuando la persona es de un tercero; null = planta. */
  providerName: string | null;
  type: AbsenceType;
  /** ISO date, primer día ausente. */
  startDate: string;
  /** ISO date, último día ausente (incluido). */
  endDate: string;
  /** Días hábiles (L–V) del rango completo. */
  businessDays: number;
  status: AbsenceStatus;
  rejectReason: string | null;
  /** Días hábiles del rango que caen dentro del mes pedido. */
  businessDaysInMonth: number;
  /** Impactos sobre el mes pedido, uno por célula de la persona. */
  squadImpacts: AbsenceSquadImpactDto[];
}

/** Respuesta del listado mensual: las ausencias que tocan el mes. */
export interface AbsencesMonthDto {
  /** El mes pedido, "YYYY-MM". */
  month: string;
  /** Días hábiles (L–V) del mes completo — el denominador de los impactos. */
  monthBusinessDays: number;
  items: AbsenceDto[];
}

export interface CreateAbsenceRequest {
  personId: string;
  type: AbsenceType;
  startDate: string;
  endDate: string;
}

const ABSENCES_URL = "/absences";

export const absenceService = {
  getByMonth: async (month: string): Promise<AbsencesMonthDto> => {
    const response = await httpClient.get<AbsencesMonthDto>(ABSENCES_URL, {
      params: { month },
    });
    return response.data;
  },

  create: async (request: CreateAbsenceRequest): Promise<AbsenceDto> => {
    const response = await httpClient.post<AbsenceDto>(ABSENCES_URL, request);
    return response.data;
  },

  approve: async (id: string): Promise<AbsenceDto> => {
    const response = await httpClient.put<AbsenceDto>(
      `${ABSENCES_URL}/${id}/status`,
      { status: "Approved" }
    );
    return response.data;
  },

  reject: async (id: string, reason: string): Promise<AbsenceDto> => {
    const response = await httpClient.put<AbsenceDto>(
      `${ABSENCES_URL}/${id}/status`,
      { status: "Rejected", reason }
    );
    return response.data;
  },
};
