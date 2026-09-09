import React, { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import { useAuth } from "@features/authentication/index";
import {
  MODEL_VERSION_ROUTE,
  PARAMETERS_ROUTE,
} from "@features/admin-shell/adapters/ParametersRoutes";
import { modulePath } from "@shared/services/modulePath";
import type { CapacityPermission } from "@features/auth-session";
import { CAPACITY_SECTION_PERMISSION } from "@features/capacity-shell/navigation";
import {
  CapacityScopeProvider,
  type CapacityScope,
} from "@features/capacity-shell/CapacityScopeContext";
import { CapacityShell } from "./CapacityShell";

const ChapterLeadHomePage = lazy(() =>
  import("@pages/ChapterLeadHomePage/ChapterLeadHomePage").then((m) => ({
    default: m.ChapterLeadHomePage,
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
const AdminModelVersionPage = lazy(() =>
  import("@pages/AdminModelVersionPage/AdminModelVersionPage").then((m) => ({
    default: m.AdminModelVersionPage,
  }))
);
const AdminSkillsPage = lazy(() =>
  import("@pages/AdminSkillsPage/AdminSkillsPage").then((m) => ({
    default: m.AdminSkillsPage,
  }))
);
const AdminExpertiseLinesPage = lazy(() =>
  import("@pages/AdminExpertiseLinesPage/AdminExpertiseLinesPage").then(
    (m) => ({ default: m.AdminExpertiseLinesPage })
  )
);
const AdminDevOpsPage = lazy(() =>
  import("@pages/AdminDevOpsPage/AdminDevOpsPage").then((m) => ({
    default: m.AdminDevOpsPage,
  }))
);
const AdminTeamsPage = lazy(() =>
  import("@pages/AdminTeamsPage/AdminTeamsPage").then((m) => ({
    default: m.AdminTeamsPage,
  }))
);
const LeadSquadsPage = lazy(() =>
  import("@pages/LeadSquadsPage/LeadSquadsPage").then((m) => ({
    default: m.LeadSquadsPage,
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
const LeadPeoplePage = lazy(() =>
  import("@pages/LeadPeoplePage/LeadPeoplePage").then((m) => ({
    default: m.LeadPeoplePage,
  }))
);
const LeadPersonDetailPage = lazy(() =>
  import("@pages/LeadPersonDetailPage/LeadPersonDetailPage").then((m) => ({
    default: m.LeadPersonDetailPage,
  }))
);
const LeadAssessmentPage = lazy(() =>
  import("@pages/LeadAssessmentPage/LeadAssessmentPage").then((m) => ({
    default: m.LeadAssessmentPage,
  }))
);
const LeadCareerPlanPage = lazy(() =>
  import("@pages/LeadCareerPlanPage/LeadCareerPlanPage").then((m) => ({
    default: m.LeadCareerPlanPage,
  }))
);
const LeadPersonPlanPage = lazy(() =>
  import("@pages/LeadPersonPlanPage/LeadPersonPlanPage").then((m) => ({
    default: m.LeadPersonPlanPage,
  }))
);
const LeadAbsencesPage = lazy(() =>
  import("@pages/LeadAbsencesPage/LeadAbsencesPage").then((m) => ({
    default: m.LeadAbsencesPage,
  }))
);
const LeadDedicationPage = lazy(() =>
  import("@pages/LeadDedicationPage/LeadDedicationPage").then((m) => ({
    default: m.LeadDedicationPage,
  }))
);
const LeadCollaboratorDashboardPage = lazy(() =>
  import("@pages/LeadCollaboratorDashboardPage/LeadCollaboratorDashboardPage").then(
    (m) => ({ default: m.LeadCollaboratorDashboardPage })
  )
);
const DedicationRedirect = lazy(() =>
  import("@pages/LeadDedicationPage/DedicationRedirect").then((m) => ({
    default: m.DedicationRedirect,
  }))
);
const LeadInitiativesPage = lazy(() =>
  import("@pages/LeadInitiativesPage/LeadInitiativesPage").then((m) => ({
    default: m.LeadInitiativesPage,
  }))
);
const LeadInitiativeDetailPage = lazy(() =>
  import("@pages/LeadInitiativeDetailPage/LeadInitiativeDetailPage").then(
    (m) => ({ default: m.LeadInitiativeDetailPage })
  )
);
const LeadInitiativeEvaluationPage = lazy(() =>
  import("@pages/LeadInitiativeEvaluationPage/LeadInitiativeEvaluationPage").then(
    (m) => ({ default: m.LeadInitiativeEvaluationPage })
  )
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
const ForbiddenPage = lazy(() =>
  import("@pages/ForbiddenPage/ForbiddenPage").then((m) => ({
    default: m.ForbiddenPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@pages/NotFoundPage/NotFoundPage").then((m) => ({
    default: m.NotFoundPage,
  }))
);

/**
 * Guard por permiso de sección: sin el permiso, el aviso se muestra en el
 * lugar (sin redirigir — la URL profunda se conserva y el host no se entera).
 * La sesión la garantiza el host antes de montar el módulo; si el contrato
 * reporta anónimo (estado transitorio), el mismo aviso aplica.
 */
const RequirePermission: React.FC<{
  permission: CapacityPermission;
  children: React.ReactNode;
}> = ({ permission, children }) => {
  const { isLoading, hasPermission } = useAuth();
  if (isLoading) return null;
  if (!hasPermission(permission)) return <ForbiddenPage />;
  return <>{children}</>;
};

const P = CAPACITY_SECTION_PERMISSION;

/**
 * Una pantalla detrás de su permiso y con su alcance declarado. Las rutas de
 * "Mi Línea" montan **el mismo componente** que su gemela sin acotar: lo único
 * que las distingue es el `scope`, que los hooks leen para pedir los datos
 * recortados. Si en vez de esto se duplicaran las pantallas, cada arreglo
 * habría que hacerlo dos veces.
 */
const Scoped: React.FC<{
  permission: CapacityPermission;
  scope: CapacityScope;
  children: React.ReactNode;
}> = ({ permission, scope, children }) => (
  <RequirePermission permission={permission}>
    <CapacityScopeProvider scope={scope}>{children}</CapacityScopeProvider>
  </RequirePermission>
);

/**
 * Enlaces guardados del árbol standalone (`/app/lead/...`, `/app/admin/...`):
 * el resto del camino y el query viajan tal cual a la ruta plana equivalente
 * bajo la base del módulo.
 */
const LegacyTreeRedirect: React.FC = () => {
  const rest = useParams()["*"] ?? "";
  const { search, hash } = useLocation();
  return <Navigate replace to={`${modulePath(rest)}${search}${hash}`} />;
};

/**
 * Inicio según permisos: la torre de control para quien gestiona capacidad,
 * el estado de la plataforma para quien sólo configura; sin ninguno, el
 * aviso de permisos.
 */
const CapacityHome: React.FC = () => {
  const { isLoading, hasPermission } = useAuth();
  if (isLoading) return null;
  if (hasPermission("Celulas", "Equipos", "Personas", "Dedicacion")) {
    return <ChapterLeadHomePage />;
  }
  if (
    hasPermission("Sprints", "Parametros", "Habilidades", "Lineas", "DevOps")
  ) {
    return <AdminHomePage />;
  }
  return <ForbiddenPage />;
};

/** Las rutas del módulo, relativas a la base bajo la que el host lo montó. */
export const CapacityRoutes: React.FC<{
  basePath: string;
  topOffset: number;
}> = ({ basePath, topOffset }) => (
  <Suspense fallback={null}>
    <Routes>
      <Route
        element={<CapacityShell basePath={basePath} topOffset={topOffset} />}
      >
        <Route index element={<CapacityHome />} />
        {/* Mi Línea: las mismas pantallas de gente, acotadas a los
            colaboradores de quien mira. Mismo componente, mismo permiso; sólo
            cambia el alcance con el que piden los datos. */}
        <Route
          path="mi-linea/colaboradores"
          element={
            <Scoped permission={P["mi-linea-colaboradores"]} scope="mine">
              <LeadPeoplePage />
            </Scoped>
          }
        />
        <Route
          path="mi-linea/ausencias"
          element={
            <Scoped permission={P["mi-linea-ausencias"]} scope="mine">
              <LeadAbsencesPage />
            </Scoped>
          }
        />
        <Route
          path="mi-linea/dedicacion"
          element={
            <Scoped permission={P["mi-linea-dedicacion"]} scope="mine">
              <LeadDedicationPage />
            </Scoped>
          }
        />
        <Route
          path="mi-linea/competencias"
          element={
            <Scoped permission={P["mi-linea-competencias"]} scope="mine">
              <LeadCareerPlanPage />
            </Scoped>
          }
        />
        <Route
          path="mi-linea/facturacion"
          element={
            <Scoped permission={P["mi-linea-facturacion"]} scope="mine">
              <LeadBillingPage />
            </Scoped>
          }
        />
        <Route
          path="iniciativas"
          element={
            <RequirePermission permission={P["lead-iniciativas"]}>
              <LeadInitiativesPage />
            </RequirePermission>
          }
        />
        <Route
          path="iniciativas/:id"
          element={
            <RequirePermission permission={P["lead-iniciativas"]}>
              <LeadInitiativeDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="iniciativas/:id/evaluacion"
          element={
            <RequirePermission permission={P["lead-iniciativas"]}>
              <LeadInitiativeEvaluationPage />
            </RequirePermission>
          }
        />
        <Route
          path="celulas"
          element={
            <RequirePermission permission={P["lead-celulas"]}>
              <LeadSquadsPage />
            </RequirePermission>
          }
        />
        <Route
          path="celulas/:id"
          element={
            <RequirePermission permission={P["lead-celulas"]}>
              <LeadSquadDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="personas"
          element={
            <RequirePermission permission={P["lead-personas"]}>
              <LeadPeoplePage />
            </RequirePermission>
          }
        />
        <Route
          path="personas/:id"
          element={
            <RequirePermission permission={P["lead-personas"]}>
              <LeadPersonDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="personas/:id/evaluacion"
          element={
            <RequirePermission permission={P["lead-personas"]}>
              <LeadAssessmentPage />
            </RequirePermission>
          }
        />
        <Route
          path="competencias"
          element={
            <RequirePermission permission={P["lead-competencias"]}>
              <LeadCareerPlanPage />
            </RequirePermission>
          }
        />
        <Route
          path="competencias/:personId"
          element={
            <RequirePermission permission={P["lead-competencias"]}>
              <LeadPersonPlanPage />
            </RequirePermission>
          }
        />
        <Route
          path="ausencias"
          element={
            <RequirePermission permission={P["lead-ausencias"]}>
              <LeadAbsencesPage />
            </RequirePermission>
          }
        />
        <Route
          path="dedicacion"
          element={
            <RequirePermission permission={P["lead-dedicacion"]}>
              <LeadDedicationPage />
            </RequirePermission>
          }
        />
        <Route
          path="dedicacion/:personId"
          element={
            <RequirePermission permission={P["lead-dedicacion"]}>
              <LeadCollaboratorDashboardPage />
            </RequirePermission>
          }
        />
        <Route path="backlog" element={<DedicationRedirect />} />
        <Route path="backlog/*" element={<DedicationRedirect />} />
        <Route path="capacidades" element={<CapacityRedirect />} />
        <Route
          path="facturacion"
          element={
            <RequirePermission permission={P["lead-facturacion"]}>
              <LeadBillingPage />
            </RequirePermission>
          }
        />
        <Route
          path="facturacion/:id"
          element={
            <RequirePermission permission={P["lead-facturacion"]}>
              <LeadBillingDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="sprints"
          element={
            <RequirePermission permission={P["admin-sprints"]}>
              <AdminSprintsPage />
            </RequirePermission>
          }
        />
        <Route
          path={PARAMETERS_ROUTE}
          element={
            <RequirePermission permission={P["admin-parametros"]}>
              <AdminParametersPage />
            </RequirePermission>
          }
        />
        {/* La sección del editor es un segmento de ruta y no estado local: así
            un impedimento de la validación lleva a donde se corrige con un
            enlace, y recargar abre donde estaba (design.md — D8). */}
        <Route
          path={MODEL_VERSION_ROUTE}
          element={
            <RequirePermission permission={P["admin-parametros"]}>
              <AdminModelVersionPage />
            </RequirePermission>
          }
        />
        <Route
          path="habilidades"
          element={
            <RequirePermission permission={P["admin-habilidades"]}>
              <AdminSkillsPage />
            </RequirePermission>
          }
        />
        <Route
          path="lineas"
          element={
            <RequirePermission permission={P["admin-lineas"]}>
              <AdminExpertiseLinesPage />
            </RequirePermission>
          }
        />
        <Route
          path="equipos"
          element={
            <RequirePermission permission={P["lead-equipos"]}>
              <AdminTeamsPage />
            </RequirePermission>
          }
        />
        <Route
          path="devops"
          element={
            <RequirePermission permission={P["admin-devops"]}>
              <AdminDevOpsPage />
            </RequirePermission>
          }
        />
        {/* Rutas del árbol standalone: aterrizan en su equivalente nuevo,
            conservando el resto del camino y el query — los segmentos son los
            mismos (`/app/lead/celulas/7` ↔ `celulas/7`). Un `..` relativo
            caía siempre en Inicio. */}
        <Route path="app/lead/*" element={<LegacyTreeRedirect />} />
        <Route path="app/admin/*" element={<LegacyTreeRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Suspense>
);
