import { describe, it, expect } from "vitest";
import { modulePath } from "@shared/services/modulePath";
import {
  LEAD_HOME_ID,
  leadNavGroups,
  leadRouteTitles,
  resolveLeadNavId,
} from "../navigation";

describe("chapter-lead navigation", () => {
  it("no ofrece Capacidades: la gestión del equipo vive en el detalle de la célula", () => {
    // Los href son relativos a la base del módulo ("" es el Inicio); el
    // enlace absoluto lo arma modulePath() con la base que registre el host.
    const hrefs = leadNavGroups.flatMap((g) => g.items.map((i) => i.href));
    expect(hrefs).toEqual([
      "",
      "iniciativas",
      "celulas",
      "personas",
      "ausencias",
      "dedicacion",
      "facturacion",
      "competencias",
    ]);
    expect(hrefs.map((h) => modulePath(h))).toEqual([
      "/capacidad",
      "/capacidad/iniciativas",
      "/capacidad/celulas",
      "/capacidad/personas",
      "/capacidad/ausencias",
      "/capacidad/dedicacion",
      "/capacidad/facturacion",
      "/capacidad/competencias",
    ]);
    // Capacidad ocupa el lugar de Backlog, con el mismo nombre en el menú y
    // en el breadcrumb, y ningún "Backlog" en ninguna parte.
    expect(leadRouteTitles["lead-dedicacion"]).toBe("Capacidad");
    expect(
      leadNavGroups
        .flatMap((g) => g.items)
        .find((i) => i.id === "lead-dedicacion")?.label
    ).toBe("Capacidad");
    expect(hrefs).not.toContain("backlog");
    expect(Object.values(leadRouteTitles).join(" ")).not.toMatch(/backlog/i);
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

  // resolveLeadNavId recibe la ruta relativa a la base del módulo, igual que
  // los href: "" es el Inicio y "celulas/abc" el detalle de una célula.
  it("resuelve la entrada activa por ruta exacta", () => {
    expect(resolveLeadNavId("")).toBe(LEAD_HOME_ID);
    expect(resolveLeadNavId("celulas")).toBe("lead-celulas");
    expect(resolveLeadNavId("personas")).toBe("lead-personas");
    expect(resolveLeadNavId("ausencias")).toBe("lead-ausencias");
  });

  it("mantiene activa la entrada padre en sus rutas hijas", () => {
    expect(resolveLeadNavId("celulas/abc")).toBe("lead-celulas");
    expect(resolveLeadNavId("personas/abc")).toBe("lead-personas");
    expect(resolveLeadNavId("personas/p1")).toBe("lead-personas");
    expect(resolveLeadNavId("iniciativas/ini-qr/evaluacion")).toBe(
      "lead-iniciativas"
    );
    expect(resolveLeadNavId("facturacion/bill-2026-07-gft")).toBe(
      "lead-facturacion"
    );
    expect(resolveLeadNavId("dedicacion")).toBe("lead-dedicacion");
    expect(resolveLeadNavId("dedicacion/p3")).toBe("lead-dedicacion");
  });

  it("no confunde prefijos parciales ni rutas desconocidas", () => {
    expect(resolveLeadNavId("celulasx")).toBe(LEAD_HOME_ID);
    expect(resolveLeadNavId("otra")).toBe(LEAD_HOME_ID);
  });
});
