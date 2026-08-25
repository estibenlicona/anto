## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **La card vive en `PeopleStatsCards.tsx`** y todo lo que la referencia muestra sale de datos que ya llegan: `bySeniority` (`{seniority, label, count}[]`) y `activeCount`. No hay pedido nuevo al backend.
- **La app no compila Tailwind.** Su CSS es el compilado de `tuip`; una clase que no exista allá no genera regla acá. Las clases de relleno de acento existen (`bg-accent-<matiz>-fill`, escritas literales en `LevelMeter` y `SegmentedBar`), igual que las utilidades de layout y tipografía que la feature ya usa. Los anchos proporcionales van por estilo inline, como ya hace `SegmentedBar` — un ancho calculado no puede ser clase.
- **La referencia fija los colores**: muestreados píxel a píxel, son la escala de acento con el turquesa original. `restore-accent-teal` (tuip) restaura el matiz; este change no decide ningún color.
- **El `.tgz` nuevo rompe `gold`**: `tone="gold"` deja de tipar y `bg-accent-gold-fill` deja de existir. La card actual usa ambos.

## Goals / Non-Goals

**Goals:**

- Que la card cuente lo que la referencia cuenta: distribución comparable por nivel más las dos lecturas de negocio, con un solo código de color en la pantalla.
- Que la app siga sin decidir colores de nivel: clases de acento del paquete, mapeo por posición en la escala.

**Non-Goals:**

- No se generaliza el gráfico de barras por categoría como componente del sistema: un consumidor no amerita API pública en `tuip`. La decisión inversa (extraerlo) queda para cuando exista el segundo consumidor, igual que se decidió con `RadioGroup` en su momento.
- No se anima la barra ni se agrega interacción (tooltips, clic para filtrar): la referencia es estática y el pedido también.
- No se tocan las otras dos cards ni la grilla que las contiene.

## Decisions

- **Composición local, no `SegmentedBar`.** `SegmentedBar` representa partes de un todo en una sola pista; la referencia es un gráfico de barras por categoría contra un eje común — cuatro pistas, cada una con su relleno proporcional a su conteo sobre el máximo del eje. Forzar la primera pieza a hacer lo segundo sería doblar su contrato recién especificado. La fila se compone con un track (`bg-neutral-subtle`, `rounded-pill`) y un relleno (`bg-accent-<matiz>-fill`) con ancho inline `(count / axisMax) * 100%`. La rama `tone` de `SegmentedBar` queda sin consumidor en la app tras este change, y se queda igual en `tuip`: es vocabulario publicado y documentado, y quitarlo sería churn.

- **El máximo del eje es el mayor conteo redondeado hacia arriba al par siguiente** (7 → 8, como la referencia; 8 → 8). Regla simple: `Math.ceil(max / 2) * 2`, con mínimo 4 para que un chapter chico no dibuje un eje de 0 a 0. Las marcas son 5, de 0 al máximo en cuartos — con un máximo par, los cuartos pueden ser fraccionarios (p. ej. eje 6 → marcas 0, 1.5, 3…), así que las marcas se calculan como enteros sólo cuando dividen exacto y si no se reducen a 0, mitad y máximo. Alternativa considerada: eje fijo 0–8. Se descarta: un chapter de 30 personas lo desbordaría.

- **Los descriptores por nivel viven en la card, junto al mapeo de tonos**, indexados por `seniority` (1–4): "con acompañamiento", "autónomo", "resuelve y guía", "referencia técnica" — los de la referencia. Alternativa considerada: agregarlos al catálogo HTTP o a `seniorityLevels` de `tuip`. Se descarta por ahora: son lectura de negocio de esta pantalla, el backend mockeado no los conoce, y `tuip` no define contenido de negocio. Si mañana otra pantalla los necesita, suben al catálogo — está anotado en el comentario de la constante.

- **Las dos lecturas del pie se calculan de `bySeniority`, no llegan del backend**: avanzado-o-superior = (conteo de niveles 3 y 4) / total, redondeado como los porcentajes de fila; acompañamiento = conteo del nivel 1. La ligadura "Principiante ⇒ requiere acompañamiento" es la misma que su descriptor anuncia, y el spec la fija para que el pie y la fila no puedan contarse historias distintas.

- **Los porcentajes de fila redondean a entero** (`Math.round`), como la referencia (11/28/39/22 sobre 18). Pueden no sumar 100 — es una propiedad conocida del redondeo y la referencia misma suma 100 por casualidad; no se compensa, porque compensar miente en alguna fila para que la suma quede bonita.

- **El rename `gold` → `teal` y la reinstalación son la primera tarea, juntos.** Cualquier orden que los separe deja el typecheck roto en el medio; el apply los hace en un solo paso.

## Risks / Trade-offs

- **[La card crece en alto: cuatro filas con descriptor, eje y pie ocupan más que la barra única con leyenda 2×2]** → Es el costo del contenido nuevo que la referencia pide. La grilla del resumen ya deja crecer cada card de forma independiente; se verifica en pantalla que las tres cards no queden desparejas de forma incómoda.
- **[Utilidades de layout que la referencia necesita podrían no existir en el CSS compilado del paquete]** → Mitigación en dos capas: las medidas calculadas van inline (anchos, posiciones de marcas del eje), y las clases usadas se limitan al repertorio que la feature ya ejercita (`flex`, `gap-*`, `text-*`, `rounded-pill`, `bg-neutral-subtle`, `bg-accent-*-fill`). La tarea de verificación en pantalla incluye mirar que ningún estilo haya caído en el vacío.
- **[jsdom no maqueta: las pruebas no pueden medir que las barras "se vean" proporcionales]** → Se prueba lo que sí es observable en el DOM: el estilo inline de ancho con el porcentaje esperado, las clases de acento por nivel, los textos de porcentaje, conteo, descriptores y las dos lecturas del pie. La proporción visual es revisión en pantalla.
- **[El descriptor "con acompañamiento" y la lectura del pie fijan una interpretación de negocio (Principiante ⇒ acompañamiento) que el catálogo no declara]** → Es lo que la referencia dice, y queda en el spec como contrato explícito. Si el negocio redefine qué niveles requieren acompañamiento, el cambio es de spec, no un ajuste silencioso.

## Migration Plan

1. `tuip` publica `restore-accent-teal`.
2. La app reinstala **y** renombra `gold` → `teal` en la card, en el mismo paso.
3. Se reescribe la tercera card con el layout de la referencia; pruebas nuevas.
4. Revisión en pantalla contra la imagen de referencia.

Rollback: revertir `PeopleStatsCards.tsx` a la versión de la barra única (los datos no cambian) y, si también se revierte el matiz, reinstalar el `.tgz` anterior.
