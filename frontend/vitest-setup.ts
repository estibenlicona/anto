import "reflect-metadata";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./src/mocks/server";

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

// jsdom no implementa matchMedia — varios componentes de @tuya-ui/components
// (Sidebar, Navbar) lo usan para su comportamiento responsive.
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

// jsdom tampoco implementa ResizeObserver — el Slider de @tuya-ui/components
// lo usa para medir su pulgar. Sin tamaños reales que reportar, el stub sólo
// necesita existir: los tests afirman sobre los valores del control, no sobre
// su geometría. Va como clase y no como `vi.fn()` porque se construye con
// `new`, y una arrow function no es construible.
Object.defineProperty(globalThis, "ResizeObserver", {
  value: class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  configurable: true,
  writable: true,
});

// onUnhandledRequest: "warn" — los tests unitarios que mockean httpClient
// por módulo nunca llegan a la capa de red y no deben fallar por no tener
// un handler MSW correspondiente.
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

afterEach(() => {
  cleanup();
});
