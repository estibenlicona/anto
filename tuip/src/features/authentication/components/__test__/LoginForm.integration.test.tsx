import { render, screen, fireEvent } from "@testing-library/react";
import { LoginForm } from "../LoginForm";
import { vi, describe, it, expect } from "vitest";

describe("LoginForm integration", () => {
  it("calls onSubmit with email and password", () => {
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Contraseña/i), {
      target: { value: "123" },
    });
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledWith("test@test.com", "123");
  });
});
