import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { usePersonDetail } from "../usePersonDetail";
import { resetPersonDetailMock } from "../../../../mocks/handlers/personDetail.handlers";
import { resetAllocationsMock } from "../../../../mocks/handlers/allocations.handlers";
import { resetPeopleMock } from "../../../../mocks/handlers/people.handlers";
import { CAMILA } from "../../../../mocks/handlers/personDetail.seeds";
import { personDetailService } from "../../services/personDetailService";

describe("usePersonDetail", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetPersonDetailMock();
  });

  it("carga y adapta el detalle; refetch refleja una mutación", async () => {
    const { result } = renderHook(() => usePersonDetail(CAMILA));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.detail?.person.name).toBe("Camila Restrepo");
    expect(result.current.detail?.devOpsIdentity).toBeNull();
    expect(result.current.notFound).toBe(false);

    // La mutación que sí existe en el detalle: vincular la identidad DevOps.
    const user = await personDetailService.searchDevOpsUser(
      "camila.restrepo@tuya.com"
    );
    await personDetailService.linkDevOpsIdentity(CAMILA, user.id);
    act(() => result.current.refetch());
    await waitFor(() =>
      expect(result.current.detail?.devOpsIdentity?.id).toBe(user.id)
    );
  });

  it("marca notFound con un id inexistente y sin id", async () => {
    const { result } = renderHook(() => usePersonDetail("nope"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.notFound).toBe(true);
    expect(result.current.error).toBeNull();

    const none = renderHook(() => usePersonDetail(undefined));
    await waitFor(() => expect(none.result.current.notFound).toBe(true));
  });
});
