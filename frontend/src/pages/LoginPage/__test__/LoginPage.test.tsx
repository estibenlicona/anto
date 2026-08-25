import { beforeEach, afterEach, vi, describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as useLoginModule from "@features/authentication/hooks/useLogin";
import { LoginPage } from "../LoginPage";

describe("LoginPage", () => {
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
  it("renders AuthenticationContainer", () => {
    const { container } = render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(container.querySelector(".auth-container")).toBeInTheDocument();
  });
});
