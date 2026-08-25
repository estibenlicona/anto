## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- `backgroundColor`, `textColor`, `borderColor`, `fill`, `stroke` y `ringColor` son, en el theme por defecto de Tailwind, funciones que resuelven a `theme('colors')`. Confirmado contra el paquete instalado (`tailwindcss@3.4.19` en `packages/components`): las seis son `function`, no objetos. Extenderlas bajo `theme.extend` conserva esa función default —con toda la paleta nativa adentro— y le agrega los tokens de tuip encima; nunca la reemplaza.
- El preset ya resolvió el mismo problema para `fontSize`, a nivel raíz de `theme` en vez de `extend`. Es el precedente a seguir, no un patrón nuevo.
- `packages/components/src` y `apps/docs/src` no usan ningún color de la paleta nativa de Tailwind — verificado por búsqueda exhaustiva de los 22 nombres de familia de color que trae Tailwind por defecto. Tampoco hay colisión de nombre entre el rol `neutral` de tuip y la escala numérica `neutral-50…950` nativa: nada en el catálogo escribe `bg-neutral-500` con esa intención.
- `frontend` tampoco usa ningún color nativo, verificado con la misma búsqueda. Este cambio no le afecta hasta que registre el preset (el change siguiente).
- `transparent` y `current` se usan 25 veces en el catálogo real, Button entre ellos (el borde transparente que ocupa la caja de las variantes sólidas, agregado en un cambio reciente). `white`/`black` se usan sólo 2 veces, y las dos en `apps/docs`, no en `packages/components`.

## Goals / Non-Goals

**Goals:**

- Que un color fuera del vocabulario de tuip no compile a ninguna regla, en cualquier proyecto que use el preset.
- Que los primitivos de CSS que el catálogo ya necesita —`transparent`, `current`— sigan disponibles.
- No romper ningún componente existente.

**Non-Goals:**

- Agregar tokens de color nuevos. Este cambio es sobre qué se expone, no sobre qué existe.
- Tocar `frontend`. Es un cambio aparte, que depende de este.
- Resolver el modificador de opacidad (`bg-x/40`) sobre tokens de tuip. Es un problema distinto, ya conocido y documentado en otros componentes (navbar, por ejemplo), y no lo agrava ni lo resuelve cerrar la paleta.

## Decisions

- **Se reemplaza cada clave por separado (`backgroundColor`, `textColor`, `borderColor`, `fill`, `stroke`, `colors`), no una sola vez a través de `colors`.** El preset ya separa por propiedad para que `bg-neutral-default` no tenga que escribirse `bg-bg-neutral-default` — reemplazar sólo `colors` y dejar las demás bajo `extend` volvería a abrir `backgroundColor`/`textColor`/`borderColor` a la paleta nativa, porque cada una tiene su propia función default independiente de `colors`. Cerrar de verdad exige tocar las seis.

- **`transparent` y `current` se preservan explícitamente en cada objeto de reemplazo, no se dejan como huecos que Tailwind rellena solo.** Al reemplazar el theme por completo, Tailwind deja de aportarlos por defecto — hay que declararlos a mano en el mismo objeto que ya arma `propertyVars`. Se tratan como parte del vocabulario del sistema, no como una excepción a documentar aparte: son valores de CSS, no colores que compitan con la paleta de marca.

- **`white` y `black` no se preservan.** A diferencia de `transparent`/`current`, sí son parte de una paleta de color —la de Tailwind, no la de tuip— y preservarlos dejaría una grieta pequeña pero real en el cierre: dos nombres de color ajenos al sistema, disponibles porque a alguien le convino en su momento. Con sólo dos usos, y ninguno en el catálogo publicado, migrarlos es más barato que mantener la excepción.

- **Los dos usos de `apps/docs` se migran al vocabulario ya existente, no a un valor nuevo.** El overlay de `SearchDialog` pasa a `bg-neutral-bold/40`, el mismo patrón que ya usan Modal, Drawer y CommandPalette para su fondo oscuro — consistencia con lo que el catálogo ya hace en vez de una solución aparte para docs.

- **El borde de `ComponentChips` pasa a `currentColor` al 25%, no a `border-neutral-soft` como se planeó inicialmente.** `ComponentChips` vive sobre `bg-neutral-inverse`, una superficie que siempre es la opuesta al tema activo de la página (oscura en modo claro, clara en modo oscuro — confirmado en `semantic-colors.ts`: `background.neutral.inverse` es `neutral[900]` en claro y `neutral[0]` en oscuro). `border.neutral.soft`, en cambio, asume una superficie que sigue el tema normalmente: su propio valor por modo (`alpha(neutral[500], 0.18)` en claro, `alpha(neutral[0], 0.14)` en oscuro) da la polaridad equivocada sobre una superficie invertida — casi invisible en ambos modos. `currentColor` no tiene ese problema porque hereda el color que ya usa el texto del botón (`text-neutral-inverse`), que se invierte junto con el fondo por diseño y por lo tanto siempre contrasta contra él. Mismo principio que usa `Navbar` (`packages/components/src/navbar.tsx:354`) para su propio caso de superficie fija, aplicado sin agregar un token nuevo.

- **La opacidad del 25% se expresa como valor arbitrario (`color-mix(...)`), no como el modificador `/25`.** Verificado directamente en el CSS generado y en el navegador: ningún color de este preset —tokens ni primitivos— tiene una variante `/N` compilada; `.border-current` sólo existe a opacidad completa. Tailwind sólo puede derivar la variante de opacidad de un color cuando su valor es una función parametrizable con un canal alfa, y ni un `var(--color-...)` plano ni la palabra clave `currentColor` califican. Esto es el mismo problema, ya documentado como no-goal de este cambio, que impide `bg-x/40` sobre los tokens de tuip en otros componentes — no se resuelve en general acá, sólo se evita para este caso puntual con un valor arbitrario que no pasa por el mecanismo de modificador.

## Risks / Trade-offs

- [Un plugin de Tailwind o una utilidad no auditada podría depender de `theme('colors')` completo] → Se revisó cada namespace que Tailwind deriva de `colors` por defecto (`ringColor`, `divideColor`, `outlineColor` incluidos) y ninguno tiene una configuración propia en el preset que los saque de ese default — así que heredan el cierre automáticamente en cuanto `colors` se reemplaza en la raíz, sin necesidad de tocarlos uno por uno. Si aparece un namespace que sí tenía su propio override en algún lado no revisado, se manifiesta como una clase que deja de compilar, no como un error silencioso.
- [El cierre es más estricto de lo que un consumidor externo del paquete podría esperar] → Es exactamente el punto: alguien que instale `@tuya-ui/tokens` y use el preset está adoptando el vocabulario de tuip, no un Tailwind genérico con extras. Si necesita un color que el sistema no tiene, el camino es proponerlo como token, no que el preset se lo permita por descuido.
- [Migrar `apps/docs` toca su render visual, aunque sea un detalle menor] → Los dos casos son un overlay y un borde decorativo, ninguno documentado como comportamiento del catálogo. El riesgo es cosmético y acotado a dos componentes de la app de documentación, no del paquete publicado.
