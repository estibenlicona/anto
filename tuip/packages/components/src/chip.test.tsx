import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Chip } from "./chip";

describe("Chip removible", () => {
  it("notifica la remoción sin removerse", () => {
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>Backend</Chip>);
    fireEvent.click(screen.getByRole("button", { name: "Quitar Backend" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.queryByRole("button", { pressed: true })).not.toBeInTheDocument();
  });
});

describe("Chip seleccionable", () => {
  it("es un botón con aria-pressed que notifica el estado siguiente", () => {
    const onSelectedChange = vi.fn();
    const { rerender } = render(
      <Chip selectable selected={false} onSelectedChange={onSelectedChange}>
        Backend Platform
      </Chip>
    );
    const chip = screen.getByRole("button", { name: "Backend Platform" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(chip);
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(chip).toHaveAttribute("aria-pressed", "false");

    rerender(
      <Chip selectable selected onSelectedChange={onSelectedChange}>
        Backend Platform
      </Chip>
    );
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip.className).toContain("bg-neutral-bold");
    expect(chip.className).not.toContain("brand");
    fireEvent.click(chip);
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
  });

  it("el contador forma parte del nombre accesible", () => {
    render(
      <Chip selectable selected={false} onSelectedChange={() => {}} count={5}>
        Backend Platform
      </Chip>
    );
    const chip = screen.getByRole("button", { name: "Backend Platform, 5" });
    expect(chip).toHaveTextContent("5");
  });

  it("los dos modos no se mezclan (tipado)", () => {
    // @ts-expect-error un Chip es removible o seleccionable, nunca ambos
    const both = <Chip selectable selected onSelectedChange={() => {}} onRemove={() => {}}>x</Chip>;
    expect(both).toBeTruthy();
  });
});
