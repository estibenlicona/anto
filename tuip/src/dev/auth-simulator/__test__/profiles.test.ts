import { describe, it, expect } from "vitest";
import {
  DEFAULT_PROFILE_ID,
  SIMULATOR_PROFILES,
  profileToSession,
} from "../profiles";
import { CHAPTERS, holderChapterId } from "../../../mocks/handlers/chapters";
import { getPeopleSnapshot } from "../../../mocks/handlers/people.handlers";

const byId = (id: string) => SIMULATOR_PROFILES.find((p) => p.id === id)!;

/** Lo que hace el servidor con el token: resolverlo a un chapter. */
const holderChapterIdDeToken = (token: string) =>
  holderChapterId(
    new Request("http://localhost/people", {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

describe("perfiles del simulador", () => {
  it("defines the profiles the changes call for", () => {
    expect(SIMULATOR_PROFILES.map((p) => p.id).sort()).toEqual([
      "admin",
      "anonymous",
      "chapter-lead",
      "chapter-lead-canales",
      "chapter-lead-sin-gente",
      "restricted",
    ]);
  });

  it("gives every chapter lead the identity of the person who leads that chapter", () => {
    // Es la prueba que sostiene el acotado por responsabilidad: el servidor
    // resuelve a quién tiene a cargo el titular buscando su `oid` entre los
    // leads. Si un perfil trae un `oid` que ningún chapter declara —lo que
    // pasaba cuando el Chapter Lead era un tal "Carlos Chapter Lead" que no
    // existía en los datos— la pregunta no tiene respuesta y la pantalla
    // muestra a todo el mundo sin que nada falle.
    const leads = SIMULATOR_PROFILES.filter((p) =>
      p.claims?.roles.includes("Plataforma.ChapterLead")
    );
    expect(leads).toHaveLength(3);

    for (const perfil of leads) {
      const chapter = CHAPTERS.find(
        (c) => c.leadEntraObjectId === perfil.claims!.oid
      );
      expect(chapter, `${perfil.id} no lidera ningún chapter`).toBeDefined();
      expect(perfil.claims!.name).toBe(chapter!.leadName);
      // Y esa persona está sembrada, con el mismo `oid` en su ficha.
      const persona = getPeopleSnapshot().find(
        (p) => p.name === chapter!.leadName
      );
      expect(persona?.entraObjectId).toBe(perfil.claims!.oid);
    }
  });

  it("puts the holder's oid in the token, which is what the server resolves", () => {
    const session = profileToSession(byId("chapter-lead"), false);
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    // El formato exacto, no "que contenga el oid": del otro lado hay una
    // expresión estricta —la de holderChapterId, en mocks/handlers/chapters—
    // y cualquier variante que igual contuviera el oid dejaría de resolver al
    // titular sin que esta prueba se enterara. Y el acotado falla en silencio:
    // no rompe, muestra de más. Por eso se comprueba contra el resolvedor de
    // verdad, no sólo contra la cadena.
    const { oid } = byId("chapter-lead").claims!;
    expect(session.accessToken).toBe(`simulated.${oid}.token`);
    expect(holderChapterIdDeToken(session.accessToken!)).toBe(CHAPTERS[0].id);
  });

  it("defaults to a profile that has a session and broad permissions", () => {
    // Arrancar en Anonymous dejaría la aplicación inaccesible de entrada: el
    // caso normal al desarrollar es "quiero ver la pantalla".
    const session = profileToSession(byId(DEFAULT_PROFILE_ID), false);
    expect(session.status).toBe("authenticated");
    if (session.status !== "authenticated") return;
    expect(session.roles.length).toBeGreaterThan(0);
  });

  it("turns the anonymous profile into a session with no user", () => {
    expect(profileToSession(byId("anonymous"), false)).toEqual({
      status: "anonymous",
    });
  });

  it("maps Entra roles to domain roles", () => {
    const session = profileToSession(byId("admin"), false);
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    // El perfil declara "Plataforma.Admin" — el claim de Entra — y sale
    // traducido al rol de dominio, igual que hará el adaptador del host.
    expect(session.claims.roles).toEqual(["Plataforma.Admin"]);
    expect(session.roles).toEqual(["admin"]);
  });

  it("gives a session with no platform roles to the restricted profile", () => {
    const session = profileToSession(byId("restricted"), false);
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    expect(session.roles).toEqual([]);
    // Tiene sesión: es lo que distingue el 403 del 401.
    expect(session.accessToken).not.toBeNull();
  });

  it("splits the Entra scope claim into individual scopes", () => {
    const session = profileToSession(byId("admin"), false);
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    expect(session.scopes).toContain("parametros.write");
    expect(session.scopes).not.toContain("");
  });

  it("represents an expired token as the absence of a token", () => {
    const session = profileToSession(byId("chapter-lead"), true);
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    // Sigue habiendo sesión, pero la llamada sale sin cabecera y la puerta de
    // enlace responde 401 — igual que en producción.
    expect(session.accessToken).toBeNull();
    expect(session.roles).toEqual(["chapter-lead"]);
  });

  it("ignores Entra roles that do not map to a domain role", () => {
    const session = profileToSession(
      {
        id: "x",
        label: "x",
        description: "x",
        claims: {
          oid: "x",
          upn: "x@tuya.com",
          name: "X",
          roles: ["Plataforma.Admin", "OtraApp.Rol"],
          scp: "",
        },
      },
      false
    );
    if (session.status !== "authenticated") throw new Error("esperaba sesión");
    expect(session.roles).toEqual(["admin"]);
  });
});
