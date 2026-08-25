---
"@tuya-ui/tokens": minor
"@tuya-ui/components": minor
---

El tercer matiz de la escala de acento vuelve a ser turquesa.

- **`gold` (`#AD7A0B`) se reemplaza por `teal` (`#2E97A3`)** — el valor turquesa original, restaurado por referencia de diseño: la card de referencia entregada por el usuario usa exactamente ese hex (muestreado píxel a píxel). Sus contrastes ya estaban medidos y pasan el piso de 3:1 contra las cuatro superficies (fila clara 3.46, lienzo 3.32, fila seleccionada 3.15, fila oscura 5.17).
- **Cambio visual en cascada**: todo lo que consume la escala — "Avanzado" en seniority incluido — vuelve a verse turquesa con la sola actualización del paquete.
- **BREAKING para consumo directo del nombre**: `--color-accent-gold-fill`, `bg-accent-gold-fill` y `tone="gold"` dejan de existir; sus reemplazos son `--color-accent-teal-fill`, `bg-accent-teal-fill` y `tone="teal"`. El dorado existió una sola versión; quien lo consuma directo hace el rename inverso del que hizo al adoptarlo.
- Sin cambios de API en `LevelMeter`, `SeniorityCard` ni `SegmentedBar` (que conserva su vocabulario de acento con el miembro renombrado).
