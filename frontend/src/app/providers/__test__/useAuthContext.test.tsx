import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HostAuthProvider } from "@features/auth-session";
import { useAuthContext } from "../useAuthContext";

function Probe() {
  const { isAuthenticated, isLoading } = useAuthContext();
  return (
    <span>
      {String(isAuthenticated)}:{String(isLoading)}
    </span>
  );
}

describe("useAuthContext", () => {
  it("throws when used outside an auth provider", () => {
    // El error explícito es lo que evita que un componente montado fuera del
    // provider vea silenciosamente "sin sesión" y se comporte como si el
    // usuario no tuviera permisos.
    expect(() => render(<Probe />)).toThrow(/within an auth provider/i);
  });

  it("exposes the port when inside a provider", () => {
    render(
      <HostAuthProvider>
        <Probe />
      </HostAuthProvider>
    );
    // Sin `source`, el host no entregó sesión: anónima, no error.
    expect(screen.getByText("false:false")).toBeInTheDocument();
  });
});
