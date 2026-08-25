import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@tuya-ui/components";

// tuip (`@tuya-ui/components`) no tiene suite de tests propia (su script
// "test" es sólo `tsc --noEmit`, y no hay ningún .test.* en todo el paquete)
// — se prueba desde acá, como cualquier otro consumidor, en vez de montar
// infraestructura de test nueva en tuip solo para esto (ver
// openspec/changes/modernize-person-form/tasks.md, 1.4/1.5).
describe("Input (tuya-ui) — adornos de prefix/suffix", () => {
  it("renders without adornments exactly as before (no prefix/suffix)", () => {
    render(<Input label="Nombre" placeholder="Ej. Ana" />);
    const input = screen.getByLabelText("Nombre");
    expect(input).toBeInTheDocument();
    expect(screen.queryByText("COP")).not.toBeInTheDocument();
  });

  it("renders a prefix", () => {
    render(<Input label="Costo mensual" prefix="COP" />);
    expect(screen.getByText("COP")).toBeInTheDocument();
  });

  it("renders a suffix", () => {
    render(<Input label="FTE disponible" suffix="FTE" />);
    expect(screen.getByText("FTE")).toBeInTheDocument();
  });

  it("renders both a prefix and a suffix", () => {
    render(<Input label="Rango" prefix="$" suffix="USD" />);
    expect(screen.getByText("$")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("still shows the error message with adornments present", () => {
    render(<Input label="Costo mensual" prefix="COP" error="Valor inválido" />);
    expect(screen.getByText("Valor inválido")).toBeInTheDocument();
    expect(screen.getByLabelText("Costo mensual")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
});
