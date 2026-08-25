import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LoginForm } from "./../LoginForm";

describe("LoginForm", () => {
  it("renders login form with email and password inputs", () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /iniciar session/i })
    ).toBeInTheDocument();
  });

  it("calls onSubmit with email and password when form is submitted", () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Contraseña");
    const submitButton = screen.getByRole("button", {
      name: /iniciar session/i,
    });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
  });

  it("displays error message when error prop is provided", () => {
    const mockOnSubmit = vi.fn();
    const errorMessage = "Invalid credentials";
    render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("disables form when loading is true", () => {
    const mockOnSubmit = vi.fn();
    render(<LoginForm onSubmit={mockOnSubmit} loading={true} />);

    const submitButton = screen.getByRole("button", { name: /cargando/i });
    expect(submitButton).toBeDisabled();
  });
});
