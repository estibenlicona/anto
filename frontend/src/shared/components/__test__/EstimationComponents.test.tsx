import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MatrixNumberCell } from "../MatrixNumberCell";
import { PairedBar } from "../PairedBar";
import { TonedSegmentedControl } from "../TonedSegmentedControl";
import { ValidationList } from "../ValidationList";
import { ValueDiff } from "../ValueDiff";

describe("MatrixNumberCell", () => {
  it("el guion de «no aporta» se anuncia con palabras y no como un cero", () => {
    render(<MatrixNumberCell value={undefined} label="P1 en tamaño" />);

    // Un lector de pantalla leyendo «menos» no dice lo mismo que «no aporta»,
    // y «0» diría algo directamente falso.
    expect(screen.getByText("P1 en tamaño: no aporta")).toBeInTheDocument();
    expect(screen.queryByText("P1 en tamaño: 0")).not.toBeInTheDocument();
  });

  it("un peso de cero es un cero, no un guion", () => {
    render(<MatrixNumberCell value={0} label="P1 en tamaño" />);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("P1 en tamaño: 0")).toBeInTheDocument();
  });

  it("vaciar el campo es la forma de decir «no aporta»", () => {
    const onChange = vi.fn();
    render(<MatrixNumberCell value={3} label="P1 en tamaño" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("P1 en tamaño"), { target: { value: "" } });

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("escribir un número lo reporta como número", () => {
    const onChange = vi.fn();
    render(<MatrixNumberCell value={undefined} label="P1 en tamaño" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("P1 en tamaño"), { target: { value: "4" } });

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("sin onChange la celda es de sólo lectura", () => {
    render(<MatrixNumberCell value={3} label="P1 en tamaño" />);

    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });
});

describe("ValidationList", () => {
  const items = [
    { id: "MIX", title: "Mix de capacidades", status: "impedimento" as const, missing: "No suman 100: XS." },
    { id: "PESOS", title: "Pesos por salida", status: "advertencia" as const, missing: "No mueven nada: Q2." },
    { id: "TALLAS", title: "Reglas de talla", status: "pasa" as const },
  ];

  it("cada ítem lleva su estado en texto, no sólo en color", () => {
    render(<ValidationList items={items} label="Validación" />);

    expect(screen.getByText("Impedimento")).toBeInTheDocument();
    expect(screen.getByText("Advertencia")).toBeInTheDocument();
    expect(screen.getByText("Pasa")).toBeInTheDocument();
  });

  it("sólo lo que no pasa ofrece la acción de arreglarlo", () => {
    render(<ValidationList items={items} label="Validación" onGoTo={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: "Ir a arreglarlo" })).toHaveLength(2);
  });

  it("activar la acción dice qué ítem fue", () => {
    const onGoTo = vi.fn();
    render(<ValidationList items={items} label="Validación" onGoTo={onGoTo} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Ir a arreglarlo" })[0]);

    expect(onGoTo).toHaveBeenCalledWith(expect.objectContaining({ id: "MIX" }));
  });

  it("sin onGoTo la lista informa y no ofrece acciones muertas", () => {
    render(<ValidationList items={items} label="Validación" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("ValueDiff", () => {
  it("un cambio se anuncia como «pasa de X a Y»", () => {
    render(<ValueDiff before="20" after="10" kind="cambiado" label="Talla XS" />);

    expect(
      screen.getByRole("group", { name: "Talla XS: pasa de 20 a 10" })
    ).toBeInTheDocument();
  });

  it("un agregado no muestra un lado vacío", () => {
    render(<ValueDiff before={null} after="nueva" kind="agregado" label="Driver X" />);

    expect(screen.getByRole("group", { name: "Driver X: se agregó nueva" })).toBeInTheDocument();
  });
});

describe("PairedBar", () => {
  it("dice los dos números y cuánto falta", () => {
    render(<PairedBar demand={3} available={2} max={5} label="Backend Dev" />);

    expect(
      screen.getByRole("img", { name: "Backend Dev: pide 3, hay 2, faltan 1" })
    ).toBeInTheDocument();
  });

  it("sin déficit no inventa un faltante", () => {
    render(<PairedBar demand={1} available={2} max={5} label="QA Engineer" />);

    expect(
      screen.getByRole("img", { name: "QA Engineer: pide 1, hay 2" })
    ).toBeInTheDocument();
  });
});

describe("TonedSegmentedControl", () => {
  const options = [
    { value: "no", label: "No" },
    { value: "si", label: "Sí", tone: "danger" as const },
  ];

  it("el matiz nunca es el único canal: la opción sigue diciendo qué es", () => {
    render(
      <TonedSegmentedControl
        options={options}
        value="si"
        onValueChange={vi.fn()}
        label="¿Toca datos personales?"
      />
    );

    expect(screen.getByRole("radio", { name: "Sí" })).toBeChecked();
  });

  it("elegir una opción la reporta", () => {
    const onValueChange = vi.fn();
    render(
      <TonedSegmentedControl
        options={options}
        value="no"
        onValueChange={onValueChange}
        label="¿Toca datos personales?"
      />
    );

    fireEvent.click(screen.getByRole("radio", { name: "Sí" }));

    expect(onValueChange).toHaveBeenCalledWith("si");
  });
});
