<!--
Los grupos 1 a 5 son el registro de lo que ya se construyó, y quedan marcados.
La revisión visual acotó el alcance —la pieza se adopta sólo en el listado, y
pierde fondo, borde y etiqueta teñida— y eso invalidó la migración del
formulario. El grupo 6 es el delta: lo que hay que revertir y ajustar. Las
tareas de los grupos 1 a 5 que el grupo 6 deshace están señaladas ahí, no
reescritas acá.
-->

## 1. Actualizar la dependencia del sistema de diseño

- [x] 1.1 Confirmar que el change `add-seniority-card-component` del repositorio `tuip` está aplicado y que `pnpm run publish:local` dejó el `.tgz` actualizado con `SeniorityCard`, `LevelMeter` y la paleta de acento.
- [x] 1.2 Actualizar en `frontend/package.json` las versiones de `@tuya-ui/components` y `@tuya-ui/tokens`, reinstalar, y comprobar que `SeniorityCard` se importa y tipa correctamente.
- [x] 1.3 Levantar la app y recorrer las pantallas que ya consumen el paquete (Personas, Asignaciones, Squads, Home y Parámetros de admin) para confirmar que la actualización no cambió nada de lo existente.

## 2. Listado de Personas

- [x] 2.1 Reemplazar en `PeopleList.tsx` el `<Badge variant="neutral">` de la celda de Seniority por `SeniorityCard` en densidad compacta, pasando `person.seniorityLabel` tal cual.
- [x] 2.2 Quitar el import de `Badge` si ninguna otra celda del listado lo usa.
- [x] 2.3 Verificar en pantalla que las cards de filas distintas quedan alineadas al mismo ancho y que la fila con la etiqueta más larga no se recorta ni descuadra la columna.
- [x] 2.4 Verificar que un valor de seniority inesperado renderiza el estado vacío del componente en vez de romper la fila.

## 3. Campo de seniority del formulario

- [x] 3.1 Crear en `frontend/src/features/people/components/` el campo local que agrupa los cuatro niveles: `<fieldset>` con `<legend>`, cuatro `<input type="radio">` nativos con el mismo `name`, cada uno envuelto en su `<label>` alrededor de una `SeniorityCard` en densidad amplia, y el radio visualmente oculto pero enfocable.
- [x] 3.2 Reflejar la selección pasando a la card su prop de estado seleccionado, sin definir en la app ningún refuerzo visual propio.
- [x] 3.3 Asociar el mensaje de error por `aria-describedby` y marcar el grupo como obligatorio, replicando lo que el `Select` hacía.
- [x] 3.4 Alimentar el grupo con los cuatro niveles del catálogo (`seniorityOptions`), y resolver el caso de catálogo aún no cargado del mismo modo en que ya lo hacen los demás campos.
- [x] 3.5 Reemplazar el `<Select label="Seniority">` de `PersonFormDrawer.tsx` por el campo nuevo, con el mismo valor controlado, el mismo `error` y el mismo `onChange` que ya tenía.
- [x] 3.6 Reacomodar la grilla de "Información laboral": Seniority ocupa un renglón completo y Modalidad pasa a la primera celda del renglón siguiente.
- [x] 3.7 Retirar el prefijo numérico de las etiquetas en `personFormValidation.ts` (`"1 · Principiante"` → el nombre del nivel), ya que el número deja de mostrarse.
- [x] 3.8 ~~Recorrer el campo sólo con teclado~~ — **anulada**: el campo de radios se borró en 6.3, así que no hay nada que recorrer. El `Select` restaurado ya traía su propia navegación por teclado desde antes de esta HU.

## 4. Pruebas

- [x] 4.1 Actualizar `PeopleList.test.tsx`: mantener la aserción sobre el nombre del nivel y agregar la de que el seniority ya no se presenta con el componente de estado.
- [x] 4.2 Reescribir las pruebas del formulario que interactúan con el `Select` de seniority para que operen sobre los radios (`getByRole("radio", { name: ... })`), conservando lo que verifican: obligatoriedad, valor enviado y mensaje de error.
- [x] 4.3 Agregar la prueba de que elegir un nivel deselecciona los otros tres y envía el valor correcto.
- [x] 4.4 Agregar la prueba de que confirmar sin elegir nivel muestra el mensaje de campo obligatorio y no dispara la petición.
- [x] 4.5 Correr la suite completa del frontend y el lint, y confirmar que no queda ninguna prueba apoyada en la representación anterior.

## 5. Cierre

- [x] 5.1 Revisar la Definición de Terminado de la HU TUIP-214 y confirmar que el punto de listado y drawer migrados queda cubierto, sin código local que duplique la representación del nivel.

## 6. Ajustes tras la revisión visual

La pieza se adopta **sólo en el listado**. El formulario vuelve a su `Select`. Ver `design.md` y `proposal.md — Fuera de alcance`.

- [x] 6.1 Esperar a que el change de `tuip` aplique sus propios ajustes (grupo 10 de su `tasks.md`) y republique el `.tgz`. Sin eso, la pieza todavía trae fondo, borde, etiqueta teñida y la prop `selected`.
- [x] 6.2 Reinstalar la dependencia y confirmar que `SeniorityCard` ya no expone `selected` y que `Card` volvió a no tener `tone` ni `density`.

### Revertir el formulario

- [x] 6.3 Borrar `frontend/src/features/people/components/SeniorityChoiceField.tsx`. *(Deshace 3.1–3.4.)*
- [x] 6.4 Restaurar en `PersonFormDrawer.tsx` el `<Select label="Seniority">` con su `placeholder`, su `loading`, su `error` y su `onValueChange`, y volver a derivar `seniorityOptions` de `seniorities` con `String(level.value)` y el nombre del nivel como etiqueta. *(Deshace 3.5.)*
- [x] 6.5 Devolver la grilla de "Información laboral" a dos renglones de dos celdas: Cargo y Rol en el primero, Seniority y Modalidad en el segundo. Retirar el import de `SeniorityChoiceField`. *(Deshace 3.6.)*
- [x] 6.6 Confirmar que `personFormValidation.ts` sigue sin `SENIORITY_OPTIONS`: era código muerto desde antes de esta HU y no vuelve con el `Select`, que se alimenta del catálogo. *(Conserva el efecto de 3.7 sin restaurar la constante.)*

### Pruebas

- [x] 6.7 Borrar `__test__/SeniorityChoiceField.test.tsx`. *(Deshace 4.2–4.3.)*
- [x] 6.8 Borrar `__test__/PersonFormDrawer.test.tsx`, cuyos seis casos son todos sobre el campo de radios. La cobertura del formulario vuelve a ser la que había antes: ninguna sobre ese `Select`. *(Deshace 4.4.)*
- [x] 6.9 Revisar en `PeopleList.test.tsx` las aserciones sobre la representación: el medidor y el nombre accesible siguen valiendo; comprobar que ninguna dependa del fondo, del borde ni de la etiqueta teñida.
- [x] 6.10 Correr `npx vitest run src/features/people` y el lint sobre los archivos tocados, y confirmar que la suite queda verde y sin warnings nuevos.

### Cierre

- [x] 6.11 Actualizar `dod-tuip-214.md`: el punto 7 de la DoD queda cubierto sólo por el listado, y el drawer sale de alcance con su motivo. Retirar de ahí lo que decía sobre el campo de radios y su cobertura.
- [x] 6.12 Revisar el listado en pantalla y confirmar que la pieza se ve como se pidió: sin caja, etiqueta negra, sólo los guiones teñidos. Con eso quedan también cerradas 1.3 y 2.3; 3.8 desaparece junto con el campo.
