import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AbsencesStatsCards } from "../AbsencesStatsCards";
import type { AbsencesMonth } from "../../adapters/AbsenceAdapter";

const month: AbsencesMonth = {
  monthKey: "2031-04",
  monthTitle: "abril 2031",
  monthBusinessDays: 22,
  items: [],
  totalCount: 3,
  totalBusinessDaysInMonth: 9,
  approvedFteImpact: 0.5,
  mostAffectedSquadName: "Backend Platform",
  pendingCount: 2,
};

describe("AbsencesStatsCards", () => {
  it("lee el descuento contra el FTE del chapter, al pie de la cifra", () => {
    render(<AbsencesStatsCards month={month} chapterFte={17.8} />);
    // Misma anatomía que las otras dos cards: arriba la cifra sola, abajo la
    // unidad y su referencia.
    const referencia = screen.getByText("de 17.8 FTE del chapter");
    expect(referencia).toBeInTheDocument();
    expect(screen.getByText(/−0.50/)).not.toBe(referencia);
    expect(screen.getByText(/−0.50/).textContent!.trim()).toBe("−0.50");
  });

  it("el pie no vuelve a hablar de la célula más afectada", () => {
    render(<AbsencesStatsCards month={month} chapterFte={17.8} />);
    expect(
      screen.queryByText(/Sólo cuentan las ausencias aprobadas/)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/La célula que más pierde es/)
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Backend Platform")).not.toBeInTheDocument();
  });

  it("sin total del chapter muestra el descuento solo, sin fracción sobre cero", () => {
    render(<AbsencesStatsCards month={month} chapterFte={null} />);
    expect(screen.queryByText(/del chapter/)).not.toBeInTheDocument();
    expect(screen.getByText("FTE")).toBeInTheDocument();
    expect(screen.getByText(/−0.50/)).toBeInTheDocument();
  });

  it("con el total en cero tampoco divide", () => {
    render(<AbsencesStatsCards month={month} chapterFte={0} />);
    expect(screen.queryByText(/del chapter/)).not.toBeInTheDocument();
    expect(screen.getByText("FTE")).toBeInTheDocument();
  });

  it("sin nada aprobado muestra el cero, sin frase sobre lo aprobado", () => {
    render(
      <AbsencesStatsCards
        month={{ ...month, approvedFteImpact: 0, mostAffectedSquadName: null }}
        chapterFte={17.8}
      />
    );
    expect(screen.getByText(/0.00/)).toBeInTheDocument();
    expect(screen.getByText("de 17.8 FTE del chapter")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Ninguna ausencia aprobada este mes descuenta capacidad."
      )
    ).not.toBeInTheDocument();
  });

  it("un descuento pequeño no se redondea hasta parecer cero", () => {
    // Con un decimal, 0.04 se mostraba como "−0.0": la tarjeta decía que no
    // había impacto cuando sí lo había, y contradecía a la fila.
    render(
      <AbsencesStatsCards
        month={{ ...month, approvedFteImpact: 0.04 }}
        chapterFte={17.8}
      />
    );
    expect(screen.getByText(/−0.04/)).toBeInTheDocument();
  });
});
