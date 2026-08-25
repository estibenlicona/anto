import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import { ThemeProvider } from "../ThemeProvider";
import { ThemeContext } from "../ThemeContext";

describe("ThemeProvider", () => {
  beforeAll(() => {
    // Mock matchMedia
    Object.defineProperty(globalThis, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    // Mock localStorage
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      configurable: true,
      writable: true,
    });
  });
  it("renders children and provides context", () => {
    render(
      <ThemeProvider>
        <ThemeContext.Consumer>
          {(value) => value && <span>ThemeContext Ready</span>}
        </ThemeContext.Consumer>
      </ThemeProvider>
    );
    expect(screen.getByText(/ThemeContext Ready/i)).toBeInTheDocument();
  });
});
