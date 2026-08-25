import { act, renderHook } from "@testing-library/react";
import * as authServiceModule from "../../services/authService";
import * as authAdapterModule from "../../adapters/AuthAdapter";
import { useLogin } from "../useLogin";
import { describe, it, expect, beforeAll, vi } from "vitest";

describe("useLogin", () => {
  beforeAll(() => {
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
  it("logs in and sets user", async () => {
    const fakeUser = {
      id: "1",
      email: "test@test.com",
      name: "Test",
      role: "user" as const,
      isAdmin: () => false,
    };
    const fakeResponse = {
      token: "token",
      user: fakeUser,
    };
    vi.spyOn(authAdapterModule.authAdapter, "toDto").mockImplementation(() => ({
      email: "test@test.com",
      password: "123",
    }));
    vi.spyOn(authAdapterModule.authAdapter, "toEntity").mockImplementation(
      () => fakeUser
    );
    vi.spyOn(authServiceModule.authService, "login").mockResolvedValue(
      fakeResponse
    );
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login("test@test.com", "123");
    });
    expect(result.current.user).toEqual(fakeUser);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
