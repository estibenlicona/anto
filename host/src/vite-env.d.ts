/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PUBLIC_URL?: string;
  /** Client ID de la app registration del host en Entra ID. */
  readonly VITE_ENTRA_CLIENT_ID?: string;
  /** Tenant ID (o dominio) del directorio. */
  readonly VITE_ENTRA_TENANT_ID?: string;
  /** Autoridad completa (URL con tenant). Vacío: la nube de Entra. Para el emulador local: https://login.entra.localhost:8443/<tenant>. */
  readonly VITE_ENTRA_AUTHORITY?: string;
  /** Hosts de autoridades conocidas separados por espacio (autoridades no-Microsoft). Vacío con autoridad explícita: se deriva de su URL. */
  readonly VITE_ENTRA_KNOWN_AUTHORITIES?: string;
  /** URI de retorno registrada en Entra. Por defecto, el origen + base de la app. */
  readonly VITE_ENTRA_REDIRECT_URI?: string;
  /** URL del remoteEntry del módulo de Gestión de Capacidad. Vacía: la ruta muestra el placeholder. */
  readonly VITE_MF_CAPACIDAD_URL?: string;
  /** Scopes del token de acceso, separados por espacio (p. ej. `api://<id>/.default`). Vacío: sin token de acceso. */
  readonly VITE_ENTRA_API_SCOPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
