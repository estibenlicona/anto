import { authAdapter, IAuthResponse } from "../AuthAdapter";
import { describe, it, expect } from "vitest";

describe("authAdapter", () => {
  it("should convert credentials to DTO", () => {
    const dto = authAdapter.toDto("test@test.com", "123");
    expect(dto).toEqual({ email: "test@test.com", password: "123" });
  });
  it("should convert response to entity", () => {
    const response: IAuthResponse = {
      user: {
        id: "1",
        email: "test@test.com",
        name: "Test",
        role: "user",
      },
      token: "sometoken",
    };
    const entity = authAdapter.toEntity(response);
    expect(entity).toMatchObject(response.user);
  });
});
