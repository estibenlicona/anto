## 1. Contrato y mocks

- [x] 1.1 Agregar `utilization: number` a `PersonDto` en `personService.ts`, documentado como porcentaje calculado por el backend desde las asignaciones (0–100+), sólo de lectura — no entra en `CreatePersonRequest`/`UpdatePersonRequest`.
- [x] 1.2 En `people.handlers.ts`, asignar utilización fija y variada a las personas del catálogo (cubriendo 0, valores medios, 100 y al menos uno > 100) y `0` a las personas creadas por el handler de alta, con el comentario de por qué los valores son fijos y de que no comparten estado con los mocks de Capacidades.
- [x] 1.3 Propagar `utilization` en `PersonAdapter` al modelo `Person` del listado.

## 2. Columnas en el listado

- [x] 2.1 En `PeopleList.tsx`, agregar las cabeceras "FTE" y "Utilización" después de Modalidad y antes del menú de acciones.
- [x] 2.2 Celda FTE: el número plano con `tabular-nums`, sin control de edición.
- [x] 2.3 Celda Utilización: función pura de umbral → clase (`0` sin relleno, `1–99` `bg-success-bold`, `100` `bg-warning-bold`, `>100` `bg-danger-bold`), track redondeado con alto inline, relleno con ancho inline `min(utilization, 100)%`, y el porcentaje como texto `tabular-nums` neutro al lado. Ancho mínimo inline para que la barra no colapse.
- [x] 2.4 Correr el typecheck y confirmar que el listado renderiza con el campo nuevo en todos sus estados (carga, vacío, error intactos).

## 3. Pruebas

- [x] 3.1 En `PeopleList.test.tsx`: las dos columnas presentes; la celda FTE muestra el número del mock; la barra usa la clase del umbral correcto y el ancho inline esperado para casos 0%, medio, 100% y >100% (saturado a 100% de ancho); el porcentaje se muestra como texto.
- [x] 3.2 Probar la función de umbral → clase como unidad (bordes: 0, 1, 99, 100, 101).
- [x] 3.3 Revisar las pruebas existentes del listado y los mocks compartidos que construyen `Person` sin `utilization` — actualizar fixtures donde el tipo lo exija.
- [x] 3.4 Correr `npx vitest run src/features/people` y el lint, sin regresiones frente al baseline conocido.

## 4. Verificación en pantalla

- [x] 4.1 Levantar `pnpm dev:auth` y comparar contra la referencia: barra pequeña por fila, verde en valores medios, vacía en 0%, naranja en 100%, roja saturada si hay > 100%, porcentaje al lado y FTE como número.
- [x] 4.2 Confirmar que la tabla convive con las dos columnas nuevas sin desbordar el contenedor (o scrollea dentro de él) y que ningún estilo cayó en el vacío.
