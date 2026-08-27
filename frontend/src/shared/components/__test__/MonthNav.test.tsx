import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonthNav } from "../MonthNav";

describe("MonthNav", () => {
  it("shows the month title and fires each arrow's callback", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <MonthNav title="Agosto 2026" onPrevious={onPrevious} onNext={onNext} />
    );
    expect(screen.getByText("Agosto 2026")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Mes anterior" }));
    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Mes siguiente" }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("disables an arrow at the edge of the range without firing it", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(
      <MonthNav
        title="Agosto 2026"
        onPrevious={onPrevious}
        onNext={onNext}
        previousDisabled
        nextDisabled
      />
    );
    const previous = screen.getByRole("button", { name: "Mes anterior" });
    const next = screen.getByRole("button", { name: "Mes siguiente" });
    expect(previous).toBeDisabled();
    expect(next).toBeDisabled();

    fireEvent.click(previous);
    fireEvent.click(next);
    expect(onPrevious).not.toHaveBeenCalled();
    expect(onNext).not.toHaveBeenCalled();
  });
});
