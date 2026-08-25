# Definición de Terminado — HU TUIP-214

Revisión punto por punto de la DoD de la historia contra lo que quedó implementado en este change, después de la revisión visual que quitó el fondo, el borde y el color de la etiqueta.

| # | Punto de la DoD | Estado | Dónde |
| --- | --- | --- | --- |
| 1 | Componente instalable y visible en el inventario | ✅ | `SeniorityCard` y `LevelMeter` se exportan desde `@tuya-ui/components` y están declarados en `registry/definitions.ts` con su estado `beta` y sus dependencias. Aparecen en `dist/registry.json`, en el catálogo del sitio, en la búsqueda y en la Skill generada. Reinterpretado del `tuip add` / `tuip list` de la HU, que ya no existen — ver `proposal.md`, sección Distribución. |
| 2 | Los dos matices nuevos publicados en Fundamentos con sus tres pasos y contrastes medidos | ⚠️ Parcial | Los cuatro matices están publicados con su contraste medido, pero con **un paso de los tres**. Ver "Desviaciones" abajo. |
| 3 | Card base extendida con `tone` y `density`, sin romper sus usos actuales | ⛔ Fuera de alcance | La pieza dejó de tener superficie, así que las dos props se quedaron sin consumidor. `card.tsx` no cambia. Ver "Desviaciones". |
| 4 | `level-meter` publicado como pieza independiente y documentado | ✅ | `packages/components/src/level-meter.tsx`, con `steps` (4 por defecto), su ficha propia y dos ejemplos. La documentación incluye un requisito que distingue cuándo es `LevelMeter` y cuándo `SegmentedBar`. |
| 5 | Ficha con pestañas Uso, Anatomía, API y Accesibilidad | ✅ (falta la pasada visual) | `apps/docs/src/content/seniority-card.tsx` y `level-meter.tsx`. Las cuatro pestañas tienen contenido y la tabla de props se genera desde los tipos. La revisión visual en el sitio queda pendiente — tareas 8.7 y 10.4.9. |
| 6 | Pruebas automatizadas de dimensión fija, escala cerrada y contraste AA | ✅ | Dimensión y escala: 36 pruebas en `src/seniority-card.test.tsx` y `src/level-meter.test.tsx`. Contraste: 20 chequeos en `verify-tokens.ts`, cada matiz contra las cuatro superficies del sistema. Los tres fallan el build. |
| 7 | Listado de personas y drawer migrados | ⛔ Fuera de alcance de este change | Vive en el repo de la app. Tras la revisión visual quedó reducido al listado: el drawer conserva su `Select`. Va en `adopt-seniority-card-in-people`. |

## Criterios de aceptación

| CA | Estado | Nota |
| --- | --- | --- |
| CA1 Dimensión fija | ✅ | 116×44 / 116×36, con la medida del token como medida final de la pieza. Probado en los cuatro niveles y en el estado vacío. |
| CA2 Escala cerrada de cuatro | ✅ | Unión cerrada por nombre; cualquier otro valor —incluido `null`— cae en el estado vacío documentado (`Sin nivel`, cuatro segmentos vacíos, misma dimensión). |
| CA3 Cuatro segmentos proporcionales | ✅ | `gap-hug` (= `space.hug`, 4px). Llenos con el `fill` del matiz; vacíos con aro `border-neutral-bold`, que en tema claro es `#74747E` — exactamente el `ink.500` que nombra la HU. |
| CA4 Un tono por nivel | ⚠️ Parcial | La progresión gris → azul → turquesa → morado está, y se lee como avance. Pero tiñe **sólo los segmentos**: el fondo y el borde ya no existen, y la etiqueta va en texto neutro. La HU pedía los cuatro elementos teñidos. |
| CA5 Nunca solo color | ✅ | La etiqueta acompaña siempre; con `hideLabel`, el nivel viaja en `aria-label` y en `title`. |
| CA6 Contraste AA verificado | ✅ | Segmentos: 3.08–5.29:1 según matiz y superficie. Aro del vacío: 4.21–6.88:1. Medidos contra las cuatro superficies del sistema, no contra una. La etiqueta usa el token de texto neutro, ya verificado. Todo en la prueba automatizada. |
| CA7 Estado seleccionado sin rojo | ⛔ No implementado | Sin consumidor y sin caja donde apoyar el aro. Ver "Desviaciones". |
| CA8 Instalable por CLI | ✅ reinterpretado | El CLI `tuip` no existe: fue reemplazado por el paquete publicado. Se cumple por exportación + manifiesto + changeset `MINOR`. |
| CA9 Cero hex literales | ✅ | Verificación automática (`scripts/verify-no-literal-colors.ts`) enganchada a `pnpm test`. Mira código, no comentarios. |

## Desviaciones conscientes respecto de la HU

Las tres primeras salen de la revisión visual del diseño construido, no de una limitación técnica. El razonamiento completo está en `design.md`, decisiones 1, 3, 4 y 6.

1. **La pieza no dibuja fondo, borde ni sombra** (afecta a CA4 y al punto 3 de la DoD). Deja de ser una superficie y pasa a ser un bloque de contenido. De ahí que no componga `Card`: esa pieza existe justamente para aportar los tres elementos que se retiraron. En consecuencia, **la extensión de `Card` con `tone` y `density` no se implementa** — sería API que el catálogo publica y nadie ejercita.
2. **La paleta de acento entrega un paso de los tres** (afecta al punto 2 de la DoD). `surface` se cayó con el fondo; `ink` se cayó cuando la etiqueta pasó a texto neutro. Queda `fill`. La regla aplicada es la que el resto del sistema ya sigue: un token entra cuando algo lo usa. Los valores descartados quedan registrados en el `proposal.md`.
3. **El estado seleccionado no se implementa** (CA7). El formulario no adopta la pieza y el listado no tiene selección de fila, así que no hay nada que dispare el estado; y sin caja, un doble aro no tendría dónde apoyarse.
4. **La regla de lint que prohíbe `accent.*` en componentes de estado no se implementó.** Es la mitigación que la HU propone para su riesgo Alto. No hay forma barata de decidir automáticamente qué componente "es de estado", y una lista mantenida a mano envejece peor que la documentación. Queda como control de revisión. Las otras tres capas de mitigación sí están: el nombre `accent.*`, el prefijo propio en la distribución y la advertencia explícita en Fundamentos.
5. **`space.tight` no existe en el sistema** y no se creó: el gap de 4px que pide CA3 es exactamente `space.hug`.

## Efectos secundarios buenos de la revisión

- **La paleta dejó de necesitar tema oscuro.** Antes los valores oscuros se derivaban por una regla escrita acá, porque la HU sólo traía los claros, y quedaban marcados como "no aprobados por diseño". Con un solo paso sin superficie propia, un valor por matiz sirve en ambos temas y esa deuda desaparece.
- **El contraste de los segmentos mejoró.** Sobre la fila blanca en vez de la superficie teñida: `slate` pasó de 3.08:1 a 3.38:1 y `teal` de 3.10:1 a 3.46:1.
- **El contraste de la etiqueta salió de la ecuación.** Con texto neutro es el token del sistema, ya verificado, en vez de cuatro colores que medir contra cada fondo.

## Deuda anterior que este change no toca

- El requisito `Tokens instalables en un proyecto consumidor` de la spec `design-tokens` y el README del monorepo siguen describiendo el flujo del CLI retirado.
- La paleta de identidad (`identity-colors.ts`) no tiene sección en la página de Fundamentos, a diferencia de la de acento.

## Un riesgo que conviene revisar más adelante

Con un solo paso por matiz, `accent` se parece bastante a `CategoricalColor`, el vocabulario de seis tonos que ya existe. Lo que lo distingue es que **tiene orden**: reordenarlo le cambia el tono a todos los niveles, mientras que reordenar el categórico no cambia nada. Esa diferencia justifica los dos vocabularios hoy, pero si `accent` no gana un segundo consumidor, vale preguntarse si no debería ser una variante ordenada del que ya existe.
