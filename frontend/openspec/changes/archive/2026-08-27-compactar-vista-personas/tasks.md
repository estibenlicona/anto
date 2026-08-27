## 1. Personas: retirar el encabezado y publicar la acción

- [x] 1.1 En `PeopleContainer.tsx`, dejar de renderizar `PeopleHeader` (quitar import) y publicar con `useLeadBreadcrumbActions` un `Button` primario `size="small"` "Nueva persona" con `iconBefore` `<Icon name="user" size={16} />` y `onClick={openCreate}`, con un comentario que explique por qué no hay encabezado (mismo texto de intención que `SquadsContainer`)
- [x] 1.2 En `PeopleContainer.tsx`, cambiar el `gap-6` de la raíz por `gap-2`
- [x] 1.3 Eliminar `src/features/people/components/PeopleHeader.tsx` (confirmar con grep que no queda ningún consumidor)

## 2. Tests

- [x] 2.1 En `PeopleContainer.test.tsx`, envolver el render con `LeadBreadcrumbProvider` y una sonda que pinte `actions` (mismo patrón que `SquadsContainer.test.tsx`)
- [x] 2.2 En `PeopleContainer.test.tsx`, sustituir el assert del `heading` "Personas" y del texto "Perfiles y seniority del equipo" por asserts de su ausencia, y afirmar que el botón "Nueva persona" existe dentro de la sonda del breadcrumb; actualizar el comentario de cabecera que menciona el encabezado
- [x] 2.3 Crear `src/pages/LeadPeoplePage/LeadPeoplePage.test.tsx` que afirme un único `heading` nivel 1 con el texto "Gestionar Personas" (siguiendo `LeadSquadsPage.test.tsx`)

## 3. Verificación

- [x] 3.1 `pnpm test` (suites de people y de páginas) en verde y `pnpm lint` sin errores (quedan fallos y errores de lint previos y ajenos al change: `App.test.tsx` importa un `./App` inexistente, `httpClient` sin baseURL, y 5 `set-state-in-effect` en hooks de datos no tocados)
- [x] 3.2 Revisar en el navegador `/app/lead/personas`: sin título ni descripción visibles, botón a la derecha y a la altura del breadcrumb, cards primero y listado inmediatamente después; comprobar carga, error, "Sin resultados" y vacío inicial; entrar al detalle de una persona y volver para ver que el botón se retira y reaparece
- [x] 3.3 Comparar `/app/lead/personas` con `/app/lead/celulas` en la misma sesión: mismo alto de franja, misma separación y mismo tamaño de botón
