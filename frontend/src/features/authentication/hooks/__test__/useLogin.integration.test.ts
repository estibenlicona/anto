import { vi, describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import * as authServiceModule from "../../services/authService";
import * as authAdapterModule from "../../adapters/AuthAdapter";
import { useLogin } from "../useLogin";

describe("useLogin integration", () => {
  it("handles error on login failure", async () => {
    vi.spyOn(authAdapterModule.authAdapter, "toDto").mockImplementation(() => ({
      email: "fail@test.com",
      password: "bad",
    }));
    vi.spyOn(authAdapterModule.authAdapter, "toEntity").mockImplementation(
      () => ({
        id: "1",
        email: "fail@test.com",
        name: "fail",
        role: "user", // or provide a valid role value if needed
        isAdmin: () => true, // or true, depending on your test case
      })
    );
    vi.spyOn(authServiceModule.authService, "login").mockRejectedValue(
      new Error("fail")
    );
    const { result } = renderHook(() => useLogin());
    await act(async () => {
      await result.current.login("fail@test.com", "bad");
    });
    expect(result.current.error).toBe("fail");
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
