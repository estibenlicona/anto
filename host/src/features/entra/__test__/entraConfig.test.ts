import { describe, expect, it } from "vitest";
import { EntraConfigError, readEntraConfig } from "../entraConfig";

const env = (overrides: Partial<ImportMetaEnv>): ImportMetaEnv =>
  ({
    VITE_ENTRA_CLIENT_ID: "client-1",
    VITE_ENTRA_TENANT_ID: "tenant-1",
    ...overrides,
  }) as ImportMetaEnv;

describe("readEntraConfig", () => {
  it("arma la autoridad y la URI de retorno desde el origen y la base", () => {
    const config = readEntraConfig(
      env({ VITE_BASE_PUBLIC_URL: "/" }),
      "https://plataforma.tuya.com"
    );
    expect(config.authority).toBe("https://login.microsoftonline.com/tenant-1");
    expect(config.redirectUri).toBe("https://plataforma.tuya.com/");
    expect(config.postLogoutRedirectUri).toBe(config.redirectUri);
    expect(config.apiScopes).toEqual([]);
  });

  it("respeta una URI de retorno explícita y parte los scopes por espacio", () => {
    const config = readEntraConfig(
      env({
        VITE_ENTRA_REDIRECT_URI: "https://otra/retorno",
        VITE_ENTRA_API_SCOPES: "api://x/.default  api://y/read",
      }),
      "https://plataforma.tuya.com"
    );
    expect(config.redirectUri).toBe("https://otra/retorno");
    expect(config.apiScopes).toEqual(["api://x/.default", "api://y/read"]);
  });

  it("nombra la variable que falta", () => {
    expect(() =>
      readEntraConfig(env({ VITE_ENTRA_CLIENT_ID: "" }), "http://localhost")
    ).toThrowError(EntraConfigError);
    try {
      readEntraConfig(env({ VITE_ENTRA_TENANT_ID: "  " }), "http://localhost");
    } catch (error) {
      expect((error as EntraConfigError).variable).toBe("VITE_ENTRA_TENANT_ID");
      expect((error as Error).message).toContain("VITE_ENTRA_TENANT_ID");
    }
  });
});

describe("readEntraConfig — autoridad configurable", () => {
  it("sin variables usa la nube de Entra y ninguna autoridad conocida", () => {
    const config = readEntraConfig(env({}), "http://localhost:4400");
    expect(config.authority).toBe("https://login.microsoftonline.com/tenant-1");
    expect(config.knownAuthorities).toEqual([]);
  });

  it("con autoridad explícita y sin conocidas, deriva el host de su URL", () => {
    const config = readEntraConfig(
      env({
        VITE_ENTRA_AUTHORITY: "https://login.entra.localhost:8443/tenant-1",
      }),
      "http://localhost:4400"
    );
    expect(config.authority).toBe(
      "https://login.entra.localhost:8443/tenant-1"
    );
    expect(config.knownAuthorities).toEqual(["login.entra.localhost:8443"]);
  });

  it("con ambas variables respeta las autoridades declaradas", () => {
    const config = readEntraConfig(
      env({
        VITE_ENTRA_AUTHORITY: "https://login.entra.localhost:8443/tenant-1",
        VITE_ENTRA_KNOWN_AUTHORITIES: "login.entra.localhost:8443 otro:1234",
      }),
      "http://localhost:4400"
    );
    expect(config.knownAuthorities).toEqual([
      "login.entra.localhost:8443",
      "otro:1234",
    ]);
  });
});
