## 1. Componente

- [x] 1.1 Crear `packages/components/src/stepper.tsx`: `Stepper` (`<ol className="flex items-center">`, `children`, `className?`) y `StepperStep` (`<li>`).
- [x] 1.2 `StepperStep` props: `status` ("completed" | "current" | "pending", requerido, sin default), `step: number` (ordinal mostrado en "current"/"pending", ignorado cuando `status="completed"`), `label` (nodo, negrita), `description?` (nodo, subtítulo muted) — cada prop con JSDoc.
- [x] 1.3 Círculo (`h-7 w-7 rounded-pill`, 28px exacto vía la escala por defecto): `completed` → `bg-success-bold text-success-on-bold` + `<Icon name="check" size={16} />`; `current` → `bg-brand-bold text-brand-on-bold` + `{step}`; `pending` → `border border-neutral-default text-neutral-subtle` + `{step}`.
- [x] 1.4 Atenuación del paso pendiente: `opacity-[.55]` en el grupo círculo+etiqueta (no en la línea de conexión, que mantiene opacidad plena en cualquier estado).
- [x] 1.5 Línea de conexión: segmento horizontal (`flex-1 bg-neutral-default`) entre un paso y el siguiente, suprimido en el último paso vía `group-last:hidden` sobre un `<li className="group ...">` — mismo mecanismo que la línea vertical de `ActivityTimeline`. El `<li>` mismo necesita `flex-1` (con `last:flex-none`) además del conector: sin eso, el conector no tiene espacio libre dentro del `<li>` hacia el cual crecer.
- [x] 1.6 `Stepper.displayName`, `StepperStep.displayName` asignados.

## 2. Registro

- [x] 2.1 Agregar entrada `stepper` al registro: categoría `layout`, `status: "stable"`, `npmDependencies: ["react"]`, `dependencies: ["utils", "icon"]`.
- [x] 2.2 Agregar `export * from "./stepper"` a `packages/components/src/index.ts`.
- [x] 2.3 Ejecutar `pnpm --filter @tuya-ui/components build` para regenerar `registry.json` y confirmar que el componente extrae props, peso y código fuente correctamente. 33 componentes, `stepper: 2 exported component(s), 4 own prop(s)`.

## 3. Documentación

- [x] 3.1 Crear `apps/docs/src/content/stepper.tsx` (uso, anatomía, accesibilidad), incluyendo la guía "bajo tres pasos, formulario simple; sobre cinco, guardar borrador" tal como la trae la fuente, y la aclaración de que `Stepper` no infiere el estado de sus pasos.
- [x] 3.2 Crear ejemplos en vivo en `apps/docs/src/examples/stepper/*.tsx`: la traza "Recurso → Dimensionamiento → Aprobación" de la fuente, con `Atrás`/`Continuar` que avanzan el `status` de cada paso — construida solo con `Stepper`, `Input`, `DateField` y `Button`, sin inventar un `Textarea` ni un `Input` con sufijo de unidad. El `status` de cada paso se calcula desde el índice actual con la expresión de una línea que la propia guía de uso documenta.
- [x] 3.3 Registrar `stepperContent` en `apps/docs/src/content/index.ts` con la clave `"stepper"`.

## 4. Cierre

- [x] 4.1 Levantar el sitio de docs y verificar visualmente: los tres estados de círculo, el ícono de check en `completed`, la línea de conexión presente entre pasos y ausente después del último, la atenuación del paso pendiente, y que el ejemplo interactivo avanza el estado al hacer clic en "Continuar". Verificado con capturas: la figura de anatomía replica el mockup casi exacto (sin el marco de tarjeta, como decide design.md), y el ejemplo interactivo, tras un clic en "Continuar", muestra el paso 1 completado con check, el paso 2 en curso con opacidad plena y el paso 3 todavía atenuado — la línea de conexión visible entre 1-2 y 2-3 en todo momento.
- [x] 4.2 Grep de valores hex/px sueltos en `stepper.tsx`. Sin coincidencias — ni siquiera `opacity-[.55]` aparece, porque no es ni hex ni px.
- [x] 4.3 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en la raíz del monorepo y dejar los tres en verde.
