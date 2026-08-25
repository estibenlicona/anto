import { describe, it, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { ToastProvider } from "@tuya-ui/components";
import { resetAllocationsMock } from "../../../mocks/handlers/allocations.handlers";
import { resetExpertiseLinesMock } from "../../../mocks/handlers/expertise-lines.handlers";
import { resetPeopleMock } from "../../../mocks/handlers/people.handlers";
import { ExpertiseLinesContainer } from "../ExpertiseLinesContainer";

function renderScreen() {
  return render(
    <ToastProvider>
      <ExpertiseLinesContainer />
    </ToastProvider>
  );
}

/** El panel de detalle, para no buscar en toda la pantalla. */
async function openLine(name: string): Promise<HTMLElement> {
  fireEvent.click(
    await screen.findByRole("button", { name: new RegExp(name) })
  );
  return (await screen.findByRole("heading", { name, level: 2 })).closest(
    "div"
  ) as HTMLElement;
}

describe("ExpertiseLinesContainer", () => {
  beforeEach(() => {
    resetPeopleMock();
    resetAllocationsMock();
    resetExpertiseLinesMock();
  });

  it("separa activas de archivadas y abre la primera", async () => {
    renderScreen();

    expect(await screen.findByText(/Activas · 5/)).toBeInTheDocument();
    expect(screen.getByText(/Archivadas · 1/)).toBeInTheDocument();
    // La primera por orden alfabético entre las activas.
    expect(
      await screen.findByRole("heading", { name: "Backend", level: 2 })
    ).toBeInTheDocument();
  });

  it("marca como incompleta la línea activa sin lead y ofrece designarlo", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);

    await openLine("Frontend");

    expect(
      await screen.findByText(/Esta línea no tiene lead/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Designar lead" })
    ).toBeInTheDocument();
  });

  it("no deja archivar una línea con gente, y sí una vacía", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);

    await openLine("Backend");
    expect(
      await screen.findByRole("button", { name: "Archivar" })
    ).toBeDisabled();

    await openLine("AS-400");
    // Archivada: en vez de archivar, ofrece reactivar.
    expect(
      await screen.findByRole("button", { name: "Reactivar" })
    ).toBeInTheDocument();
  });

  it("avisa de qué línea saldrá quien viene de otra", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    await openLine("QA");

    fireEvent.click(
      await screen.findByRole("button", { name: /Asignar personas/ })
    );

    // María González está en Backend: elegirla avisa antes de confirmar.
    const row = await screen.findByText("María González");
    fireEvent.click(
      within(row.closest("label") as HTMLElement).getByRole("checkbox")
    );

    expect(
      await screen.findByText(/María González saldrá de Backend/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Su célula y su dedicación no cambian/)
    ).toBeInTheDocument();
  });

  it("no deja quitar de la línea a quien la lidera", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    await openLine("QA");

    // Laura aparece dos veces —como lead en el encabezado y en la tabla—, así
    // que se busca en la tabla, que es donde está la acción.
    const table = await screen.findByRole("table");
    const leadRow = within(table)
      .getByText("Laura Ruiz")
      .closest("tr") as HTMLElement;

    expect(within(leadRow).getByText("Lead")).toBeInTheDocument();
    expect(
      within(leadRow).getByRole("button", { name: "Quitar" })
    ).toBeDisabled();
  });

  it("rechaza el código repetido antes de llamar al backend", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);

    fireEvent.click(screen.getByRole("button", { name: /Nueva línea/ }));
    fireEvent.change(await screen.findByLabelText(/Nombre/), {
      target: { value: "Mobile" },
    });
    // Minúsculas: se normaliza antes de comparar, así que igual choca.
    fireEvent.change(screen.getByLabelText(/Código/), {
      target: { value: "be" },
    });

    expect(
      await screen.findByText(/El código “BE” ya lo usa “Backend”/)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear línea" })).toBeDisabled();
  });

  it("muestra a quien está sin línea y lo asigna desde ahí", async () => {
    renderScreen();

    // Las cuatro sembradas sin línea: UX, PO y Scrum Master.
    const toggle = await screen.findByRole("button", {
      name: /4 personas sin línea/,
    });
    fireEvent.click(toggle);

    const row = (await screen.findByText("Valentina Ospina")).closest(
      "div"
    ) as HTMLElement;
    fireEvent.click(
      within(row.parentElement as HTMLElement).getAllByRole("button", {
        name: "Asignar a una línea",
      })[0]
    );

    fireEvent.click(await screen.findByRole("radio", { name: /^Frontend/ }));
    fireEvent.click(screen.getByRole("button", { name: "Asignar" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /3 personas sin línea/ })
      ).toBeInTheDocument()
    );
  });

  it("muestra la capacidad de la línea abierta", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    await openLine("Backend");

    expect(await screen.findByText("FTE disponible")).toBeInTheDocument();
    expect(screen.getByText("FTE asignado")).toBeInTheDocument();
    expect(screen.getByText("FTE libre")).toBeInTheDocument();
    expect(screen.getByText(/% sin asignar/)).toBeInTheDocument();
  });

  it("avisa cuando ninguna línea coincide con la búsqueda", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);

    fireEvent.change(screen.getByLabelText("Buscar líneas"), {
      target: { value: "no existe" },
    });

    expect(
      await screen.findByText(/Ninguna línea coincide/)
    ).toBeInTheDocument();
  });
  it("se presenta con encabezado, como los demás módulos", async () => {
    renderScreen();

    // Antes abría con el botón de alta flotando sobre un vacío: el requisito
    // prohibía repetir el título, y este change lo revierte a propósito.
    expect(
      await screen.findByRole("heading", {
        name: "Líneas de expertise",
        level: 1,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Las disciplinas en las que se agrupa el chapter/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Nueva línea/ })
    ).toBeInTheDocument();
  });

  it("no le da a archivar el mismo tratamiento que a editar", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    await openLine("Backend");

    const editar = await screen.findByRole("button", { name: "Editar" });
    const archivar = screen.getByRole("button", { name: "Archivar" });
    // Se compara el tratamiento y no el nombre de la variante: lo que el
    // requisito exige es que se distingan, y atarlo a "subtle" o "secondary"
    // se rompe cuando el sistema de diseño renombre.
    expect(archivar.className).not.toBe(editar.className);
  });

  it("presenta las cuatro cifras de capacidad como indicadores", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    const detalle = await openLine("Backend");

    // Las cifras siguen diciendo lo mismo; lo que cambia es que cada una vive
    // en su propia card en vez de una rejilla pelada.
    for (const rotulo of [
      "Personas",
      "FTE disponible",
      "FTE asignado",
      "FTE libre",
    ]) {
      const etiqueta = await screen.findByText(rotulo);
      expect(etiqueta.closest("div[class*='rounded']")).not.toBeNull();
    }
    expect(detalle).toBeInTheDocument();
  });

  it("busca personas en el selector sin perder las ya elegidas", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    await openLine("QA");
    fireEvent.click(
      await screen.findByRole("button", { name: /Asignar personas/ })
    );

    const buscador = await screen.findByLabelText("Buscar personas");
    const marcar = (nombre: string) =>
      fireEvent.click(
        within(
          screen.getByText(nombre).closest("label") as HTMLElement
        ).getByRole("checkbox")
      );

    // Marcar a alguien, buscar a otra y marcarla también: las dos tienen que
    // quedar elegidas. Es el defecto clásico de un selector múltiple con
    // filtro —la selección vive en la lista visible y filtrar la vacía—.
    fireEvent.change(buscador, { target: { value: "María" } });
    expect(await screen.findByText("María González")).toBeInTheDocument();
    expect(screen.queryByText("Sofía Herrera")).not.toBeInTheDocument();
    marcar("María González");

    fireEvent.change(buscador, { target: { value: "Sofía" } });
    expect(await screen.findByText("Sofía Herrera")).toBeInTheDocument();
    marcar("Sofía Herrera");

    // El botón cuenta lo elegido: dos, aunque sólo una esté a la vista.
    expect(
      await screen.findByRole("button", { name: "Asignar (2)" })
    ).toBeInTheDocument();
    // Y el aviso de quién sale de otra línea sigue contando a María, que ya
    // no se ve.
    expect(
      screen.getByText(/María González saldrá de Backend/)
    ).toBeInTheDocument();
  });

  it("mantiene separados los dos grupos al filtrar, y avisa si nada coincide", async () => {
    renderScreen();
    await screen.findByText(/Activas · 5/);
    await openLine("QA");
    fireEvent.click(
      await screen.findByRole("button", { name: /Asignar personas/ })
    );

    const buscador = await screen.findByLabelText("Buscar personas");
    // "a" coincide con gente de los dos grupos: traer a alguien de otra línea
    // no es lo mismo que repartir a quien no tiene ninguna, y el filtro no
    // puede mezclarlos.
    fireEvent.change(buscador, { target: { value: "a" } });
    expect(await screen.findByText(/Sin línea ·/)).toBeInTheDocument();
    expect(screen.getByText(/En otra línea ·/)).toBeInTheDocument();

    fireEvent.change(buscador, { target: { value: "zzz" } });
    expect(
      await screen.findByText(/Ninguna persona coincide/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sin línea ·/)).not.toBeInTheDocument();
  });
});
