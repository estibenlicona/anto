import { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";

const router = createBrowserRouter(routes);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<div>Cargando ....</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
};
