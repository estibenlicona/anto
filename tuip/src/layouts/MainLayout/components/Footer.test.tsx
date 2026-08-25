import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";
import { describe, it, expect } from "vitest";

describe("Footer", () => {
  it("renders the copyright text", () => {
    render(<Footer />);
    expect(screen.getByText(/Copyrigth/i)).toBeInTheDocument();
  });
});
