/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { RouteObject } from "react-router-dom";

import { MainLayout } from "@layouts/MainLayout/MainLayout";
import { AuthLayout } from "@layouts/AuthLayout/AuthLayout";
import { EmptyLayout } from "@layouts/EmptyLayout/EmptyLayout";
import { AuthGuard } from "./guards/AuthGuard";

// AdminLayout se carga en lazy (no como los demás layouts, más livianos):
// trae @tuya-ui/components y sus dependencias de Radix UI, que de otro modo
// entrarían al bundle principal aunque el usuario nunca visite /app/admin.
const AdminLayout = lazy(() =>
  import("@layouts/AdminLayout/AdminLayout").then((m) => ({
    default: m.AdminLayout,
  }))
);
const ChapterLeadLayout = lazy(() =>
  import("@layouts/ChapterLeadLayout/ChapterLeadLayout").then((m) => ({
    default: m.ChapterLeadLayout,
  }))
);

/**
 * Routes - GestionCapacidad (Standalone)
 *
 * Configuración de rutas para aplicación standalone.
 * Incluye todos los layouts y guards necesarios.
 */

// Lazy load pages
const HomePage = lazy(() =>
  import("@pages/HomePage/HomePage").then((m) => ({ default: m.HomePage }))
);
const LoginPage = lazy(() =>
  import("@pages/LoginPage/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("@pages/DashboardPage/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@pages/NotFoundPage/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  }))
);
const AdminHomePage = lazy(() =>
  import("@pages/AdminHomePage/AdminHomePage").then((m) => ({
    default: m.AdminHomePage,
  }))
);
const AdminSprintsPage = lazy(() =>
  import("@pages/AdminSprintsPage/AdminSprintsPage").then((m) => ({
    default: m.AdminSprintsPage,
  }))
);
const AdminParametersPage = lazy(() =>
  import("@pages/AdminParametersPage/AdminParametersPage").then((m) => ({
    default: m.AdminParametersPage,
  }))
);
const AdminSkillsPage = lazy(() =>
  import("@pages/AdminSkillsPage/AdminSkillsPage").then((m) => ({
    default: m.AdminSkillsPage,
  }))
);
const AdminExpertiseLinesPage = lazy(() =>
  import("@pages/AdminExpertiseLinesPage/AdminExpertiseLinesPage").then((m) => ({
    default: m.AdminExpertiseLinesPage,
  }))
);
const AdminDevOpsPage = lazy(() =>
  import("@pages/AdminDevOpsPage/AdminDevOpsPage").then((m) => ({
    default: m.AdminDevOpsPage,
  }))
);
const ChapterLeadHomePage = lazy(() =>
  import("@pages/ChapterLeadHomePage/ChapterLeadHomePage").then((m) => ({
    default: m.ChapterLeadHomePage,
  }))
);
const LeadSquadsPage = lazy(() =>
  import("@pages/LeadSquadsPage/LeadSquadsPage").then((m) => ({
    default: m.LeadSquadsPage,
  }))
);
const ForbiddenPage = lazy(() =>
  import("@pages/ForbiddenPage/ForbiddenPage").then((m) => ({
    default: m.ForbiddenPage,
  }))
);
const LeadPeoplePage = lazy(() =>
  import("@pages/LeadPeoplePage/LeadPeoplePage").then((m) => ({
    default: m.LeadPeoplePage,
  }))
);
const LeadInitiativesPage = lazy(() =>
  import("@pages/LeadInitiativesPage/LeadInitiativesPage").then((m) => ({
    default: m.LeadInitiativesPage,
  }))
);
const LeadInitiativeEvaluationPage = lazy(() =>
  import("@pages/LeadInitiativeEvaluationPage/LeadInitiativeEvaluationPage").then(
    (m) => ({
      default: m.LeadInitiativeEvaluationPage,
    })
  )
);
const LeadAbsencesPage = lazy(() =>
  import("@pages/LeadAbsencesPage/LeadAbsencesPage").then((m) => ({
    default: m.LeadAbsencesPage,
  }))
);
const LeadBillingPage = lazy(() =>
  import("@pages/LeadBillingPage/LeadBillingPage").then((m) => ({
    default: m.LeadBillingPage,
  }))
);
const LeadBillingDetailPage = lazy(() =>
  import("@pages/LeadBillingDetailPage/LeadBillingDetailPage").then((m) => ({
    default: m.LeadBillingDetailPage,
  }))
);
const LeadBacklogPage = lazy(() =>
  import("@pages/LeadBacklogPage/LeadBacklogPage").then((m) => ({
    default: m.LeadBacklogPage,
  }))
);
const LeadPersonDetailPage = lazy(() =>
  import("@pages/LeadPersonDetailPage/LeadPersonDetailPage").then((m) => ({
    default: m.LeadPersonDetailPage,
  }))
);
const LeadPersonPlanPage = lazy(() =>
  import("@pages/LeadPersonPlanPage/LeadPersonPlanPage").then((m) => ({
    default: m.LeadPersonPlanPage,
  }))
);
const LeadCareerPlanPage = lazy(() =>
  import("@pages/LeadCareerPlanPage/LeadCareerPlanPage").then((m) => ({
    default: m.LeadCareerPlanPage,
  }))
);
const LeadAssessmentPage = lazy(() =>
  import("@pages/LeadAssessmentPage/LeadAssessmentPage").then((m) => ({
    default: m.LeadAssessmentPage,
  }))
);
const LeadSquadDetailPage = lazy(() =>
  import("@pages/LeadSquadDetailPage/LeadSquadDetailPage").then((m) => ({
    default: m.LeadSquadDetailPage,
  }))
);
const CapacityRedirect = lazy(() =>
  import("@pages/LeadSquadDetailPage/CapacityRedirect").then((m) => ({
    default: m.CapacityRedirect,
  }))
);

/**
 * Rutas principales de la aplicación
 *
 * Estructura:
 * - / : Página principal (EmptyLayout)
 * - /auth/* : Rutas de autenticación (AuthLayout)
 * - /app/* : Rutas protegidas con AuthGuard (MainLayout)
 * - * : 404 Not Found
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <EmptyLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      // Agregar más rutas de auth aquí:
      // {
      //   path: "register",
      //   element: <RegisterPage />,
      // },
    ],
  },
  {
    path: "/app",
    element: <AuthGuard />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          // Agregar más rutas protegidas aquí:
          // {
          //   path: "profile",
          //   element: <ProfilePage />,
          // },
        ],
      },
    ],
  },
  {
    // El guard envuelve al layout, no al revés: sin sesión no se llega a
    // montar el shell, así que no se ve un sidebar vacío antes de redirigir.
    path: "/app/admin",
    element: <AuthGuard roles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminHomePage />,
          },
          {
            path: "sprints",
            element: <AdminSprintsPage />,
          },
          {
            path: "parametros",
            element: <AdminParametersPage />,
          },
          {
            path: "habilidades",
            element: <AdminSkillsPage />,
          },
          {
            path: "lineas",
            element: <AdminExpertiseLinesPage />,
          },
          {
            path: "devops",
            element: <AdminDevOpsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "/app/lead",
    element: <AuthGuard roles={["chapter-lead"]} />,
    children: [
      {
        element: <ChapterLeadLayout />,
        children: [
          {
            index: true,
            element: <ChapterLeadHomePage />,
          },
          {
            path: "celulas",
            element: <LeadSquadsPage />,
          },
          {
            path: "celulas/:id",
            element: <LeadSquadDetailPage />,
          },
          {
            path: "personas",
            element: <LeadPeoplePage />,
          },
          {
            path: "personas/:id",
            element: <LeadPersonDetailPage />,
          },
          {
            path: "personas/:id/evaluacion",
            element: <LeadAssessmentPage />,
          },
          {
            path: "competencias",
            element: <LeadCareerPlanPage />,
          },
          {
            path: "competencias/:personId",
            element: <LeadPersonPlanPage />,
          },
          {
            path: "ausencias",
            element: <LeadAbsencesPage />,
          },
          {
            path: "backlog",
            element: <LeadBacklogPage />,
          },
          {
            path: "iniciativas",
            element: <LeadInitiativesPage />,
          },
          {
            path: "iniciativas/:id/evaluacion",
            element: <LeadInitiativeEvaluationPage />,
          },
          {
            path: "facturacion",
            element: <LeadBillingPage />,
          },
          {
            path: "facturacion/:id",
            element: <LeadBillingDetailPage />,
          },
          {
            // Ruta retirada: redirige al detalle de la célula o al listado.
            path: "capacidades",
            element: <CapacityRedirect />,
          },
        ],
      },
    ],
  },
  {
    // Fuera de los guards: es adonde el guard manda a quien tiene sesión pero
    // no el rol, así que no puede estar detrás del mismo guard que lo rechazó.
    path: "/app/sin-permisos",
    element: <ForbiddenPage />,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
