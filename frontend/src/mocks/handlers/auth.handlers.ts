import { http, HttpResponse } from "msw";
import type {
  IAuthResponse,
  ILoginDto,
} from "@features/authentication/adapters/AuthAdapter";

/**
 * authService llama login/logout/getCurrentUser contra el mismo baseURL sin
 * path adicional. Path relativo (no origen hardcodeado) para que el mismo
 * handler matchee tanto en Node/tests (http://localhost:3000) como en el
 * navegador/dev (http://localhost:5173) — ver add-browser-mock-mode,
 * design.md Decisión 1. El método HTTP y, para POST, la forma del body,
 * son lo único que distingue una operación de otra.
 */
const AUTH_URL = "/";

const mockUser = (email: string): IAuthResponse => ({
  token: "mock-token",
  user: { id: "1", email, name: "Usuario Mock", role: "user" },
});

export const authHandlers = [
  http.post(AUTH_URL, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as ILoginDto | null;

    // logout: authService lo llama sin body
    if (!body || !("email" in body)) {
      return HttpResponse.json({});
    }

    // login
    if (body.password === "wrong") {
      return HttpResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }
    return HttpResponse.json(mockUser(body.email));
  }),

  http.get(AUTH_URL, () => {
    return HttpResponse.json(mockUser("mock@test.com"));
  }),
];
