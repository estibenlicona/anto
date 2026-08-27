import { describe, it, expect } from "vitest";
import {
  LEAD_HOME_ID,
  leadNavGroups,
  leadRouteTitles,
  resolveLeadNavId,
} from "../navigation";

describe("chapter-lead navigation", () => {
  it("no ofrece Capacidades: la gestión del equipo vive en el detalle de la célula", () => {
    const hrefs = leadNavGroups.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toEqual([
      "/app/lead",
      "/app/lead/iniciativas",
      "/app/lead/celulas",
      "/app/lead/personas",
      "/app/lead/ausencias",
      "/app/lead/backlog",
      "/app/lead/facturacion",
      "/app/lead/competencias",
    ]);
    expect(leadRouteTitles["lead-backlog"]).toBe("Gestionar Backlog");
    expect(leadRouteTitles["lead-facturacion"]).toBe("Prefacturación");
    expect(leadRouteTitles["lead-ausencias"]).toBe("Gestionar Ausencias");
    expect(leadNavGroups.map((g) => g.label)).toEqual([
      "",
      "Iniciativas",
      "Capacidad",
    ]);
    expect(leadRouteTitles["lead-iniciativas"]).toBe("Gestionar Iniciativas");
    expect(Object.values(leadRouteTitles)).not.toContain(
      "Gestionar Capacidades"
    );
  });

  it("resuelve la entrada activa por ruta exacta", () => {
    expect(resolveLeadNavId("/app/lead")).toBe(LEAD_HOME_ID);
    expect(resolveLeadNavId("/app/lead/celulas")).toBe("lead-celulas");
    expect(resolveLeadNavId("/app/lead/personas")).toBe("lead-personas");
    expect(resolveLeadNavId("/app/lead/ausencias")).toBe("lead-ausencias");
  });

  it("mantiene activa la entrada padre en sus rutas hijas", () => {
    expect(resolveLeadNavId("/app/lead/celulas/abc")).toBe("lead-celulas");
    expect(resolveLeadNavId("/app/lead/personas/abc")).toBe("lead-personas");
    expect(resolveLeadNavId("/app/lead/personas/p1")).toBe("lead-personas");
    expect(resolveLeadNavId("/app/lead/iniciativas/ini-qr/evaluacion")).toBe(
      "lead-iniciativas"
    );
    expect(resolveLeadNavId("/app/lead/facturacion/bill-2026-07-gft")).toBe(
      "lead-facturacion"
    );
  });

  it("no confunde prefijos parciales ni rutas desconocidas", () => {
    expect(resolveLeadNavId("/app/lead/celulasx")).toBe(LEAD_HOME_ID);
    expect(resolveLeadNavId("/app/lead/otra")).toBe(LEAD_HOME_ID);
  });
});
