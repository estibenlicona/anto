import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { personService } from "../services/personService";
import { PeopleContainer } from "../PeopleContainer";

/**
 * Cubre solo el listado (carga real vía el servidor de mocks). Los flujos
 * de alta/edición/borrado requieren abrir `PersonFormDrawer`/
 * `DeletePersonConfirmDialog` (`Drawer`/`Modal` de @tuya-ui/components,
 * ambos sobre `@radix-ui/react-dialog`) — no se pueden montar en jsdom en
 * este repo, ver la nota en
 * `components/__test__/SquadFormModal.validate.test.ts` (mismo motivo acá).
 * Esos flujos se verifican manualmente en el navegador (tasks.md, 7.3); acá
 * sólo se prueba la lógica de validación (`personFormValidation.test.ts`) y
 * los hooks/servicio que los alimentan (ya cubiertos aparte).
 */
// MemoryRouter porque el listado enlaza el nombre de cada persona a su
// pantalla de detalle, y un `Link` fuera de un router lanza al renderizar.
function renderContainer() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <PeopleContainer />
      </ToastProvider>
    </MemoryRouter>
  );
}

describe("PeopleContainer", () => {
  afterEach(() => {
    resetPeopleMock();
  });

  it("lists the people loaded from the mock", async () => {
    renderContainer();
    expect(await screen.findByText("María González")).toBeInTheDocument();
    expect(screen.getByText("Laura Ruiz")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });

  it("renders the create action without opening the modal", async () => {
    renderContainer();
    await screen.findByText("María González");
    expect(
      screen.getByRole("button", { name: "Nueva persona" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the module header and the stats cards from the mock", async () => {
    renderContainer();
    await screen.findByText("María González");

    expect(
      screen.getByRole("heading", { name: "Personas" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Perfiles y seniority del equipo")
    ).toBeInTheDocument();

    expect(screen.getByText("PERSONAS ACTIVAS")).toBeInTheDocument();
    expect(screen.getByText("STACKS SIN RESPALDO")).toBeInTheDocument();
    // La cobertura sale del mock: se comprueba que la tarjeta lea los stacks
    // registrados, no cuántos — fijar el valor ataba el test a los datos de
    // ejemplo. Y "N en M células" llega del overview de capacidad.
    const stats = await personService.getStats();
    expect(
      await screen.findByText(
        new RegExp(`de ${stats.stackCoverage.distinct} registrados`)
      )
    ).toBeInTheDocument();
    expect(await screen.findByText(/\d+ en \d+ células/)).toBeInTheDocument();
  });

  it("gives a person the same avatar color in the list and in the summary", async () => {
    renderContainer();
    await screen.findByText("María González");

    // El resumen muestra una muestra ordenada por nombre, así que no cualquier
    // persona aparece en los dos lugares: se elige una que sí, preguntándole
    // al mock en vez de suponerla.
    const stats = await personService.getStats();
    const inBoth = stats.sample[0];
    expect(inBoth).toBeDefined();

    // Los dos avatares de la misma persona: uno en la fila, otro en el
    // AvatarGroup del resumen. Si alguno derivara su color de otra cosa —el
    // nombre, el índice de fila— las clases dejarían de coincidir.
    const avatars = await screen.findAllByLabelText(inBoth.name);
    expect(avatars.length).toBeGreaterThanOrEqual(2);

    const identityClassOf = (el: HTMLElement) =>
      Array.from(el.classList)
        .filter((c) => c.startsWith("bg-identity-"))
        .sort()
        .join(" ");

    const first = identityClassOf(avatars[0]);
    expect(first).not.toBe("");
    for (const avatar of avatars) {
      expect(identityClassOf(avatar)).toBe(first);
    }
  });
  it("filtrar por stack reduce el total y muestra la card de cobertura", async () => {
    renderContainer();
    await screen.findByText("María González");
    expect(screen.getByText("STACKS SIN RESPALDO")).toBeInTheDocument();
    const totalBefore = (await personService.list(1, 1)).totalCount;
    fireEvent.click(await screen.findByRole("button", { name: /Stack/ }));
    fireEvent.click(await screen.findByRole("checkbox", { name: "AS400" }));
    await waitFor(() =>
      expect(screen.queryByText("Laura Ruiz")).not.toBeInTheDocument()
    );
    expect(screen.getByText("María González")).toBeInTheDocument();
    expect(
      (await personService.list(1, 1, undefined, undefined, ["AS400"]))
        .totalCount
    ).toBeLessThan(totalBefore);
  });
});
