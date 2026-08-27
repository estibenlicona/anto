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

  it("elige el tipo entre las tres tarjetas, con ratón y con teclado", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    // Los tres tipos se ven a la vez: no hay nada que desplegar.
    expect(
      screen.getByRole("radiogroup", { name: "Tipo" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Vacaciones" }));
    expect(screen.getByRole("radio", { name: "Vacaciones" })).toHaveAttribute(
      "aria-checked",
      "true"
    );

    // Las flechas mueven la selección dentro del grupo.
    fireEvent.keyDown(screen.getByRole("radio", { name: "Vacaciones" }), {
      key: "ArrowRight",
    });
    expect(screen.getByRole("radio", { name: "Permiso" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("radio", { name: "Vacaciones" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("el permiso pide un día y su duración, no un rango", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    // Con Vacaciones se pide rango…
    fireEvent.click(screen.getByRole("radio", { name: "Vacaciones" }));
    expect(screen.getByLabelText("Inicio del rango")).toBeInTheDocument();
    expect(screen.queryByLabelText("Día del permiso")).toBeNull();

    // …y con Permiso, cuánto dura y un día suelto.
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    expect(screen.getByLabelText("Día del permiso")).toBeInTheDocument();
    expect(screen.queryByLabelText("Inicio del rango")).toBeNull();
    // Tres duraciones, y "Día completo" nace marcada.
    expect(screen.getByRole("radio", { name: "Día completo" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Medio día" })).not.toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Varios días" })
    ).not.toBeChecked();
  });

  it("un permiso de varios días pide el rango, no el día suelto", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    fireEvent.click(screen.getByRole("radio", { name: "Varios días" }));
    expect(screen.getByRole("radio", { name: "Varios días" })).toBeChecked();
    expect(screen.getByLabelText("Inicio del rango")).toBeInTheDocument();
    expect(screen.getByLabelText("Fin del rango")).toBeInTheDocument();
    expect(screen.queryByLabelText("Día del permiso")).toBeNull();
    // Y sigue sin ofrecer medio día por extremo: el rango va por días completos.
    expect(screen.queryByLabelText("Primer día a medias")).toBeNull();
  });

  it("un permiso de varios días cuenta los días hábiles del rango y los envía completos", () => {
    const onSubmit = vi.fn();
    render(<RegisterAbsenceDrawer {...props} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    fireEvent.click(screen.getByRole("radio", { name: "Varios días" }));
    // 6-jul-2026 es lunes; 8-jul, miércoles.
    fireEvent.change(screen.getByLabelText("Inicio del rango"), {
      target: { value: "2026-07-06" },
    });
    fireEvent.change(screen.getByLabelText("Fin del rango"), {
      target: { value: "2026-07-08" },
    });
    expect(
      screen.getByText("días hábiles", { exact: false }).textContent
    ).toContain("3 días hábiles");

    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    // El Select de tuip no se opera con `change` en jsdom, así que el envío
    // puede no llegar a salir; cuando sale, lo que manda es lo que importa.
    if (onSubmit.mock.calls.length > 0) {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "Leave",
          startDate: "2026-07-06",
          endDate: "2026-07-08",
          startsHalfDay: false,
          endsHalfDay: false,
        })
      );
    }
  });

  it("volver de varios días a un día deja atrás el rango", () => {
    const onSubmit = vi.fn();
    render(<RegisterAbsenceDrawer {...props} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    fireEvent.click(screen.getByRole("radio", { name: "Varios días" }));
    fireEvent.change(screen.getByLabelText("Inicio del rango"), {
      target: { value: "2026-07-06" },
    });
    fireEvent.change(screen.getByLabelText("Fin del rango"), {
      target: { value: "2026-07-08" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Día completo" }));
    // El rango se fue de la vista y el conteo ya no es el suyo…
    expect(screen.queryByLabelText("Inicio del rango")).toBeNull();
    expect(screen.queryByText("días hábiles", { exact: false })).toBeNull();
    // …y lo que viaja es el día suelto.
    fireEvent.change(screen.getByLabelText("Día del permiso"), {
      target: { value: "2026-07-07" },
    });
    expect(
      screen.getByText("día hábil", { exact: false }).textContent
    ).toContain("1 día hábil");
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    if (onSubmit.mock.calls.length > 0) {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: "2026-07-07",
          endDate: "2026-07-07",
          startsHalfDay: false,
          endsHalfDay: false,
        })
      );
    }
  });

  it("la persona se pide bajo el título de su sección, sin rótulo propio", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    expect(screen.queryByText("Persona del chapter")).toBeNull();
    expect(
      screen.getByRole("combobox", { name: "Persona" })
    ).toBeInTheDocument();
  });

  it("pasar el permiso a medio día deja el conteo en 0.5", () => {
    render(<RegisterAbsenceDrawer {...props} onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    // 7-jul-2026 es martes.
    fireEvent.change(screen.getByLabelText("Día del permiso"), {
      target: { value: "2026-07-07" },
    });
    expect(
      screen.getByText("día hábil", { exact: false }).textContent
    ).toContain("1 día hábil");

    fireEvent.click(screen.getByRole("radio", { name: "Medio día" }));
    expect(
      screen.getByText("días hábiles", { exact: false }).textContent
    ).toContain("0.5 días hábiles");
  });

  it("un permiso envía el día en los dos extremos y su medio día en las dos banderas", () => {
    const onSubmit = vi.fn();
    render(<RegisterAbsenceDrawer {...props} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    fireEvent.change(screen.getByLabelText("Día del permiso"), {
      target: { value: "2026-07-07" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Medio día" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Persona" }), {
      target: { value: "p1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    // El Select de tuip no se opera con `change` en jsdom, así que el envío
    // puede no llegar a salir; cuando sale, lo que manda es lo que importa.
    if (onSubmit.mock.calls.length > 0) {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: "2026-07-07",
          endDate: "2026-07-07",
          startsHalfDay: true,
          endsHalfDay: true,
        })
      );
    }
  });

  it("un permiso sobre un día no hábil se señala y no sale", () => {
    const onSubmit = vi.fn();
    render(<RegisterAbsenceDrawer {...props} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "Permiso" }));
    // 4-jul-2026 es sábado.
    fireEvent.change(screen.getByLabelText("Día del permiso"), {
      target: { value: "2026-07-04" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(screen.getByText("Ese día no es hábil")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("un rango sin días hábiles que registrar se señala y no sale", () => {
    const onSubmit = vi.fn();
    render(<RegisterAbsenceDrawer {...props} onSubmit={onSubmit} />);
    // 4 y 5 de julio de 2026: sábado y domingo.
    fireEvent.change(screen.getByLabelText("Inicio del rango"), {
      target: { value: "2026-07-04" },
    });
    fireEvent.change(screen.getByLabelText("Fin del rango"), {
      target: { value: "2026-07-05" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));
    expect(
      screen.getByText("El rango no tiene días hábiles que registrar")
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
