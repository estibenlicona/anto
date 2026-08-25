import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("renders the sidebar menu", () => {
    render(<Sidebar />);
    expect(screen.getByText(/Menu lateral/i)).toBeInTheDocument();
  });
});
