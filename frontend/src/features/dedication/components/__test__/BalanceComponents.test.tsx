import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type {
  BalanceSignal,
  BalanceSignalDto,
  CapacityDto,
} from "../../services/dedicationService";
import type { SelectedSprintView } from "../../adapters/DedicationAdapter";
import { toEvidenceRow } from "../../adapters/DedicationAdapter";
import { CapacityFteBar } from "../CapacityFteBar";
import { DemandBar } from "../DemandBar";
import { BalanceSignalIcon } from "../BalanceSignalIcon";
import { BalanceSignalBadge } from "../BalanceSignalBadge";
import { EvidenceList } from "../EvidenceList";
import { BalanceSprintCard } from "../BalanceSprintCard";
import { SprintMetricsRow } from "../SprintMetricsRow";
import { DashboardTabs } from "../DashboardTabs";

const capacity = (
  contractualFte: number,
  availableFte: number,
  breakdown: Partial<CapacityDto["breakdown"]> = {}
): CapacityDto => ({
  contractualFte,
  availableFte,
  breakdown: {
    businessDays: 10,
    holidays: 0,
    vacationDays: 0,
    absenceDays: 0,
    otherUnavailableDays: 0,
    ...breakdown,
  },
  // Las mismas cifras en horas, sobre las 80 del Calendario.
  availableHours: Math.round(availableFte * 80),
  deductedHours: Math.round((contractualFte - availableFte) * 80),
});

const balance = (
  signal: BalanceSignal,
  over = 0,
  under = 0,
  extra: Partial<BalanceSignalDto> = {}
): BalanceSignalDto => ({
  signal,
  overCount: over,
  underCount: under,
  squadContext: "NoSquad",
  notEvaluableReason: null,
  evidences: [],
  ...extra,
});

describe("CapacityFteBar", () => {
  it("muestra las cifras y el desglose que produjo el FTE disponible", () => {
    render(
      <CapacityFteBar
        capacity={capacity(1, 0.8, { holidays: 1, absenceDays: 1 })}
        label="Capacidad de María en S18"
      />
    );
    expect(screen.getByText("0.80")).toBeInTheDocument();
    expect(screen.getByText("/ 1.0 FTE")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /10 días laborales · −1 festivo · −1 ausencia/,
      })
    ).toBeInTheDocument();
  });

  it("la misma capacidad en horas, con lo que se fue en ausencias", () => {
    render(
      <CapacityFteBar
        capacity={capacity(1, 0.8, { holidays: 1, absenceDays: 1 })}
        label="Capacidad de María en S18"
      />
    );
    expect(screen.getByText("64 h · −16 h por ausencias")).toBeInTheDocument();
  });

  it("sin descuentos no hay resta de horas que mostrar", () => {
    render(<CapacityFteBar capacity={capacity(1, 1)} label="Capacidad" />);
    expect(screen.getByText("80 h")).toBeInTheDocument();
    expect(screen.queryByText(/por ausencias/)).not.toBeInTheDocument();
  });

  it("a tiempo parcial la pista es el contrato, no la jornada completa", () => {
    render(
      <CapacityFteBar
        capacity={capacity(0.5, 0.5)}
        label="Capacidad de Isabella en S17"
      />
    );
    expect(screen.getByText("/ 0.50 FTE")).toBeInTheDocument();
  });

  it("sin descuentos el desglose son sólo los días laborales", () => {
    const { container } = render(
      <CapacityFteBar capacity={capacity(1, 1)} label="Capacidad" />
    );
    expect(
      screen.getByRole("img", { name: /10 días laborales$/ })
    ).toBeInTheDocument();
    expect(container.querySelectorAll("[data-notch]")).toHaveLength(0);
  });
});

describe("DemandBar", () => {
  it("dibuja la marca propia y la de la célula fuera de la fila", () => {
    const { container } = render(
      <DemandBar
        committedPoints={28}
        ownMedian={22}
        squadMedian={21}
        variant="card"
        label="Demanda de María en S18"
      />
    );
    expect(screen.getByText("28 SP")).toBeInTheDocument();
    expect(screen.getByText("· habitual 22")).toBeInTheDocument();
    expect(container.querySelector("[data-part='own-mark']")).not.toBeNull();
    expect(container.querySelector("[data-part='squad-mark']")).not.toBeNull();
  });

  it("en la fila la marca de célula no se dibuja: a ese ancho se confunden", () => {
    const { container } = render(
      <DemandBar
        committedPoints={28}
        ownMedian={22}
        squadMedian={21}
        label="Demanda"
      />
    );
    expect(container.querySelector("[data-part='own-mark']")).not.toBeNull();
    expect(container.querySelector("[data-part='squad-mark']")).toBeNull();
  });

  it("sin célula no dibuja la marca de célula", () => {
    const { container } = render(
      <DemandBar
        committedPoints={17}
        ownMedian={18}
        variant="card"
        label="Demanda"
      />
    );
    expect(container.querySelector("[data-part='own-mark']")).not.toBeNull();
    expect(container.querySelector("[data-part='squad-mark']")).toBeNull();
  });

  it("la desviación y el relleno llevan el rol de color de la señal", () => {
    const over = render(
      <DemandBar
        committedPoints={30}
        ownMedian={22}
        deviationRate={36.4}
        signal="PossibleOverload"
        tolerance
        label="Demanda"
      />
    );
    expect(screen.getByText("+36 %")).toHaveClass("text-danger-default");
    expect(over.container.querySelector("[data-part='fill']")).toHaveClass(
      "bg-danger-bold"
    );
    expect(screen.getByText("Tolerancia ±25 %")).toBeInTheDocument();
    over.unmount();

    const under = render(
      <DemandBar
        committedPoints={8}
        ownMedian={21}
        deviationRate={-61.9}
        signal="PossibleUnderload"
        label="Demanda"
      />
    );
    expect(screen.getByText("−62 %")).toHaveClass("text-warning-default");
    expect(under.container.querySelector("[data-part='fill']")).toHaveClass(
      "bg-warning-bold"
    );
  });

  it("dentro de la tolerancia lo dice, en vez de repetir el umbral", () => {
    render(
      <DemandBar
        committedPoints={18}
        ownMedian={22}
        deviationRate={-18.2}
        signal="Usual"
        tolerance
        label="Demanda"
      />
    );
    expect(screen.getByText("Dentro de la tolerancia")).toBeInTheDocument();
    expect(screen.queryByText(/Tolerancia ±/)).not.toBeInTheDocument();
  });

  it("con histórico insuficiente muestra sólo la cifra, sin barra", () => {
    const { container } = render(
      <DemandBar committedPoints={14} ownMedian={null} label="Demanda" />
    );
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(container.querySelector("[data-part='fill']")).toBeNull();
  });
});

describe("BalanceSignalIcon", () => {
  const cases: Array<[BalanceSignal, string]> = [
    ["PossibleOverload", "Posible sobreasignación"],
    ["PossibleUnderload", "Posible subasignación"],
    ["Usual", "Carga habitual"],
    ["NotEvaluable", "No evaluable"],
  ];

  it.each(cases)("%s tiene nombre accesible propio", (signal, label) => {
    render(<BalanceSignalIcon balance={balance(signal)} />);
    expect(
      screen.getByRole("img", { name: new RegExp(label) })
    ).toBeInTheDocument();
  });

  it("lleva la señal y cuántas evidencias la sostienen, y no renderiza texto", () => {
    const { container } = render(
      <BalanceSignalIcon balance={balance("PossibleOverload", 4)} />
    );
    expect(
      screen.getByRole("img", {
        name: "Posible sobreasignación · 4 señales concurrentes",
      })
    ).toBeInTheDocument();
    expect(container.textContent).toBe("");
    expect(container.querySelector("a")).toBeNull();
  });

  it("no evaluable dice cuál de los motivos aplica", () => {
    render(
      <BalanceSignalIcon
        balance={balance("NotEvaluable", 0, 0, {
          notEvaluableReason: "InsufficientHistory",
        })}
      />
    );
    expect(
      screen.getByRole("img", {
        name: "No evaluable · Histórico insuficiente",
      })
    ).toBeInTheDocument();
  });
});

describe("BalanceSignalBadge", () => {
  it("lleva el nombre de la señal y su frase", () => {
    render(<BalanceSignalBadge balance={balance("PossibleOverload", 2)} />);
    expect(screen.getByText("Posible sobreasignación")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Varias señales apuntan consistentemente a una carga superior a la habitual."
      )
    ).toBeInTheDocument();
  });

  it("anota que la célula se comporta igual, sin cambiar la señal", () => {
    render(
      <BalanceSignalBadge
        balance={balance("PossibleUnderload", 0, 3, {
          squadContext: "SameDirection",
        })}
      />
    );
    expect(screen.getByText("Posible subasignación")).toBeInTheDocument();
    expect(screen.getByText("La célula se comporta igual")).toBeInTheDocument();
  });

  it("sin ese contexto no hay anotación que leer", () => {
    render(
      <BalanceSignalBadge
        balance={balance("PossibleUnderload", 0, 3, {
          squadContext: "Different",
        })}
      />
    );
    expect(
      screen.queryByText("La célula se comporta igual")
    ).not.toBeInTheDocument();
  });

  it("no evaluable muestra el motivo junto a la marca", () => {
    render(
      <BalanceSignalBadge
        balance={balance("NotEvaluable", 0, 0, {
          notEvaluableReason: "NoIdentity",
        })}
      />
    );
    expect(screen.getByText("No evaluable")).toBeInTheDocument();
    expect(screen.getByText("Sin identidad DevOps")).toBeInTheDocument();
  });
});

describe("EvidenceList", () => {
  const evidences = [
    toEvidenceRow({
      id: "demandVsOwnHistory",
      direction: "Over",
      value: 36.4,
      threshold: 25,
      strong: false,
    }),
    toEvidenceRow({
      id: "completion",
      direction: "Unknown",
      value: null,
      threshold: null,
      strong: false,
    }),
    toEvidenceRow({
      id: "multitasking",
      direction: "Neutral",
      value: 2,
      threshold: 3,
      strong: false,
    }),
  ];

  it("lista las que cuentan, las neutras y las que no se pudieron evaluar", () => {
    render(<EvidenceList evidences={evidences} />);
    expect(
      screen.getByText("Demanda frente a su histórico")
    ).toBeInTheDocument();
    expect(screen.getByText("36.4 %")).toBeInTheDocument();
    expect(screen.getByText(/Fuera de tolerancia/)).toBeInTheDocument();
    expect(screen.getByText(/No se pudo evaluar/)).toBeInTheDocument();
    expect(screen.getByText(/Dentro de la tolerancia/)).toBeInTheDocument();
    expect(screen.getByText("2 iniciativas")).toBeInTheDocument();
  });

  it("la tabla encabeza con la regla y con sus tres columnas", () => {
    render(<EvidenceList evidences={evidences} />);
    expect(
      screen.getByText(/Cada señal tiene una tolerancia/)
    ).toBeInTheDocument();
    expect(screen.getByText("SEÑAL")).toBeInTheDocument();
    expect(screen.getByText("VALOR")).toBeInTheDocument();
    expect(screen.getByText("TOLERANCIA")).toBeInTheDocument();
    // La cifra de la que cuenta se destaca; la de la neutra no.
    expect(screen.getByText("36.4 %")).toHaveClass("text-danger-default");
  });
});

describe("BalanceSprintCard", () => {
  const sprint = (over: Partial<SelectedSprintView> = {}) =>
    ({
      snapshotLabel: "Provisional",
      snapshotNote: "El sprint sigue en curso: estas cifras pueden cambiar.",
      reference: { sufficient: true },
      balance: balance("PossibleOverload", 3),
      signalEvidence: "3 señales",
      ...over,
    }) as SelectedSprintView;

  it("la señal manda: su nombre en titular, su frase y cuántas la sostienen", () => {
    render(<BalanceSprintCard sprint={sprint()} minHistorySprints={3} />);
    expect(screen.getByText("Posible sobreasignación")).toBeInTheDocument();
    expect(screen.getByText("3 señales")).toBeInTheDocument();
    expect(
      screen.getByText(/carga superior a la habitual/)
    ).toBeInTheDocument();
    expect(screen.getByText(/sigue en curso/)).toBeInTheDocument();
  });

  it("sólo las señales que piden una decisión pintan el borde", () => {
    const { container, rerender } = render(
      <BalanceSprintCard sprint={sprint()} minHistorySprints={3} />
    );
    const card = () => container.querySelector('[class*="rounded-surface"]')!;
    expect(card().className).toContain("border-danger-default");
    rerender(
      <BalanceSprintCard
        sprint={sprint({
          balance: balance("Usual"),
          signalEvidence: "Sin señales",
        })}
        minHistorySprints={3}
      />
    );
    expect(screen.getByText("Carga habitual")).toBeInTheDocument();
    expect(card().className).not.toContain("border-danger-default");
    expect(card().className).not.toContain("border-warning-default");
  });

  it("sin histórico dice su motivo y cuántos sprints faltan", () => {
    render(
      <BalanceSprintCard
        sprint={sprint({
          balance: balance("NotEvaluable", 0, 0, {
            notEvaluableReason: "InsufficientHistory",
          }),
          signalEvidence: "Sin señales",
          reference: { sufficient: false } as SelectedSprintView["reference"],
        })}
        minHistorySprints={3}
      />
    );
    expect(screen.getByText("No evaluable")).toBeInTheDocument();
    expect(screen.getByText("Histórico insuficiente")).toBeInTheDocument();
    expect(screen.getByText(/Hacen falta 3/)).toBeInTheDocument();
  });
});

describe("SprintMetricsRow", () => {
  const metrics = [
    {
      label: "Cumplimiento",
      value: "40 %",
      detail: "12 de 30 SP en Closed",
      outOfTolerance: false,
    },
    {
      label: "Trabajo no planificado",
      value: "36.4 %",
      detail: "+8 SP sobre 22",
      outOfTolerance: true,
    },
    {
      label: "Carry-over",
      value: "0 %",
      detail: "0 SP",
      outOfTolerance: false,
    },
    {
      label: "Foco",
      value: "2",
      detail: "iniciativas · 4 HUs abiertas a la vez",
      outOfTolerance: false,
    },
  ];

  it("las cuatro cifras con su lectura, y la cuarta rotulada Foco", () => {
    render(<SprintMetricsRow metrics={metrics} />);
    expect(screen.getByText("CUMPLIMIENTO")).toBeInTheDocument();
    expect(screen.getByText("FOCO")).toBeInTheDocument();
    expect(screen.queryByText("MULTITAREA")).not.toBeInTheDocument();
    expect(screen.getByText("12 de 30 SP en Closed")).toBeInTheDocument();
    expect(
      screen.getByText("iniciativas · 4 HUs abiertas a la vez")
    ).toBeInTheDocument();
  });

  it("sólo la que se pasó de su tolerancia se pinta", () => {
    render(<SprintMetricsRow metrics={metrics} />);
    expect(screen.getByText("36.4 %")).toHaveClass("text-danger-default");
    expect(screen.getByText("40 %")).toHaveClass("text-neutral-default");
  });
});

describe("DashboardTabs", () => {
  const tabs = [
    {
      id: "signals" as const,
      label: "Señales",
      subtitle: "3 de 6 hacia sobrecarga",
    },
    {
      id: "stories" as const,
      label: "Historias",
      subtitle: "6 historias · 30 SP",
    },
    {
      id: "activity" as const,
      label: "Actividad",
      subtitle: "5 días activos · 24 commits",
    },
    {
      id: "trend" as const,
      label: "Tendencia",
      subtitle: "7 sprints · +0.4 %",
    },
  ];

  it("cada pestaña dice qué hay dentro sin abrirla", () => {
    render(
      <DashboardTabs tabs={tabs} value="signals" onValueChange={() => {}}>
        {{ signals: <p>evidencias</p> }}
      </DashboardTabs>
    );
    expect(screen.getAllByRole("tab")).toHaveLength(4);
    for (const tab of tabs) {
      expect(screen.getByText(tab.label)).toBeInTheDocument();
      expect(screen.getByText(tab.subtitle)).toBeInTheDocument();
    }
    expect(screen.getByText("evidencias")).toBeInTheDocument();
  });

  it("elegir otra pestaña publica su id", () => {
    const picked: string[] = [];
    render(
      <DashboardTabs
        tabs={tabs}
        value="signals"
        onValueChange={(id) => picked.push(id)}
      >
        {{}}
      </DashboardTabs>
    );
    // tuip responde a mouseDown, no a click.
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Historias/ }));
    expect(picked).toEqual(["stories"]);
  });
});
