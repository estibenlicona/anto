import { describe, it, expect } from "vitest";
import App from "./App";

describe("App - GestionCapacidad", () => {
  it("should export App component", () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe("function");
  });

  it("should be a valid React component", () => {
    expect(App.prototype).toBeUndefined(); // FC no tiene prototype
  });
});
