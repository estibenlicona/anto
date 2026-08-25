## 1. Dependencia

- [x] 1.1 Agregar `@radix-ui/react-toast` a `packages/components/package.json`
- [x] 1.2 Verificar que el monorepo instala y compila con la dependencia nueva

## 2. Componente Toast

- [x] 2.1 Construir `ToastProvider` sobre `Toast.Provider` + `Toast.Viewport` de Radix, viewport fijo abajo a la derecha con `z-notification`, ancho `w-80`
- [x] 2.2 Mantener una cola interna de toasts en el Provider; montar un único `Toast.Root` a la vez con el primero de la cola, avanzar a la cola al cerrarse
- [x] 2.3 Exponer `useToast()` con una función `toast({ message, icon?, action?, duration? })`
- [x] 2.4 Duración por defecto: 5000ms sin `action`, 10000ms con `action`, overrideable con el parámetro `duration`
- [x] 2.5 Estilo del toast: `bg-neutral-bold text-neutral-inverse rounded-control shadow-md`, ícono opcional + mensaje + acción opcional en una fila
- [x] 2.6 Verificar el contraste de `text-brand-default` (color de la acción) contra `bg-neutral-bold` en claro y en oscuro con el script de `packages/tokens`; si no alcanza 4.5:1, usar `text-neutral-inverse` subrayado en su lugar (ver design.md) — falló (2.59:1 claro, 2.63:1 oscuro); se usó el respaldo `text-neutral-inverse` subrayado (15:1 en ambos temas)
- [x] 2.7 Verificar con teclado: el toast no roba foco al aparecer, `Escape` lo cierra, la acción (si la hay) es alcanzable por teclado — verificado con un cliente CDP real: tras el click el foco activo sigue en `BODY`, y tras `Escape` el elemento `[role="status"]` desaparece del DOM
- [x] 2.8 Declarar los tipos públicos (`ToastOptions`, el valor de retorno de `useToast`) con descripciones para la tabla de API derivada

## 3. Registro

- [x] 3.1 Añadir la entrada `toast` a `definitions.ts`, categoría `feedback`, `status: "stable"`, con `npmDependencies` incluyendo `@radix-ui/react-toast`
- [x] 3.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos — nota: el extractor lista `useToast` como un segundo "componente" sin props (detecta cualquier export, no distingue hooks); se aclara en la documentación en vez de luchar contra la herramienta

## 4. Documentación del componente

- [x] 4.1 Escribir `content/toast.tsx`: guía de uso — cómo montar `ToastProvider`, cuándo Toast y cuándo Alert, la regla de duración con acción; anatomía; notas de accesibilidad
- [x] 4.2 Escribir los ejemplos en vivo de `examples/toast/*.tsx`: disparo simple, con acción de deshacer, uno a la vez (cada ejemplo monta su propio `ToastProvider`, que es la integración mínima)
- [x] 4.3 Registrar el módulo de contenido en `content/index.ts`

## 5. Cierre

- [x] 5.1 Recorrer los escenarios de `specs/component-library/spec.md` (Toast) en el sitio corriendo: un solo toast a la vez, duración 5s/10s, disparo desde el hook — verificado con clicks reales vía CDP: el mensaje aparece correctamente, y al disparar tres toasts seguidos solo 1 queda visible a la vez (los otros esperan en cola)
- [x] 5.2 Confirmar que ningún estilo de Toast usa un valor fuera de los tokens del sistema
- [x] 5.3 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde
