## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El valor de hoy no es arbitrario.** `sky: #0A8FD0` es el celeste de la referencia (`#93C5FD`, 1,8:1) bajado hasta pasar 3:1. Su margen actual es de **0,27** sobre la fila seleccionada (3,27:1): es el matiz más ajustado de los cuatro, y no hay hacia dónde aclararlo sin cruzar el piso.
- **`verify-tokens.ts` falla el build** cuando un paso baja del piso, y comprueba cuatro combinaciones por tema. Es lo que impide aclarar `sky` sin tocar antes la regla.
- **Quién consume la escala.** `LevelMeter` tiñe los segmentos llenos; el vacío se dibuja `bg-neutral-default` con aro `border-neutral-bold`. La cuenta de llenos se lee por el aro, no por el matiz.
- El requisito vive en `openspec/specs` **y** en `retune-accent-scale` sin archivar; el delta parte del pendiente.

## Goals / Non-Goals

**Goals:**

- Que el primer paso de la progresión se lea como el más leve.
- Que la excepción quede escrita, acotada y **verificada**, no como un control apagado.

**Non-Goals:**

- Rebajar el piso de los otros tres matices.
- Convertir esto en una política general: no se abre la puerta a que cualquier token invoque "es redundante" para saltarse el contraste.

## Decisions

- **La excepción se justifica por la función, no por el gusto.** El piso de 3:1 protege un elemento gráfico *del que depende entender el contenido*. En un medidor de nivel el contenido es la cuenta de segmentos llenos, y el segmento vacío ya se distingue por su aro. Ahí el matiz es codificación redundante. Ésa es la razón que la spec escribe — y es también su límite: donde el color **sí** sea lo único que distingue, el piso vuelve a aplicar y la pieza tiene que resolverlo.
- **El piso no desaparece, se reemplaza.** `sky` pasa a comprobarse contra el segmento vacío. Alternativa considerada: sacar `sky` de `verify-tokens.ts`. Se descartó porque es exactamente la forma en que estas paletas se reabren: nadie mira un valor que ninguna comprobación toca, y el siguiente que lo edite no va a encontrar nada que lo detenga.
- **Un escenario afirma la lectura, no sólo el número.** "`sky` pesa visiblemente menos que `blue`" no se comprueba con un ratio; se comprueba mirando. Está escrito igual porque es el motivo del change: sin él, alguien podría cumplir todos los ratios nuevos y dejar el color donde estaba.
- **El escenario viejo se acota en vez de renombrarse.** *El tercer matiz supera el piso de contraste* pasa a hablar de los otros tres. El validador rechaza renombrar un escenario dentro de un bloque MODIFIED, así que el nombre queda —ya era confuso antes— y el cuerpo dice la verdad nueva.

## Risks / Trade-offs

- **[`sky` queda por debajo de 3:1 contra la superficie clara]** → Es la consecuencia asumida y declarada, no un descuido. Queda acotada a un matiz, con el motivo escrito en el requisito y en la definición del token, y con un piso de reemplazo que se verifica. Lo que la mitiga de verdad es que el nivel se lee por la cuenta de segmentos: si mañana una pieza usa `sky` como único portador de una distinción, el requisito le exige resolver el contraste ella.
- **[La excepción se cita como precedente]** → El requisito la ata a una condición comprobable —que el significado lo cargue otra cosa— en vez de a un nombre de token. Sin esa condición, no hay excepción que invocar.
- **[Aclarar de más y perder la lectura de "lleno"]** → Un `sky` demasiado pálido haría que un segmento lleno se lea como menos que uno vacío, que tiene aro. Por eso el piso nuevo es contra el segmento vacío y no contra la nada.
- **[El tema oscuro]** → `sky` oscuro (`#38BDF8`) da 8,34:1 y no es el que molesta. Este change no lo toca; si se lo tocara, volvería a caer bajo la regla general.

## Migration Plan

1. Cambiar la regla en `verify-tokens.ts`: `sky` deja de medirse contra las superficies y pasa a medirse contra el segmento vacío. Antes de mover el valor, para que el build proteja el paso siguiente.
2. Aclarar el valor claro de `sky` y reescribir el comentario que hoy explica por qué estaba oscurecido.
3. Publicar y reinstalar en la aplicación consumidora; mirar el medidor de seniority y confirmar que Principiante se lee más leve y que sigue distinguiéndose de un segmento vacío.

Rollback: volver el valor y la regla. Ningún consumidor cambia código, así que revertir es publicar de nuevo.

## Open Questions

- El valor exacto. La spec fija el piso y la lectura; cuál es el hex que los cumple se resuelve al medirlo, sin cambiar el requisito.
