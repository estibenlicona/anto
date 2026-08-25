import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RegisterAbsenceDrawer } from "../RegisterAbsenceDrawer";

const props = {
  open: true,
  onOpenChange: vi.fn(),
  people: [{ id: "p1", name: "María González" }],
  peopleLoading: false,
  saving: false,
  serverError: null,
};

describe("RegisterAbsenceDrawer", () => {
  it("cuenta los días hábiles del rango antes de enviar", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    // 3-jul-2026 es viernes y 6-jul lunes: el fin de semana no cuenta.
    fireEvent.change(screen.getByLabelText("Inicio del rango"), {
      target: { value: "2026-07-03" },
    });
    fireEvent.change(screen.getByLabelText("Fin del rango"), {
      target: { value: "2026-07-06" },
    });
    expect(
      screen.getByText("días hábiles", { exact: false }).textContent
    ).toContain("2 días hábiles");
  });

  it("valida persona, tipo y rango antes de enviar; el envío incompleto no sale", () => {
    const onSubmit = vi.fn();
    render(<RegisterAbsenceDrawer {...props} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByText("Selecciona la persona")).toBeInTheDocument();
    expect(screen.getByText("Selecciona el tipo")).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona el rango completo")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("un rango invertido se señala en el campo", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Inicio del rango"), {
      target: { value: "2026-07-10" },
    });
    fireEvent.change(screen.getByLabelText("Fin del rango"), {
      target: { value: "2026-07-09" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(
      screen.getByText("El fin no puede ser anterior al inicio")
    ).toBeInTheDocument();
  });

  it("muestra el error del servidor (solape) dentro del formulario", () => {
    render(
      <RegisterAbsenceDrawer
        {...props}
        serverError="La persona ya tiene una ausencia que se cruza con ese rango"
        onSubmit={vi.fn()}
      />
    );
    expect(
      screen.getByText(
        "La persona ya tiene una ausencia que se cruza con ese rango"
      )
    ).toBeInTheDocument();
  });
});
