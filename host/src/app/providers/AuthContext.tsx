import { createContext } from "react";
import type { HostAuth } from "@features/auth-session";

/**
 * El contexto expone el puerto de sesión, las acciones del host (iniciar y
 * cerrar sesión, pedir un token) y la fuente con la que la sesión se entrega
 * a los módulos. Quién lo provee —la nube de Entra o el emulador local— se decide una sola
 * vez, en `main.tsx`.
 */
export const AuthContext = createContext<HostAuth | undefined>(undefined);
