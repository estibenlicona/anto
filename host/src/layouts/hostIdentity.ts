import type { AppRole, Session } from "@features/auth-session";
import type { NavbarUser } from "@tuya-ui/components";

export const PRODUCT_NAME = "Dimensionamiento TI";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador de plataforma",
  "chapter-lead": "Líder de Expertise",
  "tech-lead": "Líder Técnico",
};

/** "Ana Administradora" → "AA"; un solo nombre → sus dos primeras letras. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Lo que la cuenta de la barra muestra de la sesión: nombre, rótulo del rol e iniciales. */
export function navbarUserOf(session: Session): NavbarUser {
  if (session.status !== "authenticated") {
    return { name: "—", initials: "?" };
  }
  const { name } = session.user;
  return {
    name,
    role:
      session.roles.length > 0
        ? ROLE_LABELS[session.roles[0]]
        : "Sin rol asignado",
    initials: initialsOf(name),
  };
}
