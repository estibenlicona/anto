## 1. Dependencia para `asChild`

- [x] 1.1 Agregar `@radix-ui/react-slot` a `dependencies` de `packages/components/package.json`, fijando el rango en la misma versión que ya resuelve el lockfile como transitiva de los demás paquetes de Radix, e instalar.
- [x] 1.2 Confirmar con `pnpm why @radix-ui/react-slot` que la instalación no agrega una copia nueva al árbol, sino que promueve la que ya estaba.

## 2. Componente `Link`

- [x] 2.1 Crear `packages/components/src/link.tsx` exportando `Link` y `LinkProps`, sobre `AnchorHTMLAttributes<HTMLAnchorElement>`, con `ref` reenviado al ancla.
- [x] 2.2 Definir el mapa literal de tonos con clases completas — color de texto y anillo de foco juntos en cada entrada — con el comentario que explica la restricción de Tailwind, al estilo de `avatar.tsx` y `card.tsx`. `brand` usa `text-brand-default` + `ring-brand-focus-ring`; `neutral` usa `text-neutral-default` + `ring-neutral-focus-ring`.
- [x] 2.3 Aplicar las clases comunes a los dos tonos: subrayado sólo en `hover:` y `focus-visible:` con `underline-offset-2`, `rounded-control` y `focus-visible:ring-focus` para que el anillo no quede pegado al glifo, y `outline-none`.
- [x] 2.4 Implementar `asChild` con el `Slot` de Radix: cuando está en `true`, `Link` no renderiza su propio `<a>` sino que pasa clases y props al hijo. Anotar en el código que el hijo tiene que ser un elemento único.
- [x] 2.5 Componer el `className` recibido por encima del propio con `cn`, como el resto del paquete, para que un consumidor pueda ajustar interlineado o truncado sin perder el tono.
- [x] 2.6 Documentar `tone` y `asChild` con su comentario de documentación — es lo que alimenta la tabla de props del sitio — incluyendo en `tone` la advertencia de que `neutral` no se distingue en reposo.
- [x] 2.7 Exportar `Link` desde `packages/components/src/index.ts`.
- [x] 2.8 Correr `pnpm --filter @tuya-ui/components verify:colors` y `tsc --noEmit`, y confirmar que no hay literales de color ni errores de tipos.

## 3. Pruebas del componente

- [x] 3.1 Crear `packages/components/src/link.test.tsx`.
- [x] 3.2 Probar que sin `tone` renderiza el tono de marca, y que con `tone="neutral"` no queda ninguna clase del rol `brand` — ni de texto ni de anillo de foco.
- [x] 3.3 Probar que en los dos tonos el subrayado está condicionado a `hover` y a `focus-visible`, y que ninguna clase lo aplica en reposo.
- [x] 3.4 Probar que renderiza un elemento con rol de enlace y que su nombre accesible es su texto.
- [x] 3.5 Probar `asChild`: con un hijo ancla se renderiza un único elemento de ancla — sin anclas anidadas — que conserva el `href` del hijo y las clases del tono.
- [x] 3.6 Probar que un `className` del consumidor convive con las clases del tono en vez de reemplazarlas.
- [x] 3.7 Correr `pnpm --filter @tuya-ui/components test` y confirmar que la suite queda verde.

## 4. Catálogo y distribución

- [x] 4.1 Declarar `link` en `packages/components/registry/definitions.ts`: categoría `layout` — el catálogo no tiene familia de navegación y `breadcrumb` vive ahí, `status: "beta"`, descripción en inglés al estilo de las demás entradas, `dependencies: ["utils"]`, `npmDependencies: ["react", "@radix-ui/react-slot"]`, `files` apuntando a `src/link.tsx` y `extendsElement: "a"`.
- [x] 4.2 Regenerar el manifiesto con `pnpm --filter @tuya-ui/components generate:registry` y confirmar que `link` aparece con su estado, sus dependencias y su tabla de props derivada de los tipos.
- [x] 4.3 Crear el changeset `MINOR` de `@tuya-ui/components` describiendo la adición de `Link` y dejando explícito que ninguna pieza existente cambia de comportamiento. Sin entrada para `@tuya-ui/tokens`: no se agrega ningún token.
- [x] 4.4 Correr `pnpm run build`, `pnpm test` y `pnpm lint` en la raíz, y confirmar que el `registry.json` empaquetado y la Skill generada quedan al día.

## 5. Documentación

- [x] 5.1 Escribir `apps/docs/src/content/link.tsx` con sus cuatro pestañas (Uso, Anatomía, Accesibilidad, API) y registrarlo en `apps/docs/src/content/index.ts`.
- [x] 5.2 En la pestaña de Uso, escribir el criterio de elección frente a `Button variant="link"` — `Link` navega, `Button variant="link"` ejecuta una acción sin salir de la página — con un ejemplo de cada caso.
- [x] 5.3 En la pestaña de Uso, escribir cuándo corresponde cada tono: `brand` para el enlace que quiere destacarse en un párrafo o en una tarjeta, `neutral` para el enlace que se repite fila a fila en una tabla y teñiría la columna entera.
- [x] 5.4 En la pestaña de Accesibilidad, dejar por escrito la contrapartida del tono neutro: en reposo no se distingue del texto plano, sólo se revela en hover y en foco, y en táctil no hay hover. Decir explícitamente que se elige a sabiendas y no por descarte, y que lo que no se pierde es la vía asistida — el lector de pantalla lo anuncia como enlace igual.
- [x] 5.5 En la pestaña de Accesibilidad, documentar que `asChild` exige un hijo único que reenvíe props y `ref`.
- [x] 5.6 Escribir los ejemplos ejecutables en `apps/docs/src/examples/link/`: los dos tonos lado a lado, el tono neutro dentro de una fila de tabla junto a texto plano (que es el caso que motiva el tono), y el uso con `asChild`.
- [x] 5.7 Levantar el sitio (`pnpm run docs:dev`) y verificar que `Link` aparece en el catálogo, en el sidebar y en la búsqueda —los tres se derivan del registry—, que la tabla de props se generó desde los tipos, y que no queda ninguna pestaña con documentación pendiente.
- [x] 5.8 En el sitio, recorrer con el teclado los ejemplos de los dos tonos y confirmar que el anillo de foco aparece en el tono correcto y que el subrayado se muestra también al enfocar, no sólo al pasar el puntero.

## 6. Publicación local para el consumidor

- [x] 6.1 Correr `pnpm run publish:local` y confirmar que `.local-packages/tuya-ui-components-0.1.0.tgz` se regeneró con `Link` adentro.
- [x] 6.2 Avisar que el change `adopt-neutral-name-link-in-people` del repositorio de la aplicación queda desbloqueado: sólo necesita reinstalar la dependencia, sin cambiar la ruta del `.tgz` en su `package.json`.
