import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotFoundPage } from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("renders not found message", () => {
    render(<NotFoundPage />);
    expect(screen.getByText(/Not found Page/i)).toBeInTheDocument();
  });
});
