import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useRoutes, Outlet } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";

/**
 * Routes Test - GestionCapacidad
 *
 * Tests para verificar la configuración de rutas standalone.
 */

// Mocks de páginas
vi.mock("@pages/HomePage/HomePage", () => ({
  __esModule: true,
  default: () => <div>Home Page</div>,
  HomePage: () => <div>Home Page</div>,
}));
vi.mock("@pages/LoginPage/LoginPage", () => ({
  __esModule: true,
  default: () => <div>Login Page</div>,
  LoginPage: () => <div>Login Page</div>,
}));
vi.mock("@pages/DashboardPage/DashboardPage", () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>,
  DashboardPage: () => <div>Dashboard Page</div>,
}));
vi.mock("@pages/NotFoundPage/NotFoundPage", () => ({
  __esModule: true,
  default: () => <h1>Not found Page</h1>,
  NotFoundPage: () => <h1>Not found Page</h1>,
}));
vi.mock("@pages/AdminHomePage/AdminHomePage", () => ({
  __esModule: true,
  default: () => <div>Admin Home Page</div>,
  AdminHomePage: () => <div>Admin Home Page</div>,
}));
vi.mock("@pages/AdminSprintsPage/AdminSprintsPage", () => ({
  __esModule: true,
  default: () => <div>Admin Sprints Page</div>,
  AdminSprintsPage: () => <div>Admin Sprints Page</div>,
}));
vi.mock("@pages/AdminParametersPage/AdminParametersPage", () => ({
  __esModule: true,
  default: () => <div>Admin Parameters Page</div>,
  AdminParametersPage: () => <div>Admin Parameters Page</div>,
}));
vi.mock("@pages/AdminSkillsPage/AdminSkillsPage", () => ({
  __esModule: true,
  default: () => <div>Admin Skills Page</div>,
  AdminSkillsPage: () => <div>Admin Skills Page</div>,
}));
vi.mock("@pages/AdminExpertiseLinesPage/AdminExpertiseLinesPage", () => ({
  __esModule: true,
  default: () => <div>Admin Expertise Lines Page</div>,
  AdminExpertiseLinesPage: () => <div>Admin Expertise Lines Page</div>,
}));
vi.mock("@pages/AdminDevOpsPage/AdminDevOpsPage", () => ({
  __esModule: true,
  default: () => <div>Admin DevOps Page</div>,
  AdminDevOpsPage: () => <div>Admin DevOps Page</div>,
}));
vi.mock("@pages/ChapterLeadHomePage/ChapterLeadHomePage", () => ({
  __esModule: true,
  default: () => <div>Chapter Lead Home Page</div>,
  ChapterLeadHomePage: () => <div>Chapter Lead Home Page</div>,
}));
vi.mock("@pages/LeadSquadsPage/LeadSquadsPage", () => ({
  __esModule: true,
  default: () => <div>Lead Squads Page</div>,
  LeadSquadsPage: () => <div>Lead Squads Page</div>,
}));
vi.mock("@pages/LeadPeoplePage/LeadPeoplePage", () => ({
  __esModule: true,
  default: () => <div>Lead People Page</div>,
  LeadPeoplePage: () => <div>Lead People Page</div>,
}));
vi.mock("@pages/LeadSquadDetailPage/LeadSquadDetailPage", () => ({
  __esModule: true,
  default: () => <div>Lead Squad Detail Page</div>,
  LeadSquadDetailPage: () => <div>Lead Squad Detail Page</div>,
}));
vi.mock("@pages/LeadAbsencesPage/LeadAbsencesPage", () => ({
  LeadAbsencesPage: () => <div>Lead Absences Page</div>,
}));
vi.mock("@pages/LeadBacklogPage/LeadBacklogPage", () => ({
  LeadBacklogPage: () => <div>Lead Backlog Page</div>,
}));
vi.mock("@pages/LeadPersonPlanPage/LeadPersonPlanPage", () => ({
  LeadPersonPlanPage: () => <div>Lead Person Plan Page</div>,
}));
vi.mock("@pages/LeadCareerPlanPage/LeadCareerPlanPage", () => ({
  LeadCareerPlanPage: () => <div>Lead Career Plan Page</div>,
}));
vi.mock("@pages/LeadAssessmentPage/LeadAssessmentPage", () => ({
  LeadAssessmentPage: () => <div>Lead Assessment Page</div>,
}));
vi.mock("@pages/LeadPersonDetailPage/LeadPersonDetailPage", () => ({
  LeadPersonDetailPage: () => <div>Lead Person Detail Page</div>,
}));
vi.mock("@pages/LeadSquadDetailPage/CapacityRedirect", () => ({
  __esModule: true,
  default: () => <div>Capacity Redirect</div>,
  CapacityRedirect: () => <div>Capacity Redirect</div>,
}));

// Mocks de layouts
vi.mock("@layouts/MainLayout/MainLayout", () => ({
  __esModule: true,
  default: () => (
    <div>
      MainLayout
      <Outlet />
    </div>
  ),
  MainLayout: () => (
    <div>
      MainLayout
      <Outlet />
    </div>
  ),
}));
vi.mock("@layouts/AuthLayout/AuthLayout", () => ({
  __esModule: true,
  default: () => (
    <div>
      AuthLayout
      <Outlet />
    </div>
  ),
  AuthLayout: () => (
    <div>
      AuthLayout
      <Outlet />
    </div>
  ),
}));
vi.mock("@layouts/EmptyLayout/EmptyLayout", () => ({
  __esModule: true,
  default: () => (
    <div>
      EmptyLayout
      <Outlet />
    </div>
  ),
  EmptyLayout: () => (
    <div>
      EmptyLayout
      <Outlet />
    </div>
  ),
}));
vi.mock("@layouts/AdminLayout/AdminLayout", () => ({
  __esModule: true,
  default: () => (
    <div>
      AdminLayout
      <Outlet />
    </div>
  ),
  AdminLayout: () => (
    <div>
      AdminLayout
      <Outlet />
    </div>
  ),
}));
vi.mock("@layouts/ChapterLeadLayout/ChapterLeadLayout", () => ({
  __esModule: true,
  default: () => (
    <div>
      ChapterLeadLayout
      <Outlet />
    </div>
  ),
  ChapterLeadLayout: () => (
    <div>
      ChapterLeadLayout
      <Outlet />
    </div>
  ),
}));

// Mock de AuthGuard
vi.mock("../guards/AuthGuard", () => ({
  __esModule: true,
  default: () => (
    <div>
      AuthGuard
      <Outlet />
    </div>
  ),
  AuthGuard: () => (
    <div>
      AuthGuard
      <Outlet />
    </div>
  ),
}));

// Importar rutas después de los mocks
import { routes } from "../routes";

function TestRouter() {
  return useRoutes(routes);
}

describe("Routes - GestionCapacidad", () => {
  it("should be defined and be an array", () => {
    expect(routes).toBeDefined();
    expect(Array.isArray(routes)).toBe(true);
  });

  it("should have at least 4 main route groups", () => {
    expect(routes.length).toBeGreaterThanOrEqual(4);
  });

  it("renders HomePage on /", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/home.?page/i)).toBeInTheDocument();
  });

  it("renders LoginPage on /auth/login", async () => {
    render(
      <MemoryRouter initialEntries={["/auth/login"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/login.?page/i)).toBeInTheDocument();
  });

  it("renders DashboardPage on /app/dashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/dashboard.?page/i)).toBeInTheDocument();
  });

  it("renders NotFoundPage on unknown route", async () => {
    render(
      <MemoryRouter initialEntries={["/unknown-route-12345"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/not.?found.?page/i)).toBeInTheDocument();
  });

  it("should have AuthLayout for /auth routes", () => {
    const authRoute = routes.find((r) => r.path === "/auth");
    expect(authRoute).toBeDefined();
    expect(authRoute?.children).toBeDefined();
  });

  it("should have AuthGuard for /app routes", () => {
    const appRoute = routes.find((r) => r.path === "/app");
    expect(appRoute).toBeDefined();
    expect(appRoute?.children).toBeDefined();
  });

  it("renders AdminHomePage on /app/admin behind AuthGuard", async () => {
    render(
      <MemoryRouter initialEntries={["/app/admin"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/admin home page/i)).toBeInTheDocument();
    // Estas pantallas estuvieron sin guard mientras la plataforma no tenía
    // forma de saber quién era el usuario. Ahora la tiene.
    expect(screen.getByText("AuthGuard")).toBeInTheDocument();
  });

  it("renders each of the 6 admin screens on their own route", async () => {
    const cases: Array<[string, RegExp]> = [
      ["/app/admin/sprints", /admin sprints page/i],
      ["/app/admin/parametros", /admin parameters page/i],
      ["/app/admin/habilidades", /admin skills page/i],
      ["/app/admin/lineas", /admin expertise lines page/i],
      ["/app/admin/devops", /admin devops page/i],
    ];

    for (const [path, expected] of cases) {
      const { unmount } = render(
        <MemoryRouter initialEntries={[path]}>
          <React.Suspense fallback={null}>
            <TestRouter />
          </React.Suspense>
        </MemoryRouter>
      );
      expect(await screen.findByText(expected)).toBeInTheDocument();
      unmount();
    }
  });

  it("guards the /app/admin group and keeps its 6 screens under the layout", () => {
    const adminRoute = routes.find((r) => r.path === "/app/admin");
    expect(adminRoute).toBeDefined();
    // El guard envuelve al layout, así que el grupo tiene un solo hijo —el
    // layout— y las 6 pantallas cuelgan de él. Sin sesión no se llega a montar
    // el shell, y no se ve un sidebar vacío antes de redirigir.
    expect(adminRoute?.children).toHaveLength(1);
    expect(adminRoute?.children?.[0].children).toHaveLength(6);
  });

  it("renders ChapterLeadHomePage on /app/lead behind AuthGuard", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/chapter lead home page/i)
    ).toBeInTheDocument();
    expect(screen.getByText("AuthGuard")).toBeInTheDocument();
  });

  it("renders LeadSquadsPage on /app/lead/celulas", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/celulas"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/lead squads page/i)).toBeInTheDocument();
  });

  it("renders LeadPeoplePage on /app/lead/personas", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/personas"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/lead people page/i)).toBeInTheDocument();
  });

  it("renders LeadSquadDetailPage on /app/lead/celulas/:id", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/celulas/abc"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/lead squad detail page/i)
    ).toBeInTheDocument();
  });

  it("renders LeadPersonDetailPage on /app/lead/personas/:id", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/personas/abc"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/lead person detail page/i)
    ).toBeInTheDocument();
  });

  it("renders LeadAssessmentPage on /app/lead/personas/:id/evaluacion", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/personas/abc/evaluacion"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/lead assessment page/i)
    ).toBeInTheDocument();
  });

  it("renders LeadCareerPlanPage on /app/lead/competencias", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/competencias"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/lead career plan page/i)
    ).toBeInTheDocument();
  });

  it("renders LeadPersonPlanPage on /app/lead/competencias/:personId", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/competencias/abc"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(
      await screen.findByText(/lead person plan page/i)
    ).toBeInTheDocument();
  });

  it("renders LeadAbsencesPage on /app/lead/ausencias", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/ausencias"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/lead absences page/i)).toBeInTheDocument();
  });

  it("renders LeadBacklogPage on /app/lead/backlog", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/backlog"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/lead backlog page/i)).toBeInTheDocument();
  });

  it("keeps /app/lead/capacidades as a redirect, not a screen", async () => {
    render(
      <MemoryRouter initialEntries={["/app/lead/capacidades"]}>
        <React.Suspense fallback={null}>
          <TestRouter />
        </React.Suspense>
      </MemoryRouter>
    );
    expect(await screen.findByText(/capacity redirect/i)).toBeInTheDocument();
  });

  it("guards the /app/lead group and keeps its screens under the layout", () => {
    const leadRoute = routes.find((r) => r.path === "/app/lead");
    expect(leadRoute).toBeDefined();
    expect(leadRoute?.children).toHaveLength(1);
    // inicio, celulas, celulas/:id, personas, personas/:id,
    // personas/:id/evaluacion, competencias, competencias/:personId,
    // ausencias, backlog, iniciativas, iniciativas/:id/evaluacion,
    // facturacion, facturacion/:id, capacidades (redirect)
    expect(leadRoute?.children?.[0].children).toHaveLength(15);
  });

  it("keeps the forbidden screen outside the guards", () => {
    // Es adonde el guard manda a quien tiene sesión pero no el rol: si
    // estuviera detrás del mismo guard que lo rechazó, quedaría en un ciclo.
    const forbidden = routes.find((r) => r.path === "/app/sin-permisos");
    expect(forbidden).toBeDefined();
    expect(forbidden?.children).toBeUndefined();
  });
});
