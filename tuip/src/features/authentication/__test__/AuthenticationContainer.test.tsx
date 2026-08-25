import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as useLoginModule from "../hooks/useLogin";
import { AuthenticationContainer } from "../AuthenticationContainer";
import { vi, describe, beforeEach, afterEach, it, expect } from "vitest";

describe("AuthenticationContainer", () => {
  beforeEach(() => {
    vi.spyOn(useLoginModule, "useLogin").mockReturnValue({
      login: vi.fn(),
      loading: false,
      error: null,
      user: null,
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("renders login form and title", () => {
    render(
      <MemoryRouter>
        <AuthenticationContainer />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("heading", { name: /Iniciar session/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Iniciar Session/i })
    ).toBeInTheDocument();
  });
});
