## Context

Ver proposal.md — Why. Lo que condiciona el cómo:

- **El mapa de estados vive en un solo lugar**, `STATUS_VARIANTS` en `InitiativeAdapter`, con `Evaluating: "neutral"`, `Active: "success"`, `Closed: "neutral"`. Cambiarlo alcanza al listado y a la cabecera de la evaluación, que lo consumen los dos.
- **Los textos son cuatro y no tres**: el drawer tiene una variante para alta y otra para edición, y el estado vacío del listado repite la misma frase con otras palabras.
- **La verificación del registro ya existe** —`uiWriting.test.ts`, de esta misma tanda— y enumera 45 formas a mano. Es lo que dejó pasar `Registrá`.
- El componente de estado ya acepta seis variantes semánticas; no hace falta nada de tuip.

## Goals / Non-Goals

**Goals:**

- Que los tres estados de una iniciativa se lean sin tener que leer la etiqueta.
- Que la próxima forma del voseo que alguien escriba la encuentre la prueba y no una persona mirando la pantalla.

**Non-Goals:**

- Revisar el resto del texto de la app: el barrido ya se hizo.
- Un sistema de cadenas centralizadas o de traducción.
- Cambiar el vocabulario de color de la talla, que es otra cosa y ya está resuelto.

## Decisions

- **"En evaluación" toma el rol de información.** Es el mismo con el que la evaluación de una persona se marca "En curso", así que "algo está en proceso" se dice igual en las dos pantallas. Alternativa considerada: dejar "En evaluación" en neutro y mover "Cerrada" a otro rol — se descarta porque neutro es exactamente lo que le corresponde a un estado terminal que no pide nada, y moverlo lo haría reclamar atención que no merece.
- **La verificación reconoce la forma, con excepciones.** El voseo imperativo es una palabra terminada en `á`, `é` o `í` acentuada; el problema es que también lo son muchas palabras corrientes —está, café, aquí, más de una decena—. Entonces: se detecta el patrón y se mantiene una lista de **excepciones**, no de casos. La diferencia importa por el modo de fallo: una excepción que falta produce un falso positivo, que se ve y se corrige en el momento; un caso que falta produce un falso negativo, que nadie ve. Es exactamente el error que se cometió tres veces seguidas.
- **La prueba sólo mira texto de interfaz, no todo el código.** Un identificador o un comentario con una palabra acentuada no es texto que alguien lea en pantalla. Acotarla a las cadenas evita que la lista de excepciones crezca por motivos que no tienen que ver con el idioma del producto.
- **Los cuatro textos se reescriben juntos.** El del drawer tiene dos variantes que dicen lo mismo de dos maneras; corregir una y dejar la otra reproduce el problema que el requisito de registro consistente pide evitar.

## Risks / Trade-offs

- **[Detectar por forma trae falsos positivos]** → Es el punto: un falso positivo se ve al correr las pruebas y se resuelve agregando una excepción, con el motivo escrito al lado. Lo que no se puede permitir es lo contrario, que es lo que viene pasando.
- **[La lista de excepciones puede crecer sin control]** → Si crece, es señal de que el patrón está mal elegido. Queda anotado: si al implementarlo hacen falta muchas excepciones, conviene revisar el patrón antes que seguir agregando.
- **[Info para "En evaluación" podría leerse como un aviso]** → El rol de información es el que el sistema usa para lo que está en curso, no para lo que requiere atención; y es el precedente que ya sentó la evaluación de personas.

## Migration Plan

1. El mapa de estados.
2. Los cuatro textos.
3. La verificación del registro, de lista a patrón.

Rollback: los tres son independientes.
