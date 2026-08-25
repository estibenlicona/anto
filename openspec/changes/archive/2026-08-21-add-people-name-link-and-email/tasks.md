## 1. Celda de nombre + correo en el listado

- [x] 1.1 En `frontend/src/features/people/components/PeopleList.tsx`, reestructurar la celda de la primera columna: el `flex` horizontal mantiene el `Avatar`, y al lado pasa a haber una columna con el nombre arriba y el correo (`person.userPrincipalName`) abajo.
- [x] 1.2 Envolver el nombre en el `Link` de `react-router-dom` apuntando a `/app/lead/personas/${person.id}`, con tratamiento visual de enlace (color de marca y subrayado en hover) para que se distinga del texto plano de la fila.
- [x] 1.3 Dar al correo `text-body-sm text-neutral-subtle`, para que quede por debajo del nombre en jerarquía.

## 2. Tests

- [x] 2.1 Envolver en `MemoryRouter` los `render` de `frontend/src/features/people/components/__test__/PeopleList.test.tsx` — hoy renderizan sin router y un `Link` suelto los rompe.
- [x] 2.2 Revisar `frontend/src/features/people/__test__/PeopleContainer.test.tsx` por el mismo motivo (renderiza `PeopleContainer`, que monta `PeopleList`) y envolverlo si hace falta.
- [x] 2.3 Sumar cobertura de lo nuevo: que el correo de cada persona se muestre en el listado, y que el nombre sea un enlace cuyo `href` apunte al detalle de esa persona por id.

## 3. Verificación

- [x] 3.1 Ejecutar `npm run lint` y `npx vitest run` en `frontend/` y confirmar que no hay regresiones nuevas frente al baseline conocido (2 fallos preexistentes: `App.test.tsx` por un import faltante y `httpClient.test.ts` por la variable de entorno).
- [ ] 3.2 Levantar `pnpm dev:mock`, entrar al listado de Personas y verificar: el correo aparece bajo cada nombre, el nombre se ve y se comporta como enlace, es alcanzable con Tab, y el clic lleva a `/app/lead/personas/<id>` — que hoy muestra la pantalla de "no encontrado", que es el comportamiento esperado hasta que exista el detalle.
