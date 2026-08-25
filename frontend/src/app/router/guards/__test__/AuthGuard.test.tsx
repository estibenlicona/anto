import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "@app/providers/AuthContext";
import {
  deriveAuthSession,
  type AppRole,
  type Session,
} from "@features/auth-session";
import { AuthGuard } from "../AuthGuard";

function sessionWith(roles: AppRole[]): Session {
  return {
    status: "authenticated",
    user: { id: "u1", name: "Ana", username: "ana@tuya.com" },
    roles,
    scopes: [],
    claims: {},
    accessToken: "t",
  };
}

/**
 * El guard se prueba contra el puerto directamente, sin pasar por el host ni
 * por el simulador: lo que interesa es su decisión dada una sesión, no de
 * dónde salió esa sesión.
 */
function renderGuard(
  session: Session,
  { roles, isLoading = false }: { roles?: AppRole[]; isLoading?: boolean } = {}
) {
  return render(
    <AuthContext.Provider value={deriveAuthSession(session, isLoading)}>
      <MemoryRouter initialEntries={["/protegida"]}>
        <Routes>
          <Route element={<AuthGuard roles={roles} />}>
            <Route path="/protegida" element={<div>Contenido</div>} />
          </Route>
          <Route path="/auth/login" element={<div>Pantalla de login</div>} />
          <Route path="/app/sin-permisos" element={<div>Sin permisos</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("AuthGuard", () => {
  it("redirects to login when there is no session", () => {
    renderGuard({ status: "anonymous" });
    expect(screen.getByText("Pantalla de login")).toBeInTheDocument();
  });

  it("renders the route when authenticated and no role is required", () => {
    renderGuard(sessionWith([]));
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("renders the route when the session has one of the required roles", () => {
    renderGuard(sessionWith(["chapter-lead"]), {
      roles: ["admin", "chapter-lead"],
    });
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("sends an authenticated user without the role to the forbidden screen, not to login", () => {
    renderGuard(sessionWith(["chapter-lead"]), { roles: ["admin"] });
    expect(screen.getByText("Sin permisos")).toBeInTheDocument();
    // Mandarlo a login sería engañoso: ya inició sesión, y repetirlo no le da
    // el rol que le falta.
    expect(screen.queryByText("Pantalla de login")).not.toBeInTheDocument();
  });

  it("renders nothing while the session is still resolving", () => {
    // Sin esto se expulsaría a login a un usuario que sí tiene sesión, durante
    // el instante en que todavía no se resolvió.
    renderGuard({ status: "anonymous" }, { isLoading: true });
    expect(screen.queryByText("Pantalla de login")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });
});
