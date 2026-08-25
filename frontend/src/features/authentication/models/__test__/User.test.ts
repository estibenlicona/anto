import { describe, it, expect } from "vitest";
import { UserEntity } from "./../User";

describe("UserEntity", () => {
  it("creates a user with correct properties", () => {
    const user = new UserEntity("1", "test@example.com", "Test User", "user");

    expect(user.id).toBe("1");
    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
    expect(user.role).toBe("user");
  });

  it("returns true for admin user", () => {
    const adminUser = new UserEntity(
      "1",
      "admin@example.com",
      "Admin",
      "admin"
    );

    expect(adminUser.isAdmin()).toBe(true);
  });

  it("returns false for regular user", () => {
    const regularUser = new UserEntity("1", "user@example.com", "User", "user");

    expect(regularUser.isAdmin()).toBe(false);
  });
});
