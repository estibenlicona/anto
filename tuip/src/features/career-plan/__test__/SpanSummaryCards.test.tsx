import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { SpanSummaryCards } from "../components/SpanSummaryCards";
import { SpanFocusSkills } from "../components/SpanFocusSkills";
import { SpanPendingWork } from "../components/SpanPendingWork";
import type { SpanSummaryDto } from "../services/careerPlanService";

const resumen: SpanSummaryDto = {
  totalGaps: 12,
  criticalGaps: 4,
  evaluatedPeople: 3,
  totalPeople: 6,
  peopleAtRisk: [
    { personId: "p1", personName: "Paula Ramírez", gapCount: 5 },
    { personId: "p2", personName: "Carlos López", gapCount: 4 },
    { personId: "p3", personName: "María González", gapCount: 3 },
    { personId: "p4", personName: "Laura Vélez", gapCount: 3 },
  ],
  previousCycle: { cycle: "2026-S1", totalGaps: 18 },
  trend: [
    { cycle: "2025-S2", totalGaps: 20 },
    { cycle: "2026-S1", totalGaps: 18 },
    { cycle: "2026-S2", totalGaps: 12 },
  ],
  topSkills: [],
  pending: {
    unassessed: 3,
    overduePlans: 1,
    positionsWithoutLevel: 2,
    gapsWithoutPlan: 7,
  },
};

const render4 = (overrides: Partial<SpanSummaryDto> = {}) =>
  render(
    <SpanSummaryCards
      summary={{ ...resumen, ...overrides }}
      loading={false}
      onSeePeople={() => {}}
    />
  );

/** El cuerpo de la card que lleva ese rótulo: dos cards pueden mostrar la misma cifra. */
const card = (rotulo: string): HTMLElement =>
  screen.getByText(rotulo).closest("div") as HTMLElement;

describe("SpanSummaryCards", () => {
  it("muestra las brechas críticas dentro del total abierto", () => {
    render4();
    const criticas = card("BRECHAS CRÍTICAS");
    expect(within(criticas).getByText("4")).toBeInTheDocument();
    expect(
      within(criticas).getByText(/de 12 brechas abiertas/)
    ).toBeInTheDocument();
  });

  it("muestra la cobertura con las dos cifras que la forman", () => {
    render4();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText(/3 de 6 personas/)).toBeInTheDocument();
  });

  it("una baja de brechas se lee como mejora, con su signo", () => {
    render4();
    // 12 hoy contra 18 antes: seis menos.
    const delta = screen.getByText("−6");
    expect(delta).toBeInTheDocument();
    expect(delta.className).toContain("success");
    expect(screen.getByText(/6 brechas menos que/)).toBeInTheDocument();
  });

  it("una subida se marca distinto, y el signo lo dice", () => {
    render4({ previousCycle: { cycle: "2026-S1", totalGaps: 9 } });
    const delta = screen.getByText("+3");
    expect(delta.className).toContain("danger");
    expect(screen.getByText(/3 brechas más que/)).toBeInTheDocument();
  });

  it("sin ciclo anterior lo dice en palabras, no con un cero", () => {
    render4({
      previousCycle: null,
      trend: [{ cycle: "2026-S2", totalGaps: 12 }],
    });

    expect(screen.getByText("Sin ciclo anterior")).toBeInTheDocument();
    // Un "0" se leería como "no cambió nada", que es otra cosa.
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(screen.queryByText("−0")).not.toBeInTheDocument();
  });

  it("dibuja la serie de ciclos como una sola imagen con su nombre", () => {
    render4();
    expect(
      screen.getByRole("img", { name: "Brechas por ciclo" })
    ).toBeInTheDocument();
  });

  it("muestra a las personas en riesgo con avatares y el excedente", () => {
    render4();
    const riesgo = card("PERSONAS EN RIESGO");
    // Cuatro personas, tres avatares y el excedente resumido.
    expect(within(riesgo).getByText("4")).toBeInTheDocument();
    expect(within(riesgo).getByText("PR")).toBeInTheDocument();
    expect(within(riesgo).getByText("+1")).toBeInTheDocument();
  });

  it("sin nadie en riesgo la card se queda, diciendo cero", () => {
    render4({ peopleAtRisk: [] });
    expect(screen.getByText("PERSONAS EN RIESGO")).toBeInTheDocument();
    expect(
      screen.getByText("Nadie acumula tres brechas o más")
    ).toBeInTheDocument();
  });

  it("ofrece el camino a ver a todas las personas en riesgo", () => {
    const onSeePeople = vi.fn();
    render(
      <SpanSummaryCards
        summary={resumen}
        loading={false}
        onSeePeople={onSeePeople}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "ver todas" }));
    expect(onSeePeople).toHaveBeenCalled();
  });

  it("mientras carga no dibuja nada, en vez de cifras en cero", () => {
    const { container } = render(
      <SpanSummaryCards summary={null} loading onSeePeople={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("SpanFocusSkills", () => {
  const habilidades = [
    {
      skillId: "s1",
      skillName: "Arquitectura",
      weight: 7,
      peopleWithGap: 3,
      expectedLevel: 3 as const,
    },
    {
      skillId: "s2",
      skillName: "Calidad",
      weight: 3,
      peopleWithGap: 3,
      expectedLevel: 4 as const,
    },
  ];

  it("presenta las habilidades como lectura del chapter, no de una persona", () => {
    render(<SpanFocusSkills skills={habilidades} />);

    expect(
      screen.getByText("Dónde se concentra la brecha")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Agregado del chapter, no de una persona")
    ).toBeInTheDocument();
    expect(screen.getByText("Arquitectura")).toBeInTheDocument();
    expect(screen.getByText(/3 personas · pide Avanzado/)).toBeInTheDocument();
  });

  it("la barra mide el peso contra la habilidad que más pesa", () => {
    render(<SpanFocusSkills skills={habilidades} />);
    const barras = screen.getAllByRole("progressbar");

    // 7 es el mayor y llena la barra; 3 es su proporción, no la mitad por
    // tener las mismas personas con brecha.
    expect(barras[0]).toHaveAttribute("aria-valuenow", "100");
    expect(barras[1]).toHaveAttribute("aria-valuenow", "43");
  });

  it("sin brechas no se muestra, en vez de aparecer vacío", () => {
    const { container } = render(<SpanFocusSkills skills={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("SpanPendingWork", () => {
  const pending = {
    unassessed: 3,
    overduePlans: 0,
    positionsWithoutLevel: 2,
    gapsWithoutPlan: 7,
  };

  const renderPendientes = (onOpenAssessments = () => {}) =>
    render(
      <SpanPendingWork
        pending={pending}
        onOpenAssessments={onOpenAssessments}
        onOpenPeople={() => {}}
        onOpenCatalog={() => {}}
      />
    );

  /** La cifra que acompaña a ese rótulo, dentro de su misma fila. */
  const cifraDe = (rotulo: string): string =>
    within(screen.getByText(rotulo).closest("button") as HTMLElement).getByText(
      /^\d+$/
    ).textContent ?? "";

  it("muestra las cuatro filas, cada una con su propia cifra", () => {
    renderPendientes();
    expect(screen.getAllByRole("button")).toHaveLength(4);

    // Emparejadas y no contadas por separado: buscar los rótulos por un lado y
    // los números por otro no detecta que dos filas se crucen las cifras.
    expect(cifraDe("Personas sin evaluar")).toBe("3");
    expect(cifraDe("Brechas sin plan")).toBe("7");
    expect(cifraDe("Planes vencidos")).toBe("0");
    expect(cifraDe("Cargos sin nivel declarado")).toBe("2");
  });

  it("un pendiente en cero se queda en la lista", () => {
    renderPendientes();
    const vencidos = screen
      .getByText("Planes vencidos")
      .closest("button") as HTMLElement;

    // Desaparecer haría que "no hay ninguno" se confunda con "nadie lo miró".
    expect(within(vencidos).getByText("0")).toBeInTheDocument();
  });

  it("cada pendiente lleva a dónde atenderlo, y no todos al mismo lado", () => {
    const onOpenAssessments = vi.fn();
    const onOpenPeople = vi.fn();
    const onOpenCatalog = vi.fn();
    render(
      <SpanPendingWork
        pending={pending}
        onOpenAssessments={onOpenAssessments}
        onOpenPeople={onOpenPeople}
        onOpenCatalog={onOpenCatalog}
      />
    );

    // Los cuatro caminos, no uno: cableadas todas al mismo destino, una sola
    // comprobación pasaría igual.
    fireEvent.click(screen.getByText("Personas sin evaluar"));
    expect(onOpenAssessments).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Brechas sin plan"));
    fireEvent.click(screen.getByText("Planes vencidos"));
    expect(onOpenPeople).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByText("Cargos sin nivel declarado"));
    expect(onOpenCatalog).toHaveBeenCalledTimes(1);
    // El catálogo no es Personas: si se cruzaran, esto lo dice.
    expect(onOpenAssessments).toHaveBeenCalledTimes(1);
  });
});
