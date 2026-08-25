import { describe, it, expect } from "vitest";
import { httpClient } from "../httpClient";
import { setAccessTokenProvider } from "../accessToken";
import axios from "axios";

describe("httpClient", () => {
  it("is configured with correct baseURL from environment variable", () => {
    expect(httpClient.defaults.baseURL).toBeDefined();
    expect(httpClient.defaults.baseURL).toContain("/");
  });

  it("has correct timeout configured", () => {
    expect(httpClient.defaults.timeout).toBe(10000);
  });

  it("has correct default headers", () => {
    expect(httpClient.defaults.headers["Content-Type"]).toBe(
      "application/json"
    );
  });

  it("has request interceptor configured", () => {
    expect(httpClient.interceptors.request.handlers).toBeDefined();
    expect(httpClient.interceptors.request.handlers?.length).toBeGreaterThan(0);
  });
  it("agrega el token en el header Authorization si existe", async () => {
    // El token ya no sale de localStorage: esta aplicación no inicia sesión ni
    // la guarda. Lo provee quien monte la sesión —el host, o el simulador en
    // desarrollo— a través del registro que `httpClient` consulta.
    const token = "test-token";
    const restore = setAccessTokenProvider(() => token);

    // Simula una petición para disparar el interceptor
    // Crea un objeto que cumpla con InternalAxiosRequestConfig y usa AxiosHeaders
    const config = {
      headers: new axios.AxiosHeaders(),
      method: "get",
      url: "",
      baseURL: "",
      transformRequest: [],
      transformResponse: [],
      params: {},
      data: undefined,
      timeout: 0,
      adapter: undefined,
      responseType: "json" as const,
      xsrfCookieName: undefined,
      xsrfHeaderName: undefined,
      onUploadProgress: undefined,
      onDownloadProgress: undefined,
      maxContentLength: undefined,
      validateStatus: undefined,
      maxBodyLength: undefined,
      maxRedirects: undefined,
      beforeRedirect: undefined,
      socketPath: undefined,
      transport: undefined,
      httpAgent: undefined,
      httpsAgent: undefined,
      proxy: undefined,
      cancelToken: undefined,
      decompress: undefined,
      transitional: undefined,
      signal: undefined,
      insecureHTTPParser: undefined,
      env: undefined,
      formSerializer: undefined,
      family: undefined,
      lookup: undefined,
      withXSRFToken: undefined,
      parseReviver: undefined,
      fetchOptions: undefined,
      httpVersion: undefined,
      http2Options: undefined,
    };
    // Obtén el interceptor manualmente de forma segura
    const handler = httpClient.interceptors.request.handlers?.[0];
    expect(handler).toBeDefined();
    const interceptor = handler?.fulfilled;
    expect(typeof interceptor).toBe("function");
    const result = interceptor ? await interceptor(config) : config;
    expect(result.headers.get("Authorization")).toBe(`Bearer ${token}`);

    restore();
  });

  it("no agrega el header cuando no hay token", async () => {
    // Es el caso del token vencido: la llamada sale sin cabecera y la puerta
    // de enlace responde 401. No se inventa un token ni se bloquea la llamada
    // desde el cliente.
    const restore = setAccessTokenProvider(() => null);
    const handler = httpClient.interceptors.request.handlers?.[0];
    const interceptor = handler?.fulfilled;
    const config = {
      headers: new axios.AxiosHeaders(),
      method: "get",
      url: "",
    } as never;
    const result = interceptor ? await interceptor(config) : config;
    expect(
      (result as { headers: axios.AxiosHeaders }).headers.get("Authorization")
    ).toBeFalsy();
    restore();
  });
});
