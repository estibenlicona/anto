import type {
  CreateTeamRequest,
  TeamDto,
  UpdateTeamRequest,
} from "../services/teamService";

export interface Team {
  id: string;
  name: string;
  description: string;
  squadCount: number;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface TeamFormValues {
  name: string;
  description: string;
}

export const emptyTeamFormValues: TeamFormValues = {
  name: "",
  description: "",
};

export const teamAdapter = {
  toEntity: (dto: TeamDto): Team => ({
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "",
    squadCount: dto.squadCount,
    createdAtUtc: dto.createdAtUtc,
    updatedAtUtc: dto.updatedAtUtc,
  }),

  toFormValues: (team: Team): TeamFormValues => ({
    name: team.name,
    description: team.description,
  }),

  toCreateRequest: (values: TeamFormValues): CreateTeamRequest => ({
    name: values.name.trim(),
    description: values.description.trim() || undefined,
  }),

  toUpdateRequest: (values: TeamFormValues): UpdateTeamRequest =>
    teamAdapter.toCreateRequest(values),
};
