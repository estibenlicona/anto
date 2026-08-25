## 1. Dependencias

- [x] 1.1 Agregar `@radix-ui/react-switch` a `packages/components/package.json`
- [x] 1.2 Verificar que el monorepo instala y compila con la dependencia nueva

## 2. Componente Checkbox

- [x] 2.1 Construir `Checkbox` sobre `<input type="checkbox">`, estilado con tokens, con label asociada
- [x] 2.2 Estado indeterminado, fijado vía ref sobre la propiedad DOM `indeterminate`
- [x] 2.3 Estado deshabilitado
- [x] 2.4 Verificar con teclado: foco visible, Espacio alterna marcado/desmarcado, el estado indeterminado se anuncia a tecnologías de asistencia
- [x] 2.5 Declarar props públicas con tipos explícitos y descripciones

## 3. Componente RadioGroup

- [x] 3.1 Construir `RadioGroup` sobre `<input type="radio">` compartiendo `name`, recibiendo `options: RadioOption[]`
- [x] 3.2 Estado deshabilitado por grupo y por opción individual
- [x] 3.3 Verificar con teclado: flechas mueven foco y selección juntos dentro del grupo, sin depender de Tab entre opciones
- [x] 3.4 Declarar props públicas con tipos explícitos y descripciones

## 4. Componente Switch

- [x] 4.1 Construir `Switch` sobre `@radix-ui/react-switch`, estilado con tokens
- [x] 4.2 Estado deshabilitado
- [x] 4.3 Verificar con teclado: foco visible, Espacio y Enter alternan, `role="switch"` y `aria-checked` presentes
- [x] 4.4 Declarar props públicas con tipos explícitos y descripciones

## 5. Registro

- [x] 5.1 Añadir las entradas `checkbox`, `radio-group` y `switch` a `definitions.ts`, categoría `forms`, `status: "stable"`, con `npmDependencies` declaradas para Switch
- [x] 5.2 Regenerar `registry.json` y confirmar que el peso, la tabla de props y el código fuente mostrados en el sitio son correctos para los tres

## 6. Documentación del componente

- [x] 6.1 Escribir `content/checkbox.tsx`: guía de uso con la referencia cruzada a Switch; anatomía con sus tres estados; notas de accesibilidad
- [x] 6.2 Escribir `content/radio-group.tsx`: guía de uso; anatomía; notas de accesibilidad
- [x] 6.3 Escribir `content/switch.tsx`: guía de uso con la referencia cruzada a Checkbox; anatomía; notas de accesibilidad
- [x] 6.4 Escribir los ejemplos en vivo de `examples/checkbox/*.tsx`: básico, indeterminado, deshabilitado
- [x] 6.5 Escribir los ejemplos en vivo de `examples/radio-group/*.tsx`: básico, con opción deshabilitada
- [x] 6.6 Escribir los ejemplos en vivo de `examples/switch/*.tsx`: básico, deshabilitado
- [x] 6.7 Registrar los tres módulos de contenido en `content/index.ts`

## 7. Cierre

- [x] 7.1 Recorrer los escenarios de `specs/component-library/spec.md` en el sitio corriendo y confirmar que se cumplen
- [x] 7.2 Verificar con teclado el ciclo completo de los tres componentes en el sitio corriendo
- [x] 7.3 Confirmar que ningún estilo de los tres usa un valor fuera de los tokens del sistema
- [x] 7.4 Ejecutar `pnpm lint`, `pnpm test` y `pnpm build` en el monorepo y dejar los tres en verde

## 8. Revisión de color: estado apagado de Switch

- [x] 8.1 Agregar los tokens de componente `trackOff` (`brand.100`) y `thumbOff` (`brand.700`) al paquete de tokens
- [x] 8.2 Aplicar `trackOff`/`thumbOff` al estado apagado de `switch.tsx`, sin tocar el estado encendido
- [x] 8.3 Verificar en el sitio corriendo que el contraste del thumb apagado sobre el track apagado sigue siendo legible
- [x] 8.4 Confirmar que ningún estilo de Switch usa un valor fuera de los tokens del sistema tras el cambio
