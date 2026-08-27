import { describe, it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@tuya-ui/components";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { personService } from "../services/personService";
import {
  LeadBreadcrumbProvider,
  useLeadBreadcrumb,
} from "@features/chapter-lead-shell/LeadBreadcrumbContext";
import { PeopleContainer } from "../PeopleContainer";

// Hace las veces de la franja del breadcrumb del shell: pinta lo que el
// contenedor publica ahí (el botón "Nueva persona").
function BreadcrumbActionsProbe() {
  const { actions } = useLeadBreadcrumb();
  return <div data-testid="breadcrumb-actions">{actions}</div>;
}

/**
 * Cubre la acción publicada en la franja del breadcrumb, el resumen y el
 * listado (carga real vía el servidor de mocks). Los flujos
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
    <ToastProvider>
      <LeadBreadcrumbProvider>
        <MemoryRouter>
          <BreadcrumbActionsProbe />
          <PeopleContainer />
        </MemoryRouter>
      </LeadBreadcrumbProvider>
    </ToastProvider>
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

  it("publishes the create action in the breadcrumb strip without opening the modal", async () => {
    renderContainer();
    await screen.findByText("María González");
    const strip = screen.getByTestId("breadcrumb-actions");
    expect(
      within(strip).getByRole("button", { name: "Nueva persona" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the stats cards from the mock, with no visible module header", async () => {
    renderContainer();
    await screen.findByText("María González");

    // El nombre de la pantalla lo da el breadcrumb del shell: la vista no
    // repite el título ni la descripción del módulo.
    expect(
      screen.queryByRole("heading", { name: "Personas" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Perfiles y seniority del equipo")
    ).not.toBeInTheDocument();

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

  it("apila resumen y listado con una sola medida de separación", async () => {
    renderContainer();
    await screen.findByText("PERSONAS ACTIVAS");
    // El raíz de la vista es el padre del grid de cards: resumen y listado
    // se apilan con gap-3, la misma medida que células y ausencias; antes
    // era gap-2 y las cards iban a gap-4.
    const root = screen
      .getByText("PERSONAS ACTIVAS")
      .closest(".grid")!.parentElement!;
    expect(root).toHaveClass("gap-3");
    expect(root).not.toHaveClass("gap-2");
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
