import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ToastProvider } from "@tuya-ui/components";
import { resetSquadsMock } from "../../../mocks/handlers/squads.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { allocationService } from "../services/allocationService";
import { capacityOverviewService } from "@features/control-tower/services/capacityOverviewService";
import * as drawerModule from "../components/AllocationFormDrawer";
import {
  AllocationsContainer,
  type AllocationsContainerProps,
} from "../AllocationsContainer";

const BACKEND = "11111111-1111-1111-1111-111111111111";
const PAGOS = "44444444-4444-4444-4444-444444444444";

/**
 * El contenedor ya no elige la célula: la recibe por prop desde el detalle.
 * Los flujos de alta/edición/quitar requieren abrir `AllocationFormDrawer` /
 * `RemoveAllocationConfirmDialog` (`Modal` de @tuya-ui/components, sobre
 * `@radix-ui/react-dialog`) — ver la nota en
 * `squads/components/__test__/SquadFormModal.validate.test.ts` sobre por qué
 * eso no se puede montar en jsdom en este repo; por eso `onChanged` tras una
 * mutación se verifica manualmente en el navegador (tasks.md, 7.2). Acá se
 * cubre la carga para la célula dada y la apertura del alta por
 * `createRequestKey`.
 */
function renderContainer(props: Partial<AllocationsContainerProps> = {}) {
  return render(
    <ToastProvider>
      <AllocationsContainer
        squadId={BACKEND}
        squadName="Backend Platform"
        {...props}
      />
    </ToastProvider>
  );
}

describe("AllocationsContainer", () => {
  afterEach(() => {
    resetSquadsMock();
    resetPeopleMock();
    resetAllocationsMock();
    vi.restoreAllMocks();
  });

  it("loads the team of the given squad without a squad selector", async () => {
    renderContainer();
    expect(await screen.findByText("María González")).toBeInTheDocument();
    expect(screen.queryByText("Seleccionar célula…")).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "Selecciona una célula para ver y administrar su equipo."
      )
    ).not.toBeInTheDocument();
  });

  it("shows the empty state for a squad without team", async () => {
    renderContainer({ squadId: PAGOS });
    expect(
      await screen.findByText("Todavía no hay personas asignadas")
    ).toBeInTheDocument();
  });

  it("requests the allocations of that squad only", async () => {
    const spy = vi.spyOn(allocationService, "listBySquad");
    renderContainer();
    await screen.findByText("María González");
    expect(spy).toHaveBeenCalledWith(BACKEND, 1, 10, undefined, []);
  });

  it("does not open the create form on mount, only when createRequestKey increments", async () => {
    const { rerender } = renderContainer({ createRequestKey: 0 });
    await screen.findByText("María González");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <ToastProvider>
        <AllocationsContainer
          squadId={BACKEND}
          squadName="Backend Platform"
          createRequestKey={1}
        />
      </ToastProvider>
    );
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Asignar persona" })
    ).toBeInTheDocument();
  });
});

describe("AllocationsContainer · selector de persona", () => {
  afterEach(() => {
    resetSquadsMock();
    resetPeopleMock();
    resetAllocationsMock();
    vi.restoreAllMocks();
  });

  it("ofrece en el alta sólo personas sin célula", async () => {
    const spy = vi.spyOn(drawerModule, "AllocationFormDrawer");
    renderContainer({ createRequestKey: 1 });
    await screen.findByText("María González");
    const overview = await capacityOverviewService.getOverview();
    const unassigned = overview.people.filter((p) => p.allocation === null);
    expect(unassigned.length).toBeGreaterThan(0);
    await waitFor(() => {
      const last = spy.mock.calls[spy.mock.calls.length - 1][0];
      expect(last.people.map((p) => p.id).sort()).toEqual(
        unassigned.map((p) => p.id).sort()
      );
    });
    // María ya tiene célula: no se puede volver a asignar.
    const last = spy.mock.calls[spy.mock.calls.length - 1][0];
    expect(last.people.some((p) => p.name === "María González")).toBe(false);
  });
});
