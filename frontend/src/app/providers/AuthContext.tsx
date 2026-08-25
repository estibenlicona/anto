import { createContext } from "react";
import type { AuthSession } from "@features/auth-session";

/**
 * El contexto expone el puerto de sesión y nada más.
 *
 * Ya no hay `login(user, token)`: como microfrontend, esta aplicación no
 * inicia sesión. La produce el host —o el simulador en desarrollo— y acá sólo
 * se consume. Quién la provee se decide una sola vez, en el composition root.
 */
export const AuthContext = createContext<AuthSession | undefined>(undefined);
