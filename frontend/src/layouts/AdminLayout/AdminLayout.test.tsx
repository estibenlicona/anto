import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "@app/providers/AuthContext";
import { deriveAuthSession } from "@features/auth-session";
import { AdminLayout } from "./AdminLayout";

// Ver la nota equivalente en ChapterLeadLayout.test.tsx: el layout filtra su
// menú según la sesión, así que necesita el puerto montado.
const adminSession = deriveAuthSession(
  {
    status: "authenticated",
    user: { id: "u1", name: "Ana", username: "ana@tuya.com" },
    roles: ["admin"],
    scopes: [],
    claims: {},
    accessToken: "t",
  },
  false
);

function renderAdminLayout(initialPath: string) {
  return render(
    <AuthContext.Provider value={adminSession}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/app/admin" element={<AdminLayout />}>
            <Route index element={<div>Contenido de inicio</div>} />
            <Route path="sprints" element={<div>Contenido de sprints</div>} />
            <Route
              path="parametros"
              element={<div>Contenido de parámetros</div>}
            />
            <Route
              path="habilidades"
              element={<div>Contenido de habilidades</div>}
            />
            <Route path="lineas" element={<div>Contenido de líneas</div>} />
            <Route path="devops" element={<div>Contenido de devops</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("AdminLayout", () => {
  it("renders the 6 admin navigation entries", () => {
    renderAdminLayout("/app/admin");
    expect(screen.getByRole("link", { name: /Inicio/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Sprints/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Parámetros/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Habilidades/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Líneas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ingesta/i })).toBeInTheDocument();
  });

  it("keeps the full screen name in the breadcrumb of the expertise lines", () => {
    renderAdminLayout("/app/admin/lineas");
    expect(screen.getByRole("link", { name: /Líneas/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(
      within(breadcrumb).getByText("Líneas de expertise")
    ).toBeInTheDocument();
  });

  it("keeps the full screen name in the breadcrumb of the skills catalog", () => {
    renderAdminLayout("/app/admin/habilidades");
    expect(screen.getByRole("link", { name: /Habilidades/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(within(breadcrumb).getByText("Habilidades")).toBeInTheDocument();
  });

  it("marks the entry matching the current route as active", () => {
    renderAdminLayout("/app/admin/sprints");
    expect(screen.getByRole("link", { name: /Sprints/i })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /Inicio/i })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("renders the matching outlet content and breadcrumb title for the current route", () => {
    renderAdminLayout("/app/admin/parametros");
    expect(screen.getByText("Contenido de parámetros")).toBeInTheDocument();
    const breadcrumb = screen.getByRole("navigation", {
      name: /ruta de navegación/i,
    });
    expect(
      within(breadcrumb).getByText("Parámetros del modelo")
    ).toBeInTheDocument();
  });

  it("navigates to another admin screen when a nav entry is clicked", () => {
    renderAdminLayout("/app/admin");
    expect(screen.getByText("Contenido de inicio")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /Ingesta/i }));

    expect(screen.getByText("Contenido de devops")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ingesta/i })).toHaveAttribute(
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
      renderAdminLayout("/app/admin");
      expect(screen.getByText("Gestión De Capacidad")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^Colapsar$/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^Expandir$/i })
      ).not.toBeInTheDocument();
    });

    it("collapses and expands the navigation from the hamburger, with the accessible state", () => {
      renderAdminLayout("/app/admin");
      const toggle = screen.getByRole("button", {
        name: "Contraer la navegación",
      });
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("link", { name: /Sprints/i })).toHaveTextContent(
        /Sprints/i
      );
      fireEvent.click(toggle);
      const expand = screen.getByRole("button", {
        name: "Expandir la navegación",
      });
      expect(expand).toHaveAttribute("aria-expanded", "false");
      expect(
        screen.queryByText("Gestión De Capacidad")
      ).not.toBeInTheDocument();
      fireEvent.click(expand);
      expect(
        screen.getByRole("button", { name: "Contraer la navegación" })
      ).toBeInTheDocument();
      expect(screen.getByText("Gestión De Capacidad")).toBeInTheDocument();
    });

    it("gives the main region the skip-link anchor", () => {
      renderAdminLayout("/app/admin");
      expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    });
  });
});
