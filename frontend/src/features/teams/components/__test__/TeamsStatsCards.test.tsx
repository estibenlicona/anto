import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamsStatsCards } from "../TeamsStatsCards";

describe("TeamsStatsCards", () => {
  it("no renderiza nada mientras carga", () => {
    const { container } = render(
      <TeamsStatsCards totalCount={0} totalSquadCount={0} loading />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el total de equipos y de células agrupadas con datos", () => {
    render(
      <TeamsStatsCards totalCount={4} totalSquadCount={5} loading={false} />
    );
    expect(screen.getByText("EQUIPOS")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("CÉLULAS AGRUPADAS")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("muestra cero en ambos indicadores sin equipos, sin errores de cálculo", () => {
    render(
      <TeamsStatsCards totalCount={0} totalSquadCount={0} loading={false} />
    );
    expect(screen.getAllByText("0")).toHaveLength(2);
  });
});
