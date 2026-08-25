## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El sistema ya tiene tres vocabularios de color**: el semántico (roles de estado, un paso por rol), el de identidad (avatares) y el de acento (cuatro matices ordinales que declaran explícitamente no decir nada sobre el estado). La escala nueva no cabe en ninguno: gradúa un estado que ya se afirmó.
- **`severityFor` ya existe** en componentes, y resuelve un porcentaje a uno de tres roles semánticos. Es una función de clasificación, no una rampa de color: sus tres salidas son `success`, `warning` y `danger` en su paso `bold`, sin nada intermedio.
- **`Popover` está construido sobre `@radix-ui/react-popover`**, que ya trae `Anchor` — sólo falta exponerlo, como el sistema ya hizo con las partes atómicas de Select, Combobox y los demás compuestos.
- **La marca de umbral ya está implementada en la app**, en `PlanSkillMeter`, con un comentario explicando que hubo que envolver el medidor porque `cn` no deduplica utilidades. Ese comentario es la señal de que la pieza pertenece al componente.
- La app compila Tailwind pero los tokens llegan como clases ya generadas del paquete: una clase nueva sólo existe si el build del paquete la emite.

## Goals / Non-Goals

**Goals:**

- Que una escala de alerta graduada sea del sistema y no de una pantalla, para que dos mapas de calor de dos pantallas distintas no inventen dos rampas.
- Que la marca de lo que se exige viaje con el medidor, en vez de reconstruirse en cada consumidor.
- Que un detalle al hacer clic no obligue a montar un componente por celda.

**Non-Goals:**

- Un componente de celda de mapa de calor: la celda combina nivel, exigencia y brecha, que son dominio de la app.
- Tocar la escala de acento o los roles de estado.
- Un modo "cuánto se supera" en el medidor: la marca dice qué se espera, no qué sobra.

## Decisions

- **La escala se llama atención y no severidad, riesgo ni calor.** "Severidad" ya está tomado por `severityFor`, con otro significado; "riesgo" afirma una consecuencia que el sistema no conoce; "calor" nombra la técnica de visualización y no lo que el color dice. Atención nombra exactamente lo que gradúa: cuánto conviene mirar esto.
- **Tres pasos y ninguno para "sin atención".** Un cuarto paso neutro dentro de la escala invitaría a pintar todo, y una escala donde todo lleva color deja de señalar. Lo que está en orden usa la familia neutra, y la spec lo dice en vez de dejarlo a criterio de cada pantalla.
- **El paso alto ES `danger.bold`, no un valor parecido.** Si el escalón más grave de un mapa y una alerta del sistema no fueran el mismo rojo, el sistema estaría diciendo dos cosas con dos rojos. Los pasos `low` y `medium` se derivan aclarando `warning.bold` y `danger.bold` — derivar del sistema, no inventar al lado.
- **Los tres pasos se verifican como superficie.** Los pasos de acento se verifican como elemento gráfico sobre una superficie; estos son la superficie, y encima puede ir texto. Es una segunda dirección de verificación, no una excepción: por eso el requisito de contraste se amplía en vez de esquivarse.
- **La marca de umbral se dibuja en el límite del paso, no centrada en él.** "Pide Avanzado" significa "hasta el final de Avanzado", y una marca centrada en el tercer segmento se lee como "en algún punto del tercero". Alternativa considerada: teñir de otro modo los segmentos que faltan. Se descarta: cambia el significado del relleno, que hoy dice sólo dónde está la persona.
- **El ancla se expone como parte atómica, no como una prop del Popover.** Es la misma decisión que el sistema ya tomó con Select y Combobox: quien necesita una disposición que el componente de nivel superior no contempla, recompone con las partes. Una prop `anchorRef` sería una segunda forma de hacer lo mismo.
- **El relleno del contenido pasa a ser un valor por defecto reemplazable, no se elimina.** Quitarlo obligaría a todos los consumidores actuales a declararlo; dejarlo fijo impide el encabezado a sangre. El valor por defecto se conserva y el consumidor puede reemplazarlo.

## Risks / Trade-offs

- **[Una cuarta familia de color puede diluir la disciplina del sistema]** → Por eso la spec la delimita en las dos direcciones: no reemplaza al acento y no reemplaza a un rol de estado, con un escenario por cada frontera. La documentación tiene que decir cuándo NO usarla.
- **[Los pasos derivados quedan sin un origen verificable si alguien cambia `danger.bold`]** → Se derivan en código desde los primitivos, no se escriben a mano como hex sueltos, así que un cambio en la familia arrastra la escala.
- **[El ancla abre la puerta a popovers que se abren sin gesto del usuario]** → El componente no cambia quién decide: sigue siendo el consumidor. Lo que cambia es de qué se cuelga la superficie.
- **[La app tiene que reinstalar el paquete antes de usar nada de esto]** → Es el mismo flujo de siempre, y ya mordió una vez: el dev server sirve el paquete anterior si el puerto no cambia. Queda anotado en las tareas.

## Migration Plan

1. Escala de atención en tokens, derivada de los roles de estado, con su verificación de contraste como superficie.
2. `LevelMeter` con la posición esperada y su marca, más lo que anuncia a tecnologías de asistencia.
3. `PopoverAnchor` como parte atómica y el relleno del contenido reemplazable.
4. Docs de los tres, con la frontera de la escala dicha explícitamente.
5. Changeset, build, pack y reinstalación en la app.

Rollback: los tres agregados son aditivos y opcionales; quitarlos deja el paquete como está hoy.
