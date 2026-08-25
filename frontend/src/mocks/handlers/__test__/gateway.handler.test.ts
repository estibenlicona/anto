import { describe, it, expect, afterEach } from "vitest";
import { httpClient } from "@shared/services/httpClient";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import {
  setGatewayBehavior,
  resetGatewayMock,
  gatewayHandlers,
} from "../gateway.handlers";
import { resetPeopleMock } from "../people.handlers";

describe("puerta de enlace mockeada", () => {
  afterEach(() => {
    resetGatewayMock();
    resetPeopleMock();
  });

  it("stays out of the way by default", async () => {
    // Es lo que permite que el resto de la suite ejercite servicios sin montar
    // una sesión: encendida siempre, cada uno de esos tests recibiría 401.
    const response = await httpClient.get("/people");
    expect(response.status).toBe(200);
  });

  it("returns 401 for a call with no token once it requires one", async () => {
    setGatewayBehavior({ requireToken: true });
    await expect(httpClient.get("/people")).rejects.toMatchObject({
      response: { status: 401 },
    });
  });

  it("lets a call through when it carries a token", async () => {
    setGatewayBehavior({ requireToken: true });
    const restore = setAccessTokenProvider(() => "un.token.valido");
    try {
      const response = await httpClient.get("/people");
      expect(response.status).toBe(200);
    } finally {
      restore();
    }
  });

  it("treats an expired token as an absent one", async () => {
    setGatewayBehavior({ requireToken: true });
    // Así representa el simulador un token vencido: sin cabecera. El handler
    // no sabe que hubo un simulador de por medio — ve lo mismo que vería la
    // puerta de enlace real ante una llamada sin credencial.
    const restore = setAccessTokenProvider(() => null);
    try {
      await expect(httpClient.get("/people")).rejects.toMatchObject({
        response: { status: 401 },
      });
    } finally {
      restore();
    }
  });

  it("forces 403 regardless of the token", async () => {
    setGatewayBehavior({ forceStatus: 403 });
    const restore = setAccessTokenProvider(() => "un.token.valido");
    try {
      await expect(httpClient.get("/people")).rejects.toMatchObject({
        response: { status: 403 },
      });
    } finally {
      restore();
    }
  });

  it("never gates dev-server requests, even while requiring a token", async () => {
    // Esta es la regresión que rompió la aplicación entera: con `http.all("*")`
    // sin filtrar, el Service Worker respondía 401 a los módulos de Vite, al
    // CSS y a la navegación, y la página dejaba de cargar. El 401 sólo debe
    // alcanzar a las llamadas de datos.
    setGatewayBehavior({ requireToken: true });

    // `destination` es de sólo lectura y no se puede fijar desde `Request`,
    // así que acá se ejercita el respaldo por ruta y no el discriminador
    // principal. Es justamente el motivo de que el respaldo exista: en Node
    // `destination` siempre viene vacío, y sin la lista de rutas estas
    // peticiones se tratarían como llamadas de datos.
    const devRequests = [
      new Request("http://localhost:4300/src/main.tsx"),
      new Request("http://localhost:4300/node_modules/.vite/deps/react.js"),
      new Request("http://localhost:4300/src/styles/styles.css"),
      new Request("http://localhost:4300/@vite/client"),
    ];

    const handler = gatewayHandlers[0];
    for (const request of devRequests) {
      const result = await handler.run({ request, requestId: "t" });
      // Sin respuesta del handler: la petición sigue su camino normal.
      expect(result?.response).toBeUndefined();
    }
  });

  it("goes back to normal after a reset", async () => {
    setGatewayBehavior({ forceStatus: 401 });
    resetGatewayMock();
    const response = await httpClient.get("/people");
    expect(response.status).toBe(200);
  });
});
