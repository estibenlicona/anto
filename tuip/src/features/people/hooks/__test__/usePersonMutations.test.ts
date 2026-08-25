import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { personService } from "../../services/personService";
import { usePersonMutations } from "../usePersonMutations";

vi.mock("../../services/personService", () => ({
  personService: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    assignProvider: vi.fn(),
  },
}));

const baseFormValues = {
  name: "Nueva",
  documentId: "123",
  userPrincipalName: "nueva@tuya.com",
  position: "QA",
  role: "Contributor" as const,
  technicalLeadId: "",
  seniority: "1",
  modality: "Remote" as const,
  availableFte: "1",
  monthlyCost: "5000000",
  startDate: "2026-01-01",
  isExternal: false,
  providerId: "",
};

const person = {
  id: "1",
  name: "Existente",
  documentId: "123",
  entraObjectId: "",
  userPrincipalName: "existente@tuya.com",
  position: "QA",
  role: "Contributor" as const,
  technicalLeadId: null,
  technicalLeadName: null,
  technicalLeadOfCount: 0,
  seniority: 2,
  seniorityLabel: "Competente",
  modality: "Hybrid" as const,
  availableFte: 1,
  utilization: 40,
  stacks: [],
  monthlyCost: 6000000,
  startDate: "2026-01-01",
  chapterId: null,
  providerId: null,
  createdAtUtc: "2026-01-01T00:00:00Z",
  updatedAtUtc: "2026-01-01T00:00:00Z",
};

const createdDto = { ...person, id: "2" };

describe("usePersonMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("create succeeds and does not assign a provider for an internal person", async () => {
    vi.mocked(personService.create).mockResolvedValue(createdDto);
    const { result } = renderHook(() => usePersonMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create(baseFormValues);
    });

    expect(outcome).toEqual({ success: true });
    expect(personService.assignProvider).not.toHaveBeenCalled();
    expect(result.current.creating).toBe(false);
  });

  it("create succeeds and chains assignProvider for an external person", async () => {
    vi.mocked(personService.create).mockResolvedValue(createdDto);
    vi.mocked(personService.assignProvider).mockResolvedValue(undefined);
    const { result } = renderHook(() => usePersonMutations());

    await act(async () => {
      await result.current.create({
        ...baseFormValues,
        isExternal: true,
        providerId: "c1",
      });
    });

    expect(personService.assignProvider).toHaveBeenCalledWith("2", "c1");
  });

  it("create surfaces an error", async () => {
    vi.mocked(personService.create).mockRejectedValue(new Error("400"));
    const { result } = renderHook(() => usePersonMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.create(baseFormValues);
    });

    expect(outcome).toEqual({ success: false, error: "400" });
  });

  it("update succeeds", async () => {
    vi.mocked(personService.update).mockResolvedValue(person);
    const { result } = renderHook(() => usePersonMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.update(person, baseFormValues);
    });

    expect(personService.update).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ name: "Nueva" })
    );
    expect(outcome).toEqual({ success: true });
  });

  it("remove succeeds", async () => {
    vi.mocked(personService.remove).mockResolvedValue(undefined);
    const { result } = renderHook(() => usePersonMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(person);
    });

    expect(personService.remove).toHaveBeenCalledWith("1");
    expect(outcome).toEqual({ success: true });
  });

  it("remove surfaces an error", async () => {
    vi.mocked(personService.remove).mockRejectedValue(new Error("404"));
    const { result } = renderHook(() => usePersonMutations());

    let outcome;
    await act(async () => {
      outcome = await result.current.remove(person);
    });

    expect(outcome).toEqual({ success: false, error: "404" });
  });
});
