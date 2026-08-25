## 1. Dependencias

- [x] 1.1 Agregar `msw` como devDependency en `frontend/package.json` e instalar.

## 2. Servidor de mocks y handlers

- [x] 2.1 Crear `frontend/src/mocks/handlers/auth.handlers.ts` con handlers para login (éxito y error 401), logout, y `getCurrentUser`, matcheando el path/método real que usa `authService` (`httpClient.post("")`, `httpClient.get("")`).
- [x] 2.2 Crear `frontend/src/mocks/handlers/index.ts` combinando los handlers de auth (y como punto único de extensión para futuros handlers por feature).
- [x] 2.3 Crear `frontend/src/mocks/server.ts` con `setupServer(...handlers)`.

## 3. Integración con Vitest

- [x] 3.1 En `frontend/vitest-setup.ts`, arrancar el servidor de mocks en `beforeAll` (`onUnhandledRequest: "warn"`), resetear handlers en `afterEach`, y cerrarlo en `afterAll`.
- [x] 3.2 Verificar que la suite completa (`npx vitest run`) sigue pasando igual que antes (mismos tests, mismo resultado) — el servidor de mocks no debe romper ni cambiar el comportamiento de los tests unitarios existentes que mockean `httpClient`/`authService` por módulo.

## 4. Prueba de punta a punta usando el mock

- [x] 4.1 Escribir un test nuevo (p. ej. `useLogin.e2e.test.ts` o ampliar `AuthenticationContainer.test.tsx`) que ejercite el flujo completo de login exitoso — UI o hook → `authService` real (sin mockear) → `httpClient` real → interceptado por el servidor de mocks — verificando que el resultado final es el esperado.
- [x] 4.2 Escribir el caso equivalente para un login fallido (401), verificando que el error se propaga hasta la UI/hook igual que con un backend real.
- [x] 4.3 Escribir un test que sobreescriba un handler puntualmente con `server.use(...)` (p. ej. simular un 500 en `getCurrentUser`) y confirmar que no afecta a los demás tests de la suite.

## 5. Documentación y verificación final

- [x] 5.1 Agregar una nota breve (README en `frontend/src/mocks/` o sección en el README del frontend) explicando cómo agregar un handler nuevo para la próxima feature con llamadas HTTP.
- [x] 5.2 Ejecutar `npm run lint` y `npx vitest run` en `frontend/` y confirmar que ambos pasan sin regresiones nuevas respecto al estado actual.
