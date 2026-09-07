import type {
  AllocationDto,
  CreateAllocationRequest,
  UpdateAllocationRequest,
} from "../services/allocationService";
import type { Modality } from "@features/people/services/personService";

export interface Allocation {
  id: string;
  personId: string;
  personName: string;
  squadId: string;
  squadName: string;
  dedicationPercentage: number;
  bauPercentage: number;
  transformationPercentage: number;
  personPosition: string;
  personModality: Modality;
  personLevel: number;
  personLevelLabel: string;
  personAvailablePercentage: number;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}

export interface AllocationFormValues {
  personId: string;
  dedicationPercentage: string;
  bauPercentage: string;
  transformationPercentage: string;
}

export const emptyAllocationFormValues: AllocationFormValues = {
  personId: "",
  dedicationPercentage: "",
  bauPercentage: "",
  transformationPercentage: "",
};

export const allocationAdapter = {
  toEntity: (dto: AllocationDto): Allocation => ({
    id: dto.id,
    personId: dto.personId,
    personName: dto.personName,
    squadId: dto.squadId,
    squadName: dto.squadName,
    dedicationPercentage: dto.dedicationPercentage,
    bauPercentage: dto.bauPercentage,
    transformationPercentage: dto.transformationPercentage,
    // Los `??` tapan la brecha del backend real, que todavía no devuelve los
    // campos de persona ni la disponibilidad.
    personPosition: dto.personPosition ?? "",
    personModality: dto.personModality ?? "Hybrid",
    personLevel: dto.personLevel ?? 0,
    personLevelLabel: dto.personLevelLabel ?? "",
    personAvailablePercentage: dto.personAvailablePercentage ?? 0,
    createdAtUtc: dto.createdAtUtc,
    updatedAtUtc: dto.updatedAtUtc,
  }),

  toFormValues: (allocation: Allocation): AllocationFormValues => ({
    personId: allocation.personId,
    dedicationPercentage: String(allocation.dedicationPercentage),
    bauPercentage: String(allocation.bauPercentage),
    transformationPercentage: String(allocation.transformationPercentage),
  }),

  toCreateRequest: (values: AllocationFormValues): CreateAllocationRequest => ({
    personId: values.personId,
    dedicationPercentage: Number(values.dedicationPercentage),
    bauPercentage: Number(values.bauPercentage),
    transformationPercentage: Number(values.transformationPercentage),
  }),

  toUpdateRequest: (values: AllocationFormValues): UpdateAllocationRequest => ({
    dedicationPercentage: Number(values.dedicationPercentage),
    bauPercentage: Number(values.bauPercentage),
    transformationPercentage: Number(values.transformationPercentage),
  }),
};
