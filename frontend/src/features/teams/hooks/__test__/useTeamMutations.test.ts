import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { teamService } from "../../services/teamService";
import { useTeamMutations } from "../useTeamMutations";
import type { Team } from "../../adapters/TeamAdapter";

vi.mock("../../services/teamService", () => ({
  teamService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const team: Team = {
  id: "t1",
  name: "Ecosistema Digital",
  description: "",
  squadCount: 0,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

describe("useTeamMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create succeeds", async () => {
    vi.mocked(teamService.create).mockResolvedValue({
      ...team,
      name: "Nuevo",
    });
    const { result } = renderHook(() => useTeamMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create({ name: "Nuevo", description: "" });
    });
    expect(outcome).toEqual({ success: true });
  });

  it("create surfaces the server's message for a duplicate name (400)", async () => {
    vi.mocked(teamService.create).mockRejectedValue({
      response: {
        status: 400,
        data: { message: "Ya existe un equipo con ese nombre" },
      },
    });
    const { result } = renderHook(() => useTeamMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create({ name: "Pagos", description: "" });
    });
    expect(outcome).toEqual({
      success: false,
      error: "Ya existe un equipo con ese nombre",
    });
  });

  it("update succeeds", async () => {
    vi.mocked(teamService.update).mockResolvedValue(team);
    const { result } = renderHook(() => useTeamMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.update(team, {
        name: "Editado",
        description: "",
      });
    });
    expect(outcome).toEqual({ success: true });
    expect(teamService.update).toHaveBeenCalledWith(team.id, {
      name: "Editado",
      description: undefined,
    });
  });

  it("remove succeeds", async () => {
    vi.mocked(teamService.remove).mockResolvedValue(undefined);
    const { result } = renderHook(() => useTeamMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(team);
    });
    expect(outcome).toEqual({ success: true });
  });

  it("remove surfaces the server's message for a blocked deletion (409)", async () => {
    vi.mocked(teamService.remove).mockRejectedValue({
      response: {
        status: 409,
        data: {
          message:
            "3 células pertenecen a este equipo; reasignalas o eliminalas antes de eliminar el equipo.",
        },
      },
    });
    const { result } = renderHook(() => useTeamMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(team);
    });
    expect(outcome).toEqual({
      success: false,
      error:
        "3 células pertenecen a este equipo; reasignalas o eliminalas antes de eliminar el equipo.",
    });
  });

  it("falls back to a generic message when the error carries no response body", async () => {
    vi.mocked(teamService.remove).mockRejectedValue(new Error("network error"));
    const { result } = renderHook(() => useTeamMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(team);
    });
    expect(outcome).toEqual({ success: false, error: "network error" });
  });
});
