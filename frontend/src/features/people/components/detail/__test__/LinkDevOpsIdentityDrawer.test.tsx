import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../../../../mocks/server";
import { DEVOPS_USERS } from "../../../../../mocks/handlers/personDetail.seeds";
import { LinkDevOpsIdentityDrawer } from "../LinkDevOpsIdentityDrawer";

const CAMILA_EMAIL = "camila.restrepo@tuya.com";
const camilaUser = DEVOPS_USERS.find((u) => u.email === CAMILA_EMAIL)!;

function renderDrawer(
  overrides: Partial<React.ComponentProps<typeof LinkDevOpsIdentityDrawer>> = {}
) {
  const onConfirm = vi.fn();
  render(
    <LinkDevOpsIdentityDrawer
      open
      onOpenChange={() => {}}
      personName="Camila Restrepo"
      personEmail={CAMILA_EMAIL}
      linking={false}
      serverError={null}
      onConfirm={onConfirm}
      {...overrides}
    />
  );
  return { onConfirm };
}

const emailField = () =>
  screen.getByLabelText(/Correo corporativo/) as HTMLInputElement;
const search = () =>
  fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
const linkButton = () => screen.getByRole("button", { name: "Vincular" });

describe("LinkDevOpsIdentityDrawer", () => {
  it("abre con el nombre como antetítulo, el correo prellenado y Vincular deshabilitado", () => {
    renderDrawer();
    expect(screen.getByText("Camila Restrepo")).toBeInTheDocument();
    expect(screen.getByText("Vincular con Azure DevOps")).toBeInTheDocument();
    expect(emailField()).toHaveValue(CAMILA_EMAIL);
    expect(linkButton()).toBeDisabled();
    expect(screen.queryByText("Coincide")).not.toBeInTheDocument();
  });

  it("buscar muestra al usuario —identificador, proyectos, equipos, tableros— y Vincular confirma con su id", async () => {
    const { onConfirm } = renderDrawer();
    search();
    expect(await screen.findByText("Coincide")).toBeInTheDocument();
    expect(screen.getByText(camilaUser.id)).toBeInTheDocument();
    expect(screen.getByText("Core Bancario")).toBeInTheDocument();
    expect(screen.getByText("Pagos Instantáneos")).toBeInTheDocument();
    expect(screen.getByText("Pagos · Stories")).toBeInTheDocument();
    expect(linkButton()).toBeEnabled();
    fireEvent.click(linkButton());
    expect(onConfirm).toHaveBeenCalledWith(camilaUser.id);
  });

  it("Enter en el campo busca", async () => {
    renderDrawer();
    fireEvent.submit(emailField().closest("form")!);
    expect(await screen.findByText("Coincide")).toBeInTheDocument();
  });

  it("sin coincidencia avisa con el correo buscado y no deja vincular", async () => {
    renderDrawer();
    fireEvent.change(emailField(), { target: { value: "nadie@tuya.com" } });
    search();
    expect(
      await screen.findByText("Sin coincidencia en Azure DevOps")
    ).toBeInTheDocument();
    expect(screen.getByText("nadie@tuya.com")).toBeInTheDocument();
    expect(linkButton()).toBeDisabled();
  });

  it("un texto sin forma de correo marca el campo y no consulta", () => {
    renderDrawer();
    fireEvent.change(emailField(), { target: { value: "camila" } });
    search();
    expect(
      screen.getByText("Escribe un correo con forma de correo")
    ).toBeInTheDocument();
    expect(screen.queryByText("Buscando…")).not.toBeInTheDocument();
    expect(linkButton()).toBeDisabled();
  });

  it("editar el correo después de encontrar descarta el resultado", async () => {
    renderDrawer();
    search();
    expect(await screen.findByText("Coincide")).toBeInTheDocument();
    fireEvent.change(emailField(), {
      target: { value: "camila.restrepo@tuya.com.co" },
    });
    expect(screen.queryByText("Coincide")).not.toBeInTheDocument();
    expect(linkButton()).toBeDisabled();
  });

  it("si DevOps falla, muestra el error con reintento y no deja vincular", async () => {
    server.use(
      http.get("/devops/users", () =>
        HttpResponse.json({ message: "DevOps no responde" }, { status: 500 })
      )
    );
    renderDrawer();
    search();
    expect(
      await screen.findByText("No se pudo consultar Azure DevOps")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reintentar" })
    ).toBeInTheDocument();
    expect(linkButton()).toBeDisabled();
  });

  it("el error del servidor al vincular se ve y el drawer sigue abierto", () => {
    renderDrawer({
      serverError: "Esa identidad ya está vinculada a María González",
    });
    expect(
      screen.getByText("Esa identidad ya está vinculada a María González")
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
