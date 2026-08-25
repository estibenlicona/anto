import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useBacklogQueue } from "../useBacklogQueue";
import { useBacklogMutations } from "../useBacklogMutations";
import { useBacklogPendingCount } from "../useBacklogPendingCount";
import { BACKLOG_CHANGED, backlogEvents } from "../backlogEvents";
import { resetBacklogMock } from "../../../../mocks/handlers/backlog.handlers";
import { resetPersonDetailMock } from "../../../../mocks/handlers/personDetail.handlers";
import { resetAllocationsMock } from "../../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../../mocks/handlers/people.handlers";

describe("hooks del backlog", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetPersonDetailMock();
    resetBacklogMock();
  });

  it("useBacklogQueue carga la cola, pone en curso la primera y refetchea", async () => {
    const { result } = renderHook(() => useBacklogQueue({}, null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.length).toBeGreaterThan(0);
    expect(result.current.current?.id).toBe(result.current.items[0].id);
    expect(result.current.summary?.pending).toBe(result.current.items.length);
  });

  it("useBacklogMutations avisa al canal y devuelve el mensaje del mock en error", async () => {
    const listener = vi.fn();
    backlogEvents.addEventListener(BACKLOG_CHANGED, listener);
    const { result: queue } = renderHook(() => useBacklogQueue({}, null));
    await waitFor(() => expect(queue.current.loading).toBe(false));
    const { result } = renderHook(() => useBacklogMutations());
    const id = queue.current.items[0].id;
    let outcome;
    await act(async () => {
      outcome = await result.current.classify(id, { kind: "Bau" });
    });
    expect(outcome).toEqual({
      success: false,
      error: "Selecciona la categoría BAU",
    });
    await act(async () => {
      outcome = await result.current.classify(id, { kind: "Discard" });
    });
    expect(outcome).toEqual({ success: true });
    expect(listener).toHaveBeenCalledTimes(1);
    backlogEvents.removeEventListener(BACKLOG_CHANGED, listener);
  });

  it("useBacklogPendingCount sigue los cambios del canal", async () => {
    const { result } = renderHook(() => useBacklogPendingCount());
    await waitFor(() => expect(result.current).toBeGreaterThan(0));
    const before = result.current!;
    const { result: mutations } = renderHook(() => useBacklogMutations());
    const { result: queue } = renderHook(() => useBacklogQueue({}, null));
    await waitFor(() => expect(queue.current.loading).toBe(false));
    await act(async () => {
      await mutations.current.classify(queue.current.items[0].id, {
        kind: "Discard",
      });
    });
    await waitFor(() => expect(result.current).toBe(before - 1));
  });
});
