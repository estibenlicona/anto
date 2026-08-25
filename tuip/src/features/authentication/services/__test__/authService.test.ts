import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@shared/services/httpClient";
import { authService } from "./../authService";

vi.mock("@shared/services/httpClient", () => ({
  httpClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("calls httpClient.post with credentials and returns response data", async () => {
      const mockCredentials = {
        email: "test@example.com",
        password: "password123",
      };
      const mockResponse = {
        data: {
          token: "fake-token",
          user: { id: "1", email: "test@example.com" },
        },
      };

      vi.mocked(httpClient.post).mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(httpClient.post).toHaveBeenCalledWith("", mockCredentials);
      expect(result).toEqual(mockResponse.data);
    });

    it("throws error when login fails", async () => {
      const mockCredentials = { email: "test@example.com", password: "wrong" };
      const mockError = new Error("Invalid credentials");

      vi.mocked(httpClient.post).mockRejectedValue(mockError);

      await expect(authService.login(mockCredentials)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("logout", () => {
    it("calls httpClient.post to logout endpoint", async () => {
      vi.mocked(httpClient.post).mockResolvedValue({ data: {} });

      await authService.logout();

      expect(httpClient.post).toHaveBeenCalledWith("");
    });
  });

  describe("getCurrentUser", () => {
    it("calls httpClient.get and returns user data", async () => {
      const mockResponse = {
        data: { user: { id: "1", email: "test@example.com" } },
      };

      vi.mocked(httpClient.get).mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(httpClient.get).toHaveBeenCalledWith("");
      expect(result).toEqual(mockResponse.data);
    });
  });
});
