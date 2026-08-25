import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "@app/providers/AuthContext";
import { deriveAuthSession } from "@features/auth-session";
import { ChapterLeadLayout } from "./ChapterLeadLayout";
import { useLeadBreadcrumbTrailing } from "@features/chapter-lead-shell/LeadBreadcrumbContext";

// Simula una pantalla de detalle: publica su nombre como último nivel.
function DetailStub({ name }: { name: string }) {
  useLeadBreadcrumbTrailing(name);
  return <div>Detalle de {name}</div>;
}

// El layout filtra su menú según los roles de la sesión, así que necesita el
// puerto montado. Se le da una sesión con el rol del shell, que es la única
// con la que se llega a verlo: el guard rechaza al resto antes.
const leadSession = deriveAuthSession(
  {
    status: "authenticated",
    user: { id: "u1", name: "Carlos", username: "carlos@tuya.com" },
    roles: ["chapter-lead"],
    scopes: [],
    claims: {},
    accessToken: "t",
  },
  false
);

function renderLeadLayout(initialPath: string) {
  return render(
    <AuthContext.Provider value={leadSession}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/app/lead" element={<ChapterLeadLayout />}>
            <Route index element={<div>Contenido de inicio</div>} />
            <Route path="celulas" element={<div>Contenido de células</div>} />
            <Route path="personas" element={<div>Contenido de personas</div>} />
            <Route
              path="celulas/:id"
              element={<DetailStub name="Backend Platform" />}
            />
            <Route
              path="competencias"
              element={<div>Contenido de plan de carrera</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("ChapterLeadLayout", () => {
  it("renders the chapter lead navigation entries, without Capacidades", () => {
    renderLeadLayout("/app/lead");
    for (const label of [
      /Inicio/i,
      /Células/i,
      /Personas/i,
      /Ausencias/i,
      /Backlog/i,
      /Facturación/i,
      /Competencias/i,
    ]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(
      screen.queryByRole("link", { name: /Capacidades/i })
    ).not.toBeInTheDocument();
  });

  it("marca Competencias activa y la nombra igual en el breadcrumb", () => {
    renderLeadLayout("/app/lead/competencias");
    expect(
      screen.getByRole("link", { name: /Competencias/i })
    ).toHaveAttribute("aria-current", "page");
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(within(breadcrumb).getByText("Competencias")).toBeInTheDocument();
  });

  it("marks the entry matching the current route as active", () => {
    renderLeadLayout("/app/lead/celulas");
    expect(screen.getByRole("link", { name: /Células/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /Inicio/i })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("renders the matching outlet content and breadcrumb title for the current route", () => {
    renderLeadLayout("/app/lead/celulas");
    expect(screen.getByText("Contenido de células")).toBeInTheDocument();
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(
      within(breadcrumb).getByText("Gestionar Células")
    ).toBeInTheDocument();
  });

  it("renders the matching outlet content and breadcrumb title for the personas route", () => {
    renderLeadLayout("/app/lead/personas");
    expect(screen.getByText("Contenido de personas")).toBeInTheDocument();
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(
      within(breadcrumb).getByText("Gestionar Personas")
    ).toBeInTheDocument();
  });

  it("keeps Células active on its detail route and adds the detail name to the breadcrumb", () => {
    renderLeadLayout("/app/lead/celulas/abc");
    expect(screen.getByText("Detalle de Backend Platform")).toBeInTheDocument();
    const sidebar = screen.getByRole("navigation", {
      name: /Navegación de Chapter Lead/i,
    });
    expect(
      within(sidebar).getByRole("link", { name: /Células/i })
    ).toHaveAttribute("aria-current", "page");
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    // El padre pasa a ser enlace y el nombre de la célula cierra la ruta.
    expect(
      within(breadcrumb).getByRole("link", { name: "Gestionar Células" })
    ).toHaveAttribute("href", "/app/lead/celulas");
    expect(
      within(breadcrumb).getByText("Backend Platform")
    ).toBeInTheDocument();
  });

  it("goes back to two breadcrumb levels when leaving the detail", () => {
    renderLeadLayout("/app/lead/celulas/abc");
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(
      within(breadcrumb).getByText("Backend Platform")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("link", { name: /Personas/i }));
    expect(screen.getByText("Contenido de personas")).toBeInTheDocument();
    expect(
      within(breadcrumb).queryByText("Backend Platform")
    ).not.toBeInTheDocument();
    expect(
      within(breadcrumb).getByText("Gestionar Personas")
    ).toBeInTheDocument();
  });

  it("keeps the full screen name in the breadcrumb while the menu shows the short one", () => {
    renderLeadLayout("/app/lead");
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });

    // El menú es un índice y el breadcrumb nombra la pantalla; si alguien
    // "simplifica" también los RouteTitles, este nombre desaparece de la app.
    expect(screen.getByRole("link", { name: /Inicio/i })).toBeInTheDocument();
    expect(
      within(breadcrumb).getByText("Torre de control")
    ).toBeInTheDocument();
  });

  it("navigates to another lead screen when a nav entry is clicked", () => {
    renderLeadLayout("/app/lead");
    expect(screen.getByText("Contenido de inicio")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /Células/i }));

    expect(screen.getByText("Contenido de células")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Células/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
  describe("app shell", () => {
    // La preferencia de colapso se persiste en localStorage (clave compartida
    // con el Sidebar anterior): cada caso arranca sin preferencia guardada.
    beforeEach(() =>
      window.localStorage.removeItem("tuya-ui:sidebar-collapsed")
    );

    it("shows the product brand in the sidebar header, not a footer collapse control", () => {
      renderLeadLayout("/app/lead");
      expect(screen.getByText("Dimensionamiento TI")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^Colapsar$/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^Expandir$/i })
      ).not.toBeInTheDocument();
    });

    it("collapses and expands the navigation from the hamburger, with the accessible state", () => {
      renderLeadLayout("/app/lead");
      const toggle = screen.getByRole("button", {
        name: "Contraer la navegación",
      });
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("link", { name: /Células/i })).toHaveTextContent(
        /Células/i
      );
      fireEvent.click(toggle);
      const expand = screen.getByRole("button", {
        name: "Expandir la navegación",
      });
      expect(expand).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText("Dimensionamiento TI")).not.toBeInTheDocument();
      fireEvent.click(expand);
      expect(
        screen.getByRole("button", { name: "Contraer la navegación" })
      ).toBeInTheDocument();
      expect(screen.getByText("Dimensionamiento TI")).toBeInTheDocument();
    });

    it("shows the backlog pending count as the Backlog badge", async () => {
      renderLeadLayout("/app/lead");
      const backlog = await screen.findByRole("link", {
        name: /Backlog, [0-9]+ pendientes/,
      });
      expect(backlog).toBeInTheDocument();
    });

    it("gives the main region the skip-link anchor", () => {
      renderLeadLayout("/app/lead");
      expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    });
  });
});
