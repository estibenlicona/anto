import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { CapacityRedirect } from "../CapacityRedirect";

function Probe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderAt(url: string) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/app/lead/capacidades" element={<CapacityRedirect />} />
        <Route path="/app/lead/celulas" element={<Probe />} />
        <Route path="/app/lead/celulas/:id" element={<Probe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CapacityRedirect", () => {
  it("redirige al detalle de la célula indicada en ?celula=", () => {
    renderAt("/app/lead/capacidades?celula=abc-123");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/app/lead/celulas/abc-123"
    );
  });

  it("sin célula redirige al listado", () => {
    renderAt("/app/lead/capacidades");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/app/lead/celulas"
    );
  });
});
