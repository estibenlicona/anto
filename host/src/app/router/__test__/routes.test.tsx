import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { ANONYMOUS_SESSION } from "@features/auth-session";
import { fakeAuth, renderApp, sessionWith } from "../../../test/renderWithAuth";

describe("rutas del host · acceso", () => {
  it("sin sesión, cualquier ruta lleva a iniciar sesión conservando la ruta pedida", () => {
    const { router } = renderApp(fakeAuth(ANONYMOUS_SESSION), ["/capacidad"]);
    expect(
      screen.getByRole("button", { name: "Iniciar sesión con Tuya" })
    ).toBeInTheDocument();
    expect(router.state.location.search).toContain(
      `returnTo=${encodeURIComponent("/capacidad")}`
    );
  });

  it("el botón de inicio de sesión llama a login con la ruta de retorno", () => {
    const auth = fakeAuth(ANONYMOUS_SESSION);
    renderApp(auth, ["/auth/login?returnTo=%2Fcapacidad"]);
    fireEvent.click(
      screen.getByRole("button", { name: "Iniciar sesión con Tuya" })
    );
    expect(auth.login).toHaveBeenCalledWith("/capacidad");
  });

  it("mientras la sesión se resuelve no muestra ni login ni contenido", () => {
    renderApp(fakeAuth(ANONYMOUS_SESSION, { isLoading: true }), ["/"]);
    expect(
      screen.queryByText("Iniciar sesión con Tuya")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Dimensionamiento TI")).not.toBeInTheDocument();
  });

  it("con sesión, la pantalla de login redirige a la ruta de retorno", async () => {
    renderApp(fakeAuth(sessionWith(["chapter-lead"])), [
      "/auth/login?returnTo=%2Fcapacidad",
    ]);
    await waitFor(() =>
      expect(
        screen.getByText("Gestión de Capacidad está pendiente de integrar")
      ).toBeInTheDocument()
    );
  });
});

describe("rutas del host · barra y portal", () => {
  it("la barra acompaña el portal, con campana y cuenta, sin búsqueda ni menú", () => {
    renderApp(fakeAuth(sessionWith(["admin"], "Ana Administradora")), ["/"]);

    expect(screen.getByText("Dimensionamiento TI")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Notificaciones/ })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Buscar/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Abrir menú" })
    ).not.toBeInTheDocument();
    // "Ayuda" es el default del design system: acá no se ofrece.
    expect(screen.queryByText("Ayuda")).not.toBeInTheDocument();
    // La cuenta se reduce al avatar: el disparador se sigue nombrando por la
    // persona, pero su nombre ya no es texto de la barra.
    expect(
      screen.getByRole("button", { name: /Ana Administradora/ })
    ).toBeInTheDocument();
    expect(screen.queryByText("Ana Administradora")).not.toBeInTheDocument();
  });

  it("cerrar sesión desde la cuenta llama a logout", () => {
    const auth = fakeAuth(sessionWith(["admin"]));
    renderApp(auth, ["/"]);
    const account = screen.getByRole("button", { name: /Ana Administradora/ });
    fireEvent.pointerDown(account);
    fireEvent.click(account);
    fireEvent.click(screen.getByText("Cerrar sesión"));
    expect(auth.logout).toHaveBeenCalled();
  });

  it("el portal ofrece sólo los módulos del rol, y entrar navega a su ruta base", async () => {
    renderApp(fakeAuth(sessionWith(["chapter-lead"])), ["/"]);
    expect(screen.getByText("Gestión de Capacidad")).toBeInTheDocument();
    expect(screen.getByText("Iniciativas y Células")).toBeInTheDocument();

    const card = screen
      .getByText("Gestión de Capacidad")
      .closest("div[class*='card'], div") as HTMLElement;
    fireEvent.click(
      within(card.parentElement ?? card).getAllByRole("button", {
        name: "Entrar",
      })[0]
    );
    await waitFor(() =>
      expect(
        screen.getByText("Gestión de Capacidad está pendiente de integrar")
      ).toBeInTheDocument()
    );
  });

  it("la líder técnica entra a Iniciativas y Células, y su ruta le abre el placeholder", async () => {
    renderApp(fakeAuth(sessionWith(["tech-lead"], "Lucía Técnica")), [
      "/iniciativas/celulas/7",
    ]);
    expect(
      await screen.findByText(
        "Iniciativas y Células está pendiente de integrar"
      )
    ).toBeInTheDocument();
  });

  it("la líder técnica ve también Gestión de Capacidad en el portal", () => {
    renderApp(fakeAuth(sessionWith(["tech-lead"], "Lucía Técnica")), ["/"]);
    expect(screen.getByText("Gestión de Capacidad")).toBeInTheDocument();
    expect(screen.getByText("Iniciativas y Células")).toBeInTheDocument();
  });

  it("la líder técnica en Capacidad entra al módulo, no recibe el aviso de permisos", async () => {
    renderApp(fakeAuth(sessionWith(["tech-lead"], "Lucía Técnica")), [
      "/capacidad",
    ]);
    expect(
      await screen.findByText("Gestión de Capacidad está pendiente de integrar")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sin permisos para esta sección")
    ).not.toBeInTheDocument();
  });

  it("sin módulos para el rol, el portal lo dice y la marca no abre selector", () => {
    renderApp(fakeAuth(sessionWith([])), ["/"]);
    expect(
      screen.getByText("No tenés módulos disponibles")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Entrar" })
    ).not.toBeInTheDocument();
  });

  it("el selector de la barra marca el módulo actual", () => {
    renderApp(fakeAuth(sessionWith(["admin"])), ["/capacidad/personas"]);
    const brand = screen.getByRole("button", { name: /Dimensionamiento TI/ });
    fireEvent.pointerDown(brand);
    fireEvent.click(brand);
    expect(screen.getByText("Gestión de Capacidad")).toBeInTheDocument();
    expect(screen.getByText(/actual/i)).toBeInTheDocument();
  });
});

describe("rutas del host · módulos y avisos", () => {
  it("con el rol, la ruta del módulo muestra el marcador bajo la barra", () => {
    renderApp(fakeAuth(sessionWith(["chapter-lead"])), [
      "/capacidad/personas/1",
    ]);
    expect(
      screen.getByText("Gestión de Capacidad está pendiente de integrar")
    ).toBeInTheDocument();
    expect(screen.getByText("Dimensionamiento TI")).toBeInTheDocument();
  });

  it("sin el rol, la ruta del módulo muestra el aviso de permisos, no el login", () => {
    renderApp(fakeAuth(sessionWith([])), ["/capacidad"]);
    expect(
      screen.getByText("Sin permisos para esta sección")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Iniciar sesión con Tuya")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Dimensionamiento TI")).toBeInTheDocument();
  });

  it("una ruta inexistente avisa y ofrece volver al portal", () => {
    renderApp(fakeAuth(sessionWith(["admin"])), ["/lo-que-sea"]);
    expect(screen.getByText("Esta ruta no existe")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Volver al portal" })
    ).toBeInTheDocument();
  });

  it("al montar la barra aplica la ruta de retorno pendiente una sola vez", async () => {
    window.sessionStorage.setItem("host:returnTo", "/capacidad");
    renderApp(fakeAuth(sessionWith(["admin"])), ["/"]);
    await waitFor(() =>
      expect(
        screen.getByText("Gestión de Capacidad está pendiente de integrar")
      ).toBeInTheDocument()
    );
    expect(window.sessionStorage.getItem("host:returnTo")).toBeNull();
  });

  it("las rutas de la app standalone retirada redirigen al módulo", async () => {
    renderApp(fakeAuth(sessionWith(["chapter-lead"])), ["/app/lead/celulas/7"]);
    await waitFor(() =>
      expect(
        screen.getByText("Gestión de Capacidad está pendiente de integrar")
      ).toBeInTheDocument()
    );
  });
});
