import React, { useEffect } from "react";
import { CapacitySessionBridge } from "./CapacitySessionBridge";
import { CapacityRoutes } from "./routes";
import type { CapacityModuleProps } from "./contract";
import { setAccessTokenProvider } from "@shared/services/accessToken";
import { CAPACITY_API_SCOPES } from "./contract";

/**
 * La entrada federada del módulo de Gestión de Capacidad: lo único que el
 * host importa (`capacidad/module`). Recibe el contrato de montaje y arma
 * sesión, permisos, shell y rutas. No trae barra superior, login ni sesión
 * propia: todo eso es del host.
 */
const CapacityModule: React.FC<CapacityModuleProps> = ({
  source,
  acquireToken,
  basePath,
  topOffset,
}) => {
  // El cliente HTTP del módulo adjunta el token de la API propia — el mismo
  // que informa los permisos — sin saber quién lo provee.
  useEffect(
    () => setAccessTokenProvider(() => acquireToken(CAPACITY_API_SCOPES)),
    [acquireToken]
  );

  // En desarrollo los datos siguen saliendo de MSW. El worker debe vivir en
  // el origen del host (los service workers son por origen): el host sirve
  // una copia de `mockServiceWorker.js` y acá se registra contra el origen
  // actual. La condición por literal deja la rama muerta en producción y los
  // mocks no entran al bundle del remote.
  useEffect(() => {
    if (import.meta.env.VITE_USE_MOCKS === "true") {
      void import("../mocks/browser").then(({ worker }) =>
        worker.start({
          onUnhandledRequest: "bypass",
          serviceWorker: {
            url: `${window.location.origin}/mockServiceWorker.js`,
          },
        })
      );
    }
  }, []);

  return (
    <CapacitySessionBridge source={source} acquireToken={acquireToken}>
      <CapacityRoutes basePath={basePath} topOffset={topOffset} />
    </CapacitySessionBridge>
  );
};

export default CapacityModule;
