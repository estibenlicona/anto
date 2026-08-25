import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { act, renderHook, waitFor } from "@testing-library/react";
import { server } from "../../../../mocks/server";
import { useLogin } from "../useLogin";

/**
 * A diferencia de useLogin.integration.test.ts (que mockea authService),
 * este test no mockea nada de la capa de datos: ejercita el flujo real
 * useLogin → authAdapter → authService → httpClient, interceptado a nivel
 * de red por el servidor de mocks de MSW (ver openspec/changes/add-api-mocking).
 */
describe("useLogin e2e (vía servidor de mocks)", () => {
  it("inicia sesión exitosamente contra el handler de mock por defecto", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login("persona@test.com", "correcta");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.email).toBe("persona@test.com");
  });

  it("propaga un error 401 del handler de mock igual que lo haría un backend real", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login("persona@test.com", "wrong");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it("permite sobreescribir el handler puntualmente para simular un 500, sin afectar otros tests", async () => {
    server.use(
      http.post("http://localhost:3000/", () =>
        HttpResponse.json({ message: "Error de servidor" }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login("persona@test.com", "correcta");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it("vuelve a usar el handler por defecto en un test posterior (server.resetHandlers en afterEach)", async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login("otra-persona@test.com", "correcta");
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.user).not.toBeNull();
  });
});
