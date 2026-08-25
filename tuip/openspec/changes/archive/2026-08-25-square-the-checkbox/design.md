## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **Las dos cajas miden lo mismo.** Checkbox y RadioGroup son `h-4 w-4` (16 px). El radio del checkbox es `rounded-control`, que vale 8 px; el del radio es `rounded-pill`. Ocho sobre dieciséis es media cara: geométricamente, las dos formas son la misma circunferencia.
- **La marca interior es lo único que las separa hoy**: un tilde contra un punto, y sólo cuando están seleccionadas. Sin marcar, son indistinguibles.
- **El token no está roto.** `control: 8px` es correcto para botones y campos de 32 px o más.
- `component-library` no tiene deltas pendientes.

## Goals / Non-Goals

**Goals:**

- Que la forma diga cuántas opciones admite el control, antes de leer nada.
- Que la distinción quede escrita como regla y no dependa de qué token le tocó a cada componente.

**Non-Goals:**

- Cambiar el valor de `control`, que serviría bien a lo que fue pensado y rompería los controles grandes.
- Tocar RadioGroup, que ya es redondo, ni Switch, que tiene su propia forma.
- Revisar cada control chico del catálogo; el requisito deja escrito el criterio para el próximo.

## Decisions

- **El Checkbox lleva su propio radio, no el de los controles grandes.** El error no fue elegir mal el valor: fue asumir que un radio fijo escala. A 32 px, 8 px es una esquina; a 16 px, es un círculo. Alternativa considerada: bajar `control` a un valor que funcione en las dos escalas — se descartó porque achata el redondeo de botones y campos para arreglar un caso de 16 px.
- **La regla se escribe como forma, no como número.** El requisito dice "cuadrado, con un redondeo que se lea como esquina", y no un valor en píxeles: si mañana el tamaño del control cambia, la regla sigue diciendo lo correcto y el número se recalcula. Un requisito que fija el píxel se rompe con el primer rediseño y nadie se entera.
- **RadioGroup también gana su frase.** No cambia nada de su implementación, pero deja escrito que su forma es la contraparte. Sin eso, la regla del checkbox queda como una preferencia sobre un componente en vez de como el par que en realidad es.
- **Un escenario compara los dos sin marcar.** Es el caso que falla hoy y el que ninguna prueba miraba: marcados se distinguen por el tilde, y por eso el defecto sobrevivió.

## Risks / Trade-offs

- **[Toda casilla del catálogo cambia de aspecto]** → Es el objetivo, no un efecto colateral: hoy todas dicen lo que no es. No cambia ninguna prop, así que ningún consumidor toca código; lo único que hay que hacer es reinstalar y mirar.
- **[El mismo error puede repetirse]** → Cualquier control chico que tome `rounded-control` va a volver a redondearse de más. El requisito lo advierte, pero lo que de verdad lo impediría es que el radio dependa del tamaño. Queda anotado; no es este change.
- **[Una prueba de forma es frágil]** → Afirmar una clase de CSS ata la prueba a la implementación. Lo que la hace válida es qué afirma: que las formas de Checkbox y RadioGroup **difieran**, no cuál es cada una. Esa comparación sobrevive a un cambio de valor y falla exactamente cuando vuelven a coincidir.

## Migration Plan

1. El Checkbox pasa a cuadrado, con su propio redondeo.
2. Prueba que compara las dos formas sin marcar.
3. Publicar y reinstalar en la aplicación.
4. Mirar el drawer de asignar personas: trece casillas que ahora dicen que se pueden elegir varias.

Rollback: volver el radio. Ningún consumidor cambia código.

## Open Questions

- Si el redondeo del Checkbox debería salir de un token nuevo del sistema o quedarse como valor del componente. Se puede responder al implementarlo sin cambiar el requisito, que fija la forma y no el origen del número.
