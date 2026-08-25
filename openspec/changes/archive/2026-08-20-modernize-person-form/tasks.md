## 1. Adornos de prefijo/sufijo en `Input` (tuip)

- [x] 1.1 Agregar props opcionales `prefix?: ReactNode` y `suffix?: ReactNode` a `InputProps` en `tuip/packages/components/src/input.tsx`.
- [x] 1.2 Envolver el `<input>` en un contenedor `flex` que replique el borde/fondo/foco que hoy tiene el `<input>` directamente (`rounded-control`, `border-default`, `bg-neutral-default`, `focus-within:ring-focus`), y mover esos estilos del `<input>` al contenedor cuando hay `prefix`/`suffix`; sin ellos, el render debe quedar idéntico al actual (mismo DOM, para no romper a los consumidores existentes).
- [x] 1.3 Renderizar `prefix`/`suffix` como elementos no interactivos a los costados del `<input>`, con `text-neutral-subtle` para que no compitan visualmente con el valor.
- [x] 1.4 Tests de `Input` cubriendo: sin adornos (comportamiento actual sin cambios), con `prefix`, con `suffix`, con ambos, y que el error (`error`) se siga mostrando igual con adornos presentes. **Adaptado**: tuip no tiene suite de tests propia (su script `test` es `tsc --noEmit`, cero archivos `.test.*` en todo el paquete) — se agregaron en `frontend/src/shared/components/__test__/Input.adornments.test.tsx`, importando `Input` desde `@tuya-ui/components` como cualquier consumidor. 5/5 tests pasan.
- [x] 1.5 Correr la suite de tests de `tuip/packages/components` y confirmar que los consumidores existentes de `Input` (sin `prefix`/`suffix`) no cambian de comportamiento. Sin suite propia que correr (ver 1.4); se corrió `pnpm run publish:local` en `tuip/` (build + `tsc --noEmit`, que sí pasó) y luego la suite completa de `frontend/` (tarea 4.1) para confirmar que ningún consumidor existente de `Input` se rompió.

## 2. Conteo de campos obligatorios en `personFormValidation`

- [x] 2.1 En `frontend/src/features/people/components/personFormValidation.ts`, agregar una función pura (p. ej. `countMissingRequiredFields(errors: FieldErrors): number`) que cuente cuántos de los errores devueltos por `validate()` corresponden a campos obligatorios vacíos (no a errores de longitud/rango). **Adaptado**: la firma toma `values: PersonFormValues` en vez de `errors: FieldErrors` — evita depender del texto de los mensajes de error para distinguir "obligatorio vacío" de "longitud/rango inválido" (ambos comparten la misma clave en `FieldErrors`).
- [x] 2.2 Tests unitarios de esa función: 0 con formulario válido, N con N campos obligatorios vacíos, y que un error de longitud/rango (campo con valor pero inválido) no cuenta como "sin llenar".

## 3. Rediseño de `PersonFormDrawer`

- [x] 3.1 Agrupar los 13 campos en 3 secciones (Identidad / Perfil / Capacidad y costo), cada una con un rótulo `text-label uppercase text-neutral-subtle` (mismo token que `TallaBandsEditors`/`CapabilityMixModal`) y un separador.
- [x] 3.2 Distribuir los campos de cada sección en una grilla de 2 columnas en pantallas medianas o más (1 columna en mobile), agrupando Documento+UPN, Cargo+Rol, y FTE+Costo+Fecha de inicio como en la imagen de referencia.
- [x] 3.3 Reemplazar los `Select` de Seniority y Modalidad por `SegmentedControl` de tuip, manteniendo las mismas opciones/catálogos que ya provee `useCatalogs`.
- [x] 3.4 Usar `suffix="FTE"` en el input de "FTE disponible" y `prefix="COP"` en el de "Costo mensual" (una vez completada la tarea 1).
- [x] 3.5 Envolver el `Switch` "¿Es externo?" en un contenedor con fondo `bg-neutral-subtle`/`rounded-control` y agregar debajo el texto de ayuda "Actívalo si la persona no está en nómina de [empresa]" (o equivalente genérico, sin asumir un nombre de empresa fijo si no hay uno ya usado en la app — revisar si `companies`/`CompanyDto` ya expone un nombre de la empresa propia a usar aquí; si no, usar una redacción neutra). `CompanyDto` solo modela proveedores externos (`id`, `name`), no una "empresa propia" — se usó la redacción neutra "Actívalo si la persona no pertenece a la nómina interna."
- [x] 3.6 Agregar en `DrawerFooter`, a la izquierda de los botones, el texto "N campos obligatorios sin llenar" usando `countMissingRequiredFields`, visible solo después del primer intento de confirmar (mismo momento en que hoy aparecen los errores por campo).
- [x] 3.7 Revisar que el campo de usuario principal (UPN) se mantenga como `Input` de texto libre simple, sin sufijo de dominio (Non-Goal de design.md).

## 4. Verificación final

- [x] 4.1 Ejecutar `npm run lint` y `npx vitest run` en `frontend/` y confirmar que pasan sin regresiones nuevas frente al baseline conocido. Lint: los archivos que este change toca quedan en 0 problemas; el resto del repo ya traía ~86 avisos preexistentes de otros changes (no tocados, fuera de alcance). Tests: 324/325 pasan; los 2 fallos (`App.test.tsx` import faltante, `httpClient.test.ts` env var) son el mismo baseline preexistente ya documentado en sesiones anteriores, sin relación con este change.
- [ ] 4.2 **Superseded por 7.7** — su descripción original quedó falsa: mencionaba verificar el `SegmentedControl` de Seniority/Modalidad, que el grupo 7 revirtió a `Select`. El recorrido manual vigente es el de 7.7.

## 5. Variante `separated` de `SegmentedControl` y labels de seniority sin número

- [x] 5.1 Agregar `variant?: "joined" | "separated"` a `SegmentedControlProps` en `tuip/packages/components/src/segmented-control.tsx` (default `"joined"`, el look actual sin cambios). Con `"separated"`: cada opción se renderiza como su propio botón (`rounded-control`, `border-default`) con un `gap-1.5` entre segmentos en vez del contenedor único `overflow-hidden`; el `<fieldset>` y el `name` compartido de los radios no cambian (sigue siendo un solo grupo).
- [x] 5.2 Usar `variant="separated"` en los dos `SegmentedControl` de `PersonFormDrawer` (Seniority y Modalidad).
- [x] 5.3 En `seniorityOptions` de `PersonFormDrawer`, mostrar sólo `level.label` (quitar el `${level.value} · ` del template). Sin cambios en `useCatalogs`/`personService` — el catálogo ya devuelve el nombre del nivel sin número en `label`.
- [x] 5.4 Correr `pnpm run publish:local` en `tuip/`, reinstalar el tarball en `frontend/` (`pnpm install`), y volver a correr `npm run lint` + `npx vitest run` en `frontend/` confirmando que siguen sin regresiones. Build de tuip OK (incluye `tsc --noEmit` en el paso DTS); lint limpio en `PersonFormDrawer.tsx`; suite 324/325, mismos 2 fallos preexistentes de baseline (`App.test.tsx`, `httpClient.test.ts`), sin regresiones.

## 6. Demarcación de las zonas del formulario

- [x] 6.1 Convertir cada `<section>` de `PersonFormDrawer` en un panel relleno: `rounded-surface bg-neutral-subtle p-4`, con el rótulo de la sección adentro (arriba). No usar `Card` de tuip — es `bg-neutral-default`, igual que la superficie del `Drawer`, y no daría contraste (ver design.md - Context). Se encapsuló en un componente local `FormSection`, que reemplaza al `SectionDivider` anterior.
- [x] 6.2 Subir el rótulo de sección de `text-neutral-subtle` a `text-neutral-default`, manteniendo `text-label uppercase`; eliminar el `SectionDivider` (la línea `h-px` deja de hacer falta una vez que el panel delimita la zona) o reducirlo a sólo el texto del rótulo. El rótulo pasó además de `<span>` a `<h3>`, que es lo que corresponde ahora que titula una zona y no un divisor decorativo.
- [x] 6.3 Invertir la tarjeta del switch "¿Es externo?" a `bg-neutral-default` + `border-default border-neutral-default`, para que siga destacándose ahora que su contenedor es `bg-neutral-subtle`.
- [x] 6.4 Verificar el resultado en tema claro y oscuro (el escalonado Drawer › panel › tarjeta depende de tokens semánticos que invierten su valor entre temas), como parte del recorrido manual de la tarea 4.2. **Obsoleto**: los paneles rellenos se descartaron en el grupo 7, así que ya no hay escalonado de tres superficies que verificar; el chequeo de temas se absorbe en la tarea 7.7.

## 7. Rediseño según la segunda referencia

Tras ver el grupo 6 implementado, el usuario lo rechazó y aportó una segunda imagen de referencia. Los paneles rellenos del grupo 6 se revierten acá (ver design.md - Decisions).

- [x] 7.1 Agregar `hint?: ReactNode` y `required?: boolean` a `Input` y `Select` de tuip, con la lógica compartida en un módulo interno nuevo `field.tsx` (`FieldLabel`, `FieldHint`, `useFieldDescription`). `required` marca el asterisco y `aria-required`, pero **no** setea el atributo nativo `required` (rompería el `onSubmit` con validación propia).
- [x] 7.2 Rediseñar los adornos `prefix`/`suffix` de `Input` como celda propia del control (fondo `bg-neutral-subtle`, filete separador, `overflow-hidden` en el contenedor) en vez de texto gris suelto.
- [x] 7.3 Reemplazar los paneles rellenos por filetes de ancho completo entre secciones (`DrawerBody` en `p-0`, cada sección con su `px-6 py-5` y `border-t`), con encabezado de ícono en pastilla + título `text-body font-semibold`. Renombrar las zonas a "Información personal" / "Información laboral" / "Asignación y disponibilidad".
- [x] 7.4 Volver Seniority y Modalidad a `Select` (revierte 3.3 y 5.2), por elección explícita del usuario sobre la guía de tuip — ver design.md.
- [x] 7.5 Sumar los elementos que faltaban de la referencia: subtítulo en `DrawerHeader`, `placeholder`s de ejemplo, `hint` en UPN y FTE, `required` en todos los campos obligatorios, y botón primario con ícono/etiqueta según modo ("Crear persona" / "Guardar cambios").
- [x] 7.6 Rebuild + reinstall de tuip, `tsc --noEmit`, lint y suite completa sin regresiones.
- [ ] 7.7 Recorrido manual en navegador del formulario rediseñado (absorbe 4.2 y el chequeo de temas de 6.4).
