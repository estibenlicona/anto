## 1. Componente FileInput

- [x] 1.1 Crear `packages/components/src/file-input.tsx`: zona de arrastre como `<label>` con un `<input type="file" className="peer sr-only">` real (enfocable, nunca `display:none`) — clic o Enter/Espacio sobre la zona abren el selector nativo sin manejo de teclado propio. **Ajuste sobre el plan:** el input queda como hermano que precede al `label` en el DOM, no anidado dentro — `peer`/`peer-focus-visible:` de Tailwind solo funciona entre hermanos (selector de hermano general), anidado nunca habría activado el anillo de foco. El par `htmlFor`/`id` alcanza igual para que el clic en el label abra el selector nativo, sin necesitar el anidado.
- [x] 1.2 Props: `label?`, `error?` (misma forma que `Input`), `value: File | null` (controlado, sin `defaultValue` — ver design.md), `onValueChange: (file: File | null) => void`, `accept?` (paso directo al atributo nativo), `disabled?` — cada prop con JSDoc.
- [x] 1.3 Estado vacío: ícono `import`, texto de invitación a elegir o arrastrar un archivo, `rounded-control border border-dashed border-neutral-default`.
- [x] 1.4 Estado con archivo elegido: ícono `attach-doc`, nombre y tamaño legible (`Intl` o formato simple de KB/MB), botón con ícono `close` para quitarlo sin exigir un reemplazo inmediato.
- [x] 1.5 Arrastre: `onDragEnter`/`onDragOver`/`onDragLeave`/`onDrop` alimentan un estado interno `dragActive` (no expuesto como prop) que cambia a `border-brand-default bg-brand-subtle` mientras dura; `onDrop` llama a `onValueChange` con el primer archivo soltado, ignorando el resto si hay más de uno.
- [x] 1.6 Foco: `peer` en el input real, `peer-focus-visible:ring-focus peer-focus-visible:ring-border-brand-focus` en el `label` — el foco vive en el input nativo, el anillo se ve en el contenedor.
- [x] 1.7 `error` colorea el borde (`border-danger-default`) igual que `Input`, y se muestra debajo con `id` enlazado por `aria-describedby`.
- [x] 1.8 `FileInput.displayName` asignado.

## 2. Componente FileUploader

- [x] 2.1 Crear `packages/components/src/file-uploader.tsx`: misma zona de arrastre que `FileInput` (input hermano precediendo al `label`, drag handlers), pero `onDrop`/selección llaman a `onFilesAdded(files: File[])` con todos los archivos, sin quedarse con uno solo. El input nativo lleva `multiple`.
- [x] 2.2 Tipo `FileUploaderItem`: `{ id: string; file: File; status: "uploading" | "success" | "error"; progress?: number; errorMessage?: string }`, exportado.
- [x] 2.3 Props: `label?`, `error?`, `files: FileUploaderItem[]` (controlado por quien lo usa), `onFilesAdded: (files: File[]) => void`, `onFileRemove?: (id: string) => void`, `accept?`, `disabled?`.
- [x] 2.4 Cada fila: ícono `attach-doc` + nombre + tamaño, y según `status` — `uploading`: `<Progress value={progress ?? 0} label={...} />` (reusa el componente ya publicado); `success`: ícono `check` en `text-success-default`; `error`: ícono `status-error` en `text-danger-default` + `errorMessage` junto a la fila, sin afectar otras filas. Botón `close` para quitar la fila en cualquier estado (solo si se pasó `onFileRemove`).
- [x] 2.5 Lista envuelta en un contenedor `aria-live="polite"` para que un cambio de estado (uploading → success/error) se anuncie sin que el usuario haya disparado esa tecla en ese instante.
- [x] 2.6 `FileUploader.displayName` asignado.

## 3. Registro

- [x] 3.1 Agregar entrada `file-input` al registro: categoría `forms`, `status: "stable"`, `npmDependencies: ["react"]`, `dependencies: ["utils", "icon"]`.
- [x] 3.2 Agregar entrada `file-uploader` al registro: categoría `forms`, `status: "stable"`, `npmDependencies: ["react"]`, `dependencies: ["utils", "icon", "progress"]`.
- [x] 3.3 Agregar `export * from "./file-input"` y `export * from "./file-uploader"` a `packages/components/src/index.ts`.
- [x] 3.4 Ejecutar `pnpm --filter @tuya-ui/components build` para regenerar `registry.json` y confirmar que ambos componentes extraen props, peso y código fuente correctamente. 36 componentes; `file-input: 1 exported component(s), 8 own prop(s)`, `file-uploader: 1 exported component(s), 9 own prop(s)`.

## 4. Documentación

- [x] 4.1 Crear `apps/docs/src/content/file-input.tsx` y `apps/docs/src/content/file-uploader.tsx` (uso, anatomía, accesibilidad), incluyendo la guía de que el arrastre es una comodidad sobre un control ya operable por teclado, no un camino aparte. Ninguno de los dos es overlay ni posición fija, así que las figuras de anatomía usan el componente real (con un `File` construido en el momento para forzar el estado), no una réplica estática.
- [x] 4.2 Crear ejemplos en vivo en `apps/docs/src/examples/file-input/*.tsx`: selección/quitar interactivo, y un segundo ejemplo con `error` ya seteado.
- [x] 4.3 Crear ejemplos en vivo en `apps/docs/src/examples/file-uploader/*.tsx`: una simulación de subida con progreso que avanza de verdad en el tiempo (intervalos reales, no instantáneo) para ejercitar los tres estados por archivo — los archivos en posición impar terminan en error, de forma determinística, sin depender de qué archivos elija quien prueba el ejemplo.
- [x] 4.4 Registrar `fileInputContent`/`fileUploaderContent` en `apps/docs/src/content/index.ts` con las claves `"file-input"` y `"file-uploader"`.

## 5. Cierre

- [x] 5.1 Levantar el sitio de docs y verificar por teclado, sin arrastrar nada: Tab hasta la zona, Enter o Espacio abren el selector nativo, el archivo elegido aparece igual que si se hubiera soltado. Verificado por CDP: Tab alcanza el `<input type="file">` real, y asignarle un archivo (`DOM.setFileInputFiles`, el equivalente de elegirlo por el selector nativo) actualiza FileInput exactamente igual que soltarlo — mismo camino de código, `handleChange`.
- [x] 5.2 Verificar el arrastre: soltar un archivo sobre FileInput lo selecciona; soltar varios conserva solo el primero; soltar varios sobre FileUploader los agrega todos. **Bug real encontrado y corregido acá:** el borde no cambiaba de color al arrastrar. La causa no era el manejo de arrastre (que sí disparaba correctamente `setDragActive(true)`, confirmado con un listener nativo) sino la misma clase de bug de cascada CSS ya encontrada esta sesión en Switch — `border-neutral-default` (incondicional) y `border-brand-default`/`border-danger-default` (condicionales) quedaban **ambas** presentes en el DOM a la vez, y con igual especificidad ganaba la que Tailwind emite después en la hoja compilada, no la agregada más tarde en el className. Se corrigió haciendo las tres clases de color de borde mutuamente excluyentes en `file-input.tsx` y `file-uploader.tsx`. Reverificado con esperas reales entre el dispatch del evento y la lectura del estilo: el borde pasa de `#E3E3E6` a `#ED1C29` (`border-brand-default`) durante el arrastre y vuelve solo al soltar. Verificado también que soltar dos archivos sobre FileUploader agrega las dos filas, no solo la primera.
- [x] 5.3 Verificar visualmente los tres estados de una fila de FileUploader (progreso avanzando, éxito, error con mensaje) y que quitar una fila no afecta a las demás. Verificado con el ejemplo de simulación real: tras esperar a que el intervalo avance, ninguna fila queda en "uploading" — todas resuelven a éxito o error, con el archivo en posición impar mostrando su mensaje de error sin afectar la fila en éxito.
- [x] 5.4 Grep de valores hex/px sueltos en `file-input.tsx` y `file-uploader.tsx`. Sin coincidencias — ningún valor arbitrario en ninguno de los dos archivos.
- [x] 5.5 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en la raíz del monorepo y dejar los tres en verde.

**Hallazgo fuera de alcance, reportado y no corregido acá:** al verificar el patrón de clases mutuamente excluyentes, se encontró que `packages/components/src/input.tsx` — ya archivado, no tocado por este change — tiene el mismo bug: su estado `error` agrega `border-danger-default` sobre el `border-neutral-default` incondicional, y el borde nunca se pone rojo en la práctica (confirmado midiendo `getComputedStyle` en la propia página de documentación de Input). Como `Input` no forma parte de este change, no se modificó; queda anotado para un change aparte.
