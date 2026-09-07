import { describe, expect, it, vi } from "vitest";
import { createSessionStore } from "../sessionStore";
import { ANONYMOUS_SESSION, type Session } from "../types";

const authenticated: Session = {
  status: "authenticated",
  user: { id: "u1", name: "Ana", username: "ana@tuya.com" },
  roles: ["admin"],
  scopes: [],
  claims: {},
  accessToken: "t",
};

describe("createSessionStore", () => {
  it("arranca anónimo y devuelve la misma referencia mientras nadie escribe", () => {
    const store = createSessionStore();
    expect(store.getSession()).toBe(ANONYMOUS_SESSION);
    // Es lo que permite leerlo con useSyncExternalStore sin bucle de renders.
    expect(store.getSession()).toBe(store.getSession());
  });

  it("notifica una vez a cada suscriptor cuando la sesión cambia", () => {
    const store = createSessionStore();
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe(a);
    store.subscribe(b);

    store.set(authenticated);

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    expect(store.getSession()).toBe(authenticated);
  });

  it("no notifica si se escribe la misma referencia", () => {
    const store = createSessionStore(authenticated);
    const listener = vi.fn();
    store.subscribe(listener);

    store.set(authenticated);

    expect(listener).not.toHaveBeenCalled();
  });

  it("deja de notificar después de darse de baja", () => {
    const store = createSessionStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.set(authenticated);

    expect(listener).not.toHaveBeenCalled();
  });
});
