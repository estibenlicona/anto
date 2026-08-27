import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "./app-shell";
import { Icon } from "./icon";

const STORAGE_KEY = "tuya-ui:sidebar-collapsed";

function renderShell(props: Partial<Parameters<typeof AppShell>[0]> = {}) {
  return render(
    <AppShell
      product="Dimensionamiento TI"
      groups={[
        {
          label: "Capacidad",
          items: [
            { id: "personas", label: "Personas", href: "/personas", icon: <Icon name="user" size={20} /> },
            { id: "celulas", label: "Células", href: "/celulas", icon: <Icon name="cell" size={20} /> },
          ],
        },
      ]}
      activeId="personas"
      onNavigate={() => {}}
      user={{ name: "Chapter Lead", initials: "CL" }}
      userMenu={[{ label: "Cerrar sesión", destructive: true }]}
      {...props}
    >
      <main>Contenido</main>
    </AppShell>,
  );
}

function hamburger(): HTMLElement {
  return screen.getByRole("button", { name: /la navegación$/ });
}

describe("AppShell", () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it("la hamburguesa alterna el colapso y comunica el estado", () => {
    renderShell();

    expect(hamburger()).toHaveAccessibleName("Contraer la navegación");
    expect(hamburger()).toHaveAttribute("aria-expanded", "true");
    // Expandido: el producto se ve en la cabecera y las etiquetas en la nav.
    expect(screen.getByText("Dimensionamiento TI")).toBeInTheDocument();

    fireEvent.click(hamburger());

    expect(hamburger()).toHaveAccessibleName("Expandir la navegación");
    expect(hamburger()).toHaveAttribute("aria-expanded", "false");
    // Colapsado: la cabecera muestra sólo el cuadro de marca.
    expect(screen.queryByText("Dimensionamiento TI")).not.toBeInTheDocument();
  });

  it("no renderiza la franja de colapso del pie de Sidebar", () => {
    renderShell();

    // Suelto, Sidebar muestra un botón "Colapsar"/"Expandir" al pie; en la
    // fusión el único control es la hamburguesa de la barra.
    expect(screen.queryByRole("button", { name: "Colapsar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Expandir" })).not.toBeInTheDocument();
  });

  it("persiste la preferencia bajo la clave compartida con Sidebar", () => {
    renderShell();
    fireEvent.click(hamburger());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("true");
    fireEvent.click(hamburger());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("false");
  });

  it("una preferencia guardada con Sidebar suelto arranca el shell colapsado", () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    renderShell();
    expect(hamburger()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Dimensionamiento TI")).not.toBeInTheDocument();
  });

  it("defaultCollapsed manda sobre la clave en el primer render", () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    renderShell({ defaultCollapsed: false });
    expect(hamburger()).toHaveAttribute("aria-expanded", "true");
  });

  it("colapsado, los ítems conservan su nombre accesible", () => {
    renderShell({ defaultCollapsed: true });
    // Las etiquetas visibles se van; el nombre viaja en el enlace igual.
    expect(screen.getByRole("link", { name: "Personas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Células" })).toBeInTheDocument();
  });

  it("la cuenta llega a NavbarUtilities y abre su panel", () => {
    renderShell();
    const account = screen.getByRole("button", { name: /Chapter Lead/ });
    fireEvent.pointerDown(account);
    fireEvent.click(account);
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });

  it("el disparador de cuenta no trae realce, y sí su anillo de foco", () => {
    // El shell no dibuja este disparador: lo hereda de NavbarUtilities. La
    // prueba está igual acá porque es el shell el que lo puso en pantalla en
    // Gestión de Capacidad, donde el cuadrado gris alrededor del avatar se
    // reportó. Su par vive en navbar.test.tsx.
    renderShell();
    const account = screen.getByRole("button", { name: /Chapter Lead/ });

    expect(account.className).not.toMatch(/hover:bg-|data-\[state=open\]:bg-/);
    expect(account.className).toContain("focus-visible:ring-focus");
  });

  it("sin onSearch no hay búsqueda; con onSearch aparece", () => {
    const { rerender } = renderShell();
    expect(screen.queryByRole("button", { name: /Buscar/ })).not.toBeInTheDocument();

    rerender(
      <AppShell
        product="Dimensionamiento TI"
        groups={[]}
        activeId=""
        onNavigate={() => {}}
        user={{ name: "Chapter Lead", initials: "CL" }}
        userMenu={[{ label: "Cerrar sesión" }]}
        onSearch={vi.fn()}
      >
        <main>Contenido</main>
      </AppShell>,
    );
    expect(screen.getByRole("button", { name: /Buscar/ })).toBeInTheDocument();
  });
});
