import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAuth } from "./../useAuth";

describe("useAuth", () => {
  it("exports useAuthContext as useAuth", () => {
    expect(useAuth).toBeDefined();
    expect(typeof useAuth).toBe("function");
  });

  it("throws error when used outside AuthProvider", () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow();
  });
});
