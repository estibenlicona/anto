import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom no implementa matchMedia — Navbar de @tuya-ui/components lo usa para
// su comportamiento responsive.
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  configurable: true,
  writable: true,
});

// jsdom tampoco implementa ResizeObserver; algunos componentes de tuip lo
// construyen con `new`, así que el stub es una clase.
Object.defineProperty(globalThis, "ResizeObserver", {
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  configurable: true,
  writable: true,
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
