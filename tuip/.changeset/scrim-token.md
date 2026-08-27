---
"@tuya-ui/tokens": minor
"@tuya-ui/components": patch
---

Nuevo token `background.neutral.scrim` (`bg-neutral-scrim`, `--color-bg-neutral-scrim`): el velo detrás de una superficie bloqueante, **oscuro en los dos temas**.

Hasta ahora `Modal`, `Drawer` y `CommandPalette` pintaban el velo con `bg-neutral-bold/40`. En claro daba el gris oscuro esperado; en oscuro `bold` es casi blanco, así que el velo aclaraba la página que tenía que apagar. El trabajo del velo es empujar la página hacia atrás, y eso se hace con sombra sea cual sea el tema, por eso tiene token propio en vez de tomar prestado un paso pensado para superficies.

- Claro: `neutral.800` al 40% — el mismo tono que se veía hasta ahora, sin cambio visible.
- Oscuro: `neutral.1000` al 60% — más denso, porque sobre un lienzo ya casi negro un 40% apenas se nota.

Los tres componentes pasan a `bg-neutral-scrim`. Sin cambios de API.
