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
  it("lee el descuento contra el FTE del chapter, no como cifra suelta", () => {
    render(<AbsencesStatsCards month={month} chapterFte={17.8} />);
    expect(screen.getByText("de 17.8 FTE del chapter")).toBeInTheDocument();
    expect(screen.getByText(/−0.50/)).toBeInTheDocument();
  });

  it("el pie se explica solo, sin continuar la cifra de arriba", () => {
    render(<AbsencesStatsCards month={month} chapterFte={17.8} />);
    // El texto anterior — "de lo aprobado · la más afectada: …" — empezaba a
    // mitad de frase y sólo se entendía leyendo el número primero.
    expect(
      screen.getByText(/Sólo cuentan las ausencias aprobadas/)
    ).toBeInTheDocument();
    expect(screen.getByText(/La célula que más pierde es/)).toBeInTheDocument();
    expect(screen.getByText("Backend Platform")).toBeInTheDocument();
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

  it("sin nada aprobado lo dice en una frase, no con una fracción vacía", () => {
    render(
      <AbsencesStatsCards
        month={{ ...month, approvedFteImpact: 0, mostAffectedSquadName: null }}
        chapterFte={17.8}
      />
    );
    expect(
      screen.getByText(
        "Ninguna ausencia aprobada este mes descuenta capacidad."
      )
    ).toBeInTheDocument();
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
