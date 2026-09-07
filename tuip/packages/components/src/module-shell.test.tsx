import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ModuleShell } from "./module-shell";
import { Icon } from "./icon";

const STORAGE_KEY = "tuya-ui:sidebar-collapsed";

function renderShell(props: Partial<Parameters<typeof ModuleShell>[0]> = {}) {
  return render(
    <ModuleShell
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
      ariaLabel="Navegación de Capacidad"
      {...props}
    >
      <main>Contenido</main>
    </ModuleShell>,
  );
}

/** La franja de colapso al pie de Sidebar: "Colapsar" expandido, "Expandir" colapsado. */
function collapseControl(): HTMLElement {
  return screen.getByRole("button", { name: /^(Colapsar|Expandir)$/ });
}

function root(container: HTMLElement): HTMLElement {
  return container.firstElementChild as HTMLElement;
}

describe("ModuleShell", () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it("no renderiza barra, cabecera ni hamburguesa: la columna empieza por la navegación", () => {
    const { container } = renderShell();

    expect(container.querySelector("header")).toBeNull();
    expect(screen.queryByRole("button", { name: /la navegación$/ })).not.toBeInTheDocument();
    const aside = container.querySelector("aside")!;
    // El primer hijo de la columna es el landmark de navegación de Sidebar —
    // no hay cabecera de marca: el título visible es de la barra del host.
    expect(aside.firstElementChild).toBe(screen.getByRole("navigation", { name: "Navegación de Capacidad" }));
  });

  it("el control de colapso es la franja al pie y es el último elemento de la columna", () => {
    const { container } = renderShell();

    const control = collapseControl();
    expect(control).toHaveAccessibleName("Colapsar");
    const nav = container.querySelector("aside nav")!;
    expect(nav.lastElementChild!.contains(control)).toBe(true);
  });

  it("la franja alterna el colapso y cambia su rótulo", () => {
    renderShell();

    fireEvent.click(collapseControl());
    expect(collapseControl()).toHaveAccessibleName("Expandir");

    fireEvent.click(collapseControl());
    expect(collapseControl()).toHaveAccessibleName("Colapsar");
  });

  it("colapsada, la franja sigue disponible y los ítems conservan su nombre accesible", () => {
    renderShell({ defaultCollapsed: true });

    expect(collapseControl()).toHaveAccessibleName("Expandir");
    expect(screen.getByRole("link", { name: "Personas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Células" })).toBeInTheDocument();
  });

  it("persiste la preferencia bajo la clave compartida con Sidebar y AppShell", () => {
    renderShell();
    fireEvent.click(collapseControl());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("true");
    fireEvent.click(collapseControl());
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("false");
  });

  it("una preferencia guardada arranca el shell colapsado", () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    renderShell();
    expect(collapseControl()).toHaveAccessibleName("Expandir");
  });

  it("defaultCollapsed manda sobre la clave en el primer render", () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    renderShell({ defaultCollapsed: false });
    expect(collapseControl()).toHaveAccessibleName("Colapsar");
  });

  it("topOffset fija la columna bajo la barra del host", () => {
    const { container } = renderShell({ topOffset: 56 });

    // El componente traduce el número a la variable que gobierna `top` y
    // `height` de la columna; jsdom no compone Tailwind, así que se afirma
    // sobre la variable y sobre las utilidades que la leen.
    expect(root(container).style.getPropertyValue("--tuya-ui-shell-top")).toBe("56px");
    const aside = container.querySelector("aside")!;
    expect(aside.className).toContain("top-[var(--tuya-ui-shell-top)]");
    expect(aside.className).toContain("h-[calc(100vh-var(--tuya-ui-shell-top))]");
  });

  it("sin topOffset la columna ocupa la ventana completa", () => {
    const { container } = renderShell();
    expect(root(container).style.getPropertyValue("--tuya-ui-shell-top")).toBe("0px");
  });
});
