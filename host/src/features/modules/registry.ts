import type { AppRole } from "@features/auth-session";

/**
 * El registro de módulos de la plataforma. Es configuración estática por
 * ahora: cuando se cablee Module Federation, cada entrada sumará de dónde
 * cargar el módulo (`remoteEntry`) y ahí sí valdrá la pena que sea remoto.
 */
export interface ModuleDefinition {
  /** URL del remote federado (remoteEntry). Ausente: la ruta muestra el placeholder. */
  remoteEntry?: string;
  id: string;
  name: string;
  description: string;
  /** Color de identidad del módulo para el selector de la barra — dato del módulo, no un rol semántico. */
  color: string;
  /** Ruta base bajo la que se monta, con barra inicial y sin barra final. */
  basePath: string;
  /** Roles que pueden entrar. Omitido: cualquier persona con sesión. */
  roles?: AppRole[];
}

/** Construible para poder probar el registro con y sin remote declarado. */
export function buildModules(env: {
  VITE_MF_CAPACIDAD_URL?: string;
}): ModuleDefinition[] {
  const capacidadRemote = env.VITE_MF_CAPACIDAD_URL?.trim();
  return [
    {
      id: "capacidad",
      name: "Gestión de Capacidad",
      description:
        "Dimensionamiento de iniciativas, células, personas y dedicación real desde Azure DevOps.",
      color: "#C9151F",
      basePath: "/capacidad",
      roles: ["admin", "chapter-lead", "tech-lead"],
      ...(capacidadRemote ? { remoteEntry: capacidadRemote } : {}),
    },
    {
      id: "iniciativas",
      name: "Iniciativas y Células",
      description:
        "Seguimiento de las iniciativas y las células: equipo, resultados y pendientes de cada una.",
      color: "#1F6FEB",
      basePath: "/iniciativas",
      roles: ["admin", "chapter-lead", "tech-lead"],
    },
  ];
}

export const MODULES: ModuleDefinition[] = buildModules(import.meta.env);

/** Los módulos que la persona puede abrir: sin roles declarados, cualquiera con sesión. */
export function visibleModules(
  hasRole: (...roles: AppRole[]) => boolean,
  modules: ModuleDefinition[] = MODULES
): ModuleDefinition[] {
  return modules.filter(
    (module) => !module.roles?.length || hasRole(...module.roles)
  );
}

/** El módulo cuya ruta base prefija la ruta actual, si hay uno. */
export function currentModule(
  pathname: string,
  modules: ModuleDefinition[] = MODULES
): ModuleDefinition | undefined {
  return modules.find(
    (module) =>
      pathname === module.basePath || pathname.startsWith(module.basePath + "/")
  );
}
