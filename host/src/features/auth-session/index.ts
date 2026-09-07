export {
  APP_ROLES,
  ANONYMOUS_SESSION,
  type AppRole,
  type AuthSession,
  type AuthenticatedSession,
  type AnonymousSession,
  type HostAuth,
  type HostSessionActions,
  type HostSessionSource,
  type Session,
  type SessionUser,
} from "./types";
export { deriveAuthSession } from "./deriveAuthSession";
export { createSessionStore, type SessionStore } from "./sessionStore";
export {
  ENTRA_ROLE_TO_APP_ROLE,
  mapEntraRoles,
  splitScopes,
} from "./entraRoles";
export {
  consumeReturnTo,
  rememberReturnTo,
  sanitizeReturnTo,
} from "./returnTo";
