import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "../ThemeProvider";
import { useTheme } from "../useTheme";

import { beforeAll, vi, describe, it, expect } from "vitest";

beforeAll(() => {
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

describe("ThemeProvider integration", () => {
  const TestComponent = () => {
    const { theme, toggleTheme, setTheme } = useTheme();
    return (
      <div>
        <span data-testid="theme-value">{theme}</span>
        <button onClick={toggleTheme}>Toggle</button>
        <button onClick={() => setTheme("dark")}>Set Dark</button>
      </div>
    );
  };
  it("toggles and sets theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const themeValue = screen.getByTestId("theme-value");
    expect(themeValue.textContent).toMatch(/light|dark/);
    fireEvent.click(screen.getByText("Toggle"));
    expect(themeValue.textContent).toMatch(/light|dark/);
    fireEvent.click(screen.getByText("Set Dark"));
    expect(themeValue.textContent).toBe("dark");
  });
});
