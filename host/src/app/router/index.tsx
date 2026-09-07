import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";

// El host es dueño de la raíz: sin `basename`. La base pública sólo importa
// para la URI de retorno de Entra (ver entraConfig).
const router = createBrowserRouter(routes);

export const AppRouter: React.FC = () => <RouterProvider router={router} />;
