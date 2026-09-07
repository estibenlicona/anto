import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../../../mocks/server";
import { useDevOpsUserSearch } from "../useDevOpsUserSearch";

describe("useDevOpsUserSearch", () => {
  it("arranca en reposo, sin usuario ni error", () => {
    const { result } = renderHook(() => useDevOpsUserSearch());
    expect(result.current.status).toBe("idle");
    expect(result.current.user).toBeNull();
    expect(result.current.searchedEmail).toBeNull();
  });

  it("un correo con usuario pasa por 'searching' y termina en 'found' con el usuario", async () => {
    const { result } = renderHook(() => useDevOpsUserSearch());
    let pending: Promise<void>;
    act(() => {
      pending = result.current.search("camila.restrepo@tuya.com");
    });
    expect(result.current.status).toBe("searching");
    await act(async () => {
      await pending;
    });
    expect(result.current.status).toBe("found");
    expect(result.current.user?.displayName).toBe("Camila Restrepo");
    expect(result.current.searchedEmail).toBe("camila.restrepo@tuya.com");
  });

  it("un 404 es 'notFound', no un error", async () => {
    const { result } = renderHook(() => useDevOpsUserSearch());
    await act(async () => {
      await result.current.search("nadie@tuya.com");
    });
    expect(result.current.status).toBe("notFound");
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("cualquier otra falla es 'error' con un mensaje, y reset vuelve a reposo", async () => {
    server.use(
      http.get("/devops/users", () =>
        HttpResponse.json({ message: "DevOps no responde" }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useDevOpsUserSearch());
    await act(async () => {
      await result.current.search("camila.restrepo@tuya.com");
    });
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBeTruthy();
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
    expect(result.current.searchedEmail).toBeNull();
  });
});
