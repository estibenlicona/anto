import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { AuthGuard } from "./guards/AuthGuard";
import { HostLayout } from "@layouts/HostLayout";
import { MODULES } from "@features/modules/registry";
import { PortalPage } from "@pages/PortalPage";
import { LoginPage } from "@pages/LoginPage";
import { ModulePlaceholderPage } from "@pages/ModulePlaceholderPage";
import { RemoteModulePage } from "@pages/RemoteModulePage";
import { ForbiddenPage } from "@pages/ForbiddenPage";
import { NotFoundPage } from "@pages/NotFoundPage";

/**
 * Todo salvo el inicio de sesión vive bajo la barra del host y exige sesión.
 * Cada módulo se monta bajo su ruta base con un guard propio por rol: con
 * remote declarado se carga el módulo federado; sin remote, el marcador de
 * "pendiente de integrar".
 */
export const routes: RouteObject[] = [
  { path: "/auth/login", element: <LoginPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <HostLayout />,
        children: [
          { path: "/", element: <PortalPage /> },
          ...MODULES.map<RouteObject>((module) => ({
            element: <AuthGuard roles={module.roles} />,
            children: [
              {
                path: `${module.basePath}/*`,
                element: module.remoteEntry ? (
                  <RemoteModulePage module={module} />
                ) : (
                  <ModulePlaceholderPage module={module} />
                ),
              },
            ],
          })),
          // Rutas de la app standalone retirada: cortesía hacia enlaces guardados.
          {
            path: "/app/admin/*",
            element: <Navigate to="/capacidad" replace />,
          },
          {
            path: "/app/lead/*",
            element: <Navigate to="/capacidad" replace />,
          },
          { path: "/sin-permisos", element: <ForbiddenPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
