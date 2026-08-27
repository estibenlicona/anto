import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Navbar } from "./navbar";

/**
 * jsdom no trae `matchMedia`, y `useNarrowViewport` lo llama sin guarda al
 * montar — a diferencia de AppShell, que sí lo chequea. Se repone acá y no en
 * `vitest.setup.ts` porque es lo que necesita esta prueba, no el catálogo
 * entero: siempre ancho, que es el caso donde el nombre de la persona se ve
 * junto al avatar.
 */
beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

function renderNavbar(props: Partial<Parameters<typeof Navbar>[0]> = {}) {
  return render(
    <Navbar
      product="Dimensionamiento TI"
      user={{ name: "Chapter Lead", role: "Tu chapter", initials: "CL" }}
      userMenu={[{ label: "Cerrar sesión", destructive: true }]}
      {...props}
    />,
  );
}

function accountTrigger(): HTMLElement {
  return screen.getByRole("button", { name: /Chapter Lead/ });
}

/**
 * Las aserciones miran las clases del disparador y no un color computado:
 * jsdom no aplica Tailwind, así que el estilo real no existe en la prueba.
 * Lo que sí se puede fijar es que el helper de realce no vuelva a colarse
 * acá — que es exactamente lo que había pasado.
 */
describe("Navbar · disparador de cuenta", () => {
  it("no declara superficie de realce en hover ni con el panel abierto", () => {
    renderNavbar();
    const trigger = accountTrigger();

    expect(trigger.className).not.toMatch(/hover:bg-/);
    expect(trigger.className).not.toMatch(/data-\[state=open\]:bg-/);

    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);

    // Abierto de verdad: Radix marca el disparador y el panel está en pantalla.
    expect(trigger).toHaveAttribute("data-state", "open");
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
    expect(trigger.className).not.toMatch(/data-\[state=open\]:bg-/);
  });

  it("conserva el anillo de foco por teclado", () => {
    renderNavbar();
    const trigger = accountTrigger();

    expect(trigger.className).toContain("focus-visible:ring-focus");
    expect(trigger.className).toContain("focus-visible:ring-brand-focus-ring");
  });

  it("tampoco lo declara en la variante clara", () => {
    renderNavbar({ variant: "light" });

    expect(accountTrigger().className).not.toMatch(/hover:bg-|data-\[state=open\]:bg-/);
  });

  it("abierto con el puntero, al cerrar suelta el foco", async () => {
    renderNavbar();
    const trigger = accountTrigger();

    // Enfocarlo primero es lo que hace que la prueba pruebe algo: sin esto,
    // "no quedó enfocado" se cumpliría también si nunca lo hubiera estado.
    trigger.focus();
    expect(trigger).toHaveFocus();

    fireEvent.pointerDown(trigger);
    fireEvent.click(trigger);
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    await waitFor(() => expect(trigger).not.toHaveFocus());
  });

  it("abierto con el teclado, el foco vuelve al disparador", async () => {
    renderNavbar();
    const trigger = accountTrigger();

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    fireEvent.click(trigger);
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });

    // Sin puntero de por medio no hay blur que devolver: quien navega por
    // teclado tiene que recuperar el foco donde lo dejó, con su anillo.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("las demás utilidades conservan su realce", () => {
    renderNavbar({ notifications: [{ id: "1", label: "Una novedad", timestamp: "hace 2 h", unread: true }] });

    // La campana y el enlace de utilidad sí son rectangulares: el realce es suyo.
    expect(screen.getByRole("button", { name: /Notificaciones/ }).className).toMatch(/hover:bg-/);
    expect(screen.getByText("Ayuda").className).toMatch(/hover:bg-/);
  });
});
