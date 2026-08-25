import { renderHook } from "@testing-library/react";
import { ThemeProvider } from "../ThemeProvider";
import { useTheme } from "../useTheme";
import { vi, describe, it, expect, beforeAll } from "vitest";

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

describe("useTheme", () => {
  it("throws error if used outside provider", () => {
    expect(() => renderHook(() => useTheme())).toThrow();
  });
  it("returns context value inside provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider>{children}</ThemeProvider>
    );
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current).toBeDefined();
  });
});
