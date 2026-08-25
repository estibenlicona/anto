import type {
  SkillGroup,
  SkillLevel,
} from "@features/skills/services/skillsService";

/**
 * Las nueve habilidades del catálogo del chapter, con los criterios del
 * artboard "Catálogo de habilidades" aprobado.
 *
 * Las cantidades por nivel son deliberadamente distintas entre sí y entre
 * habilidades: el chapter suele tener cinco, pero no siempre, y una pantalla
 * que asuma cinco se rompe con la primera excepción. "Arquitectura" deja un
 * nivel vacío a propósito, que es el caso de habilidad incompleta.
 */

export interface SkillSeed {
  id: string;
  name: string;
  group: SkillGroup;
  description: string;
  active: boolean;
  /** Índice 0..3 = niveles 1..4. Una lista vacía es un nivel sin criterios. */
  criteria: [string[], string[], string[], string[]];
  /**
   * Sólo los cargos con exigencia declarada; el resto queda sin definir.
   * La llave es el **cargo** —a qué se dedica la persona— y no su rol, que es
   * un catálogo cerrado de participación y no describe una disciplina.
   */
  expectations: Record<string, SkillLevel>;
}

export const skillSeeds: SkillSeed[] = [
  {
    id: "s1000000-0000-0000-0000-000000000001",
    name: "Conocimiento del negocio",
    group: "technical",
    description:
      "Qué tanto entiende el producto y el negocio al que sirve lo que construye.",
    active: true,
    criteria: [
      [
        "Identifica los productos del negocio y a quién sirven.",
        "Ubica en qué parte del proceso entra lo que construye.",
        "Usa el vocabulario del negocio sin confundir términos básicos.",
        "Pregunta el porqué de un requerimiento antes de estimarlo.",
        "Necesita que le expliquen el impacto de lo que construye.",
      ],
      [
        "Explica de punta a punta el flujo del producto en el que trabaja.",
        "Traduce un requerimiento a su efecto en el cliente, con acompañamiento.",
        "Reconoce cuándo una decisión técnica toca una regla de negocio.",
        "Detecta casos o datos faltantes en una historia antes de desarrollarla.",
        "Aclara alcance con el PO sin intermediario.",
      ],
      [
        "Anticipa el impacto de una decisión técnica sin que se lo pidan.",
        "Propone alternativas en términos de costo, riesgo y tiempo.",
        "Conoce las reglas de al menos dos dominios además del suyo.",
        "Cuestiona un requerimiento que contradice una regla vigente.",
        "Estima el impacto en clientes de un incidente de su dominio.",
        "Acompaña a otros a leer el negocio detrás de una historia.",
      ],
      [
        "Es referente del dominio: otras células lo consultan.",
        "Sus decisiones cambian la hoja de ruta del producto.",
        "Identifica oportunidades de negocio desde la plataforma.",
        "Forma a otros y deja el conocimiento del dominio documentado.",
      ],
    ],
    expectations: {
      "Backend Dev": 2,
      "Data Engineer": 3,
      "QA Engineer": 2,
      Arquitecto: 4,
      "Frontend Dev": 2,
      // "Data Analyst" queda sin definir a propósito.
    },
  },
  {
    id: "s1000000-0000-0000-0000-000000000002",
    name: "Desarrollo de software",
    group: "technical",
    description:
      "Cómo escribe, prueba y sostiene el código que entra a producción.",
    active: true,
    criteria: [
      [
        "Escribe código que resuelve el caso pedido y pasa la revisión con ajustes.",
        "Usa el control de versiones y respeta la convención de ramas del equipo.",
        "Deja pruebas del camino feliz de lo que construye.",
        "Pide ayuda antes de quedarse trabado más de un día.",
        "Sigue los estándares del capítulo sin necesitar que se los recuerden.",
      ],
      [
        "Descompone un requerimiento en tareas que puede estimar.",
        "Escribe pruebas de los bordes, no sólo del camino feliz.",
        "Revisa código de otros con observaciones concretas.",
        "Maneja errores y casos nulos sin que se lo señalen en revisión.",
        "Deja trazas útiles para diagnosticar en producción.",
        "Refactoriza lo que toca sin cambiar el comportamiento.",
      ],
      [
        "Diseña la solución técnica de una historia completa.",
        "Detecta deuda técnica y la vuelve trabajo priorizable.",
        "Optimiza donde la medición lo justifica, no por intuición.",
        "Define el contrato de una integración con otro equipo.",
        "Deja el código de forma que otro pueda continuarlo sin explicación.",
        "Es referencia de revisión para el resto de la célula.",
      ],
      [
        "Define los estándares de desarrollo del capítulo.",
        "Resuelve los problemas técnicos que nadie más pudo destrabar.",
        "Introduce prácticas nuevas y las deja adoptadas, no sólo propuestas.",
        "Su criterio técnico se consulta fuera de su célula.",
        "Forma a otros y deja el conocimiento escrito.",
      ],
    ],
    expectations: {
      "Backend Dev": 3,
      "Frontend Dev": 3,
      "Mobile Dev": 3,
      Arquitecto: 4,
      "QA Engineer": 2,
      "Data Engineer": 2,
    },
  },
  {
    id: "s1000000-0000-0000-0000-000000000003",
    name: "Ciclo de desarrollo de software",
    group: "technical",
    description:
      "Cómo se mueve el trabajo desde que se planea hasta que está en producción.",
    active: true,
    criteria: [
      [
        "Conoce las ceremonias del equipo y llega preparado.",
        "Mueve sus tareas en el tablero sin que se lo pidan.",
        "Entiende qué significa que una historia esté terminada.",
        "Sube sus cambios por el flujo definido, sin atajos.",
        "Reporta bloqueos el día que aparecen.",
      ],
      [
        "Estima su propio trabajo con un margen razonable.",
        "Prepara el despliegue de lo suyo sin acompañamiento.",
        "Sabe qué hacer cuando el pipeline falla en su cambio.",
        "Participa del refinamiento aportando el ángulo técnico.",
        "Deja el trabajo listo para probar, no sólo listo para revisar.",
      ],
      [
        "Ajusta el flujo del equipo cuando detecta un cuello de botella.",
        "Coordina un despliegue con dependencias de otros equipos.",
        "Define la estrategia de ramas y versiones de un producto.",
        "Anticipa el riesgo de una entrega y propone cómo reducirlo.",
        "Instrumenta lo que se despliega para poder revertirlo con criterio.",
      ],
      [
        "Diseña el ciclo de entrega de un dominio completo.",
        "Reduce el tiempo entre commit y producción con evidencia.",
        "Establece la política de entrega que otros equipos adoptan.",
        "Resuelve incidentes de entrega que cruzan varias células.",
        "Forma a otros líderes en el ciclo del capítulo.",
      ],
    ],
    expectations: {
      "Backend Dev": 2,
      "Frontend Dev": 2,
      "DevOps Engineer": 4,
      Arquitecto: 3,
      "Scrum Master": 3,
    },
  },
  {
    id: "s1000000-0000-0000-0000-000000000004",
    name: "Calidad y pruebas",
    group: "technical",
    description:
      "Cómo asegura que lo que entrega hace lo que dice, hoy y después.",
    active: true,
    criteria: [
      [
        "Prueba manualmente lo que construye antes de entregarlo.",
        "Escribe casos de prueba a partir de los criterios de aceptación.",
        "Reporta un defecto con los pasos para reproducirlo.",
        "Distingue un defecto de un cambio de alcance.",
      ],
      [
        "Automatiza las pruebas de lo que desarrolla.",
        "Diseña casos negativos y de borde sin que se los pidan.",
        "Prioriza defectos por impacto y no por orden de llegada.",
        "Usa datos de prueba representativos, no sólo el caso mínimo.",
        "Verifica que un defecto corregido no vuelva.",
      ],
      [
        "Define la estrategia de pruebas de un producto.",
        "Elige qué automatizar y qué no, con criterio de costo.",
        "Detecta riesgos de calidad en el diseño, antes de que exista el código.",
        "Mide la cobertura real y la usa para decidir, no para reportar.",
        "Acompaña a la célula a prevenir en lugar de detectar.",
      ],
      [
        "Define la política de calidad del capítulo.",
        "Introduce prácticas de prueba que otros equipos adoptan.",
        "Su criterio decide si algo sale o no sale a producción.",
        "Forma a otros en diseño de pruebas.",
      ],
    ],
    expectations: {
      "QA Engineer": 4,
      "Backend Dev": 2,
      "Frontend Dev": 2,
      Arquitecto: 3,
    },
  },
  {
    id: "s1000000-0000-0000-0000-000000000005",
    name: "Arquitectura",
    group: "technical",
    description:
      "Cómo decide la estructura de una solución y qué sostiene esa decisión.",
    active: true,
    criteria: [
      [
        "Reconoce los componentes de la solución en la que trabaja.",
        "Entiende por qué su módulo se comunica como se comunica.",
        "Sigue los patrones definidos sin improvisar los suyos.",
        "Pregunta antes de introducir una dependencia nueva.",
      ],
      [
        "Explica las decisiones de arquitectura de su producto.",
        "Elige entre dos alternativas conocidas con un argumento.",
        "Identifica un acoplamiento que va a costar caro.",
        "Documenta la decisión que toma y su porqué.",
        "Reconoce cuándo un requerimiento no cabe en la arquitectura actual.",
      ],
      // Nivel 3 sin criterios a propósito: es el caso de habilidad incompleta.
      [],
      [
        "Define la arquitectura de referencia de un dominio.",
        "Sus decisiones cambian el estándar del capítulo.",
        "Evalúa proveedores y tecnologías con criterio de costo total.",
        "Resuelve la arquitectura de integraciones entre varios dominios.",
      ],
    ],
    expectations: {
      Arquitecto: 4,
      "Backend Dev": 2,
      "Data Engineer": 2,
    },
  },
  {
    id: "s2000000-0000-0000-0000-000000000001",
    name: "Pensamiento crítico",
    group: "human",
    description:
      "Cómo analiza un problema, contrasta lo que le dicen y decide con evidencia.",
    active: true,
    criteria: [
      [
        "Distingue un hecho de una opinión en una conversación de trabajo.",
        "Pregunta cuando algo no le cierra, en vez de asumir.",
        "Identifica el problema antes de proponer una solución.",
        "Reconoce cuando le falta información para decidir.",
        "Acepta que le cuestionen una conclusión sin tomarlo como algo personal.",
      ],
      [
        "Descompone un problema en partes que puede atacar por separado.",
        "Busca la causa y no se queda en el síntoma.",
        "Contrasta lo que le dicen con lo que ve en los datos.",
        "Propone al menos dos caminos antes de elegir uno.",
        "Explica su razonamiento de forma que otro pueda refutarlo.",
      ],
      [
        "Cuestiona el planteo del problema, no sólo la solución propuesta.",
        "Detecta el supuesto que sostiene una decisión y lo pone a prueba.",
        "Decide con información incompleta dejando explícito el riesgo.",
        "Cambia de posición cuando la evidencia lo contradice.",
        "Ayuda a otros a ver el ángulo que les falta.",
      ],
      [
        "Reencuadra problemas que el equipo daba por definidos.",
        "Su análisis cambia decisiones fuera de su alcance.",
        "Anticipa consecuencias de segundo orden de una decisión.",
        "Instala en el equipo la práctica de contrastar antes de decidir.",
        "Es a quien se consulta cuando una decisión difícil está trabada.",
      ],
    ],
    expectations: {
      "Backend Dev": 2,
      "Frontend Dev": 2,
      "QA Engineer": 3,
      Arquitecto: 4,
      "Data Analyst": 3,
      "Product Owner": 3,
    },
  },
  {
    id: "s2000000-0000-0000-0000-000000000002",
    name: "Comunicación",
    group: "human",
    description:
      "Cómo transmite lo que sabe y lo que necesita, a quien corresponde y a tiempo.",
    active: true,
    criteria: [
      [
        "Informa el avance de su trabajo sin que se lo pidan.",
        "Escribe mensajes que se entienden sin tener que preguntar de vuelta.",
        "Escucha hasta el final antes de responder.",
        "Pide ayuda con el contexto suficiente para que se la puedan dar.",
      ],
      [
        "Explica un tema técnico a alguien que no es técnico.",
        "Documenta lo que hace de forma que otro lo pueda retomar.",
        "Da y recibe retroalimentación sin que la conversación se tense.",
        "Adapta el nivel de detalle a quién lo escucha.",
        "Avisa un riesgo a tiempo, no cuando ya ocurrió.",
      ],
      [
        "Presenta una propuesta y sostiene la discusión con argumentos.",
        "Alinea a personas de áreas distintas alrededor de una decisión.",
        "Comunica una mala noticia sin diluirla ni dramatizarla.",
        "Deja por escrito lo que se acordó, no sólo lo que se dijo.",
      ],
      [
        "Representa al capítulo frente a otras áreas.",
        "Su forma de comunicar se vuelve la referencia del equipo.",
        "Traduce la estrategia a lo que el equipo tiene que hacer.",
        "Sostiene conversaciones difíciles sin romper la relación.",
      ],
    ],
    expectations: {
      "Backend Dev": 2,
      "QA Engineer": 2,
      Arquitecto: 3,
      "Scrum Master": 4,
      "Product Owner": 4,
    },
  },
  {
    id: "s2000000-0000-0000-0000-000000000003",
    name: "Trabajo colaborativo",
    group: "human",
    description: "Cómo aporta al resultado del equipo y no sólo al suyo.",
    active: true,
    criteria: [
      [
        "Cumple los acuerdos del equipo sin que haya que recordárselos.",
        "Comparte lo que sabe cuando alguien lo necesita.",
        "Participa de las ceremonias con algo que aportar.",
        "Reconoce el aporte de los demás.",
        "Deja su trabajo en un estado que otro puede retomar.",
      ],
      [
        "Ayuda a destrabar a un compañero aunque no sea su tarea.",
        "Resuelve un desacuerdo sin escalarlo de entrada.",
        "Coordina con otro equipo lo que depende de ambos.",
        "Prefiere que la tarea salga a que salga como él la haría.",
        "Acompaña a alguien nuevo sin que se lo asignen.",
      ],
      [
        "Distribuye el trabajo del equipo mirando la carga y no sólo la habilidad.",
        "Convierte un conflicto en una decisión tomada.",
        "Construye acuerdos entre células con intereses distintos.",
        "Cede el protagonismo cuando eso hace avanzar al equipo.",
        "Detecta a quien se está quedando solo y lo integra.",
        "Deja capacidad instalada donde antes dependía de él.",
      ],
      [
        "Crea las condiciones para que otros equipos colaboren entre sí.",
        "Su forma de trabajar en equipo se replica fuera de su célula.",
        "Sostiene la colaboración cuando hay presión de entrega.",
        "Forma a otros en cómo llevar un equipo a un acuerdo.",
      ],
    ],
    expectations: {
      "Backend Dev": 2,
      "Frontend Dev": 2,
      "QA Engineer": 2,
      Arquitecto: 3,
      "Scrum Master": 4,
    },
  },
  {
    id: "s2000000-0000-0000-0000-000000000004",
    name: "Adaptabilidad",
    group: "human",
    description:
      "Cómo responde cuando cambia la prioridad, la tecnología o el equipo.",
    active: true,
    criteria: [
      [
        "Acepta un cambio de prioridad sin que le baje el rendimiento.",
        "Aprende una herramienta nueva cuando el trabajo lo pide.",
        "Pregunta antes de resistirse a una forma de trabajo distinta.",
        "Sostiene el foco cuando el contexto es incierto.",
      ],
      [
        "Se mueve entre dos contextos de producto sin perder calidad.",
        "Aprende una tecnología nueva y la lleva a producción.",
        "Ajusta su forma de trabajar cuando el equipo cambia.",
        "Propone cómo absorber un cambio, no sólo por qué cuesta.",
      ],
      [
        "Acompaña al equipo en un cambio que él tampoco pidió.",
        "Reorganiza el trabajo cuando cambian las reglas a mitad de camino.",
        "Aprende un dominio nuevo lo bastante rápido para decidir en él.",
        "Distingue qué cambio conviene absorber y cuál conviene discutir.",
      ],
      [
        "Lleva al capítulo por un cambio grande sin perder la entrega.",
        "Convierte la incertidumbre en un plan que el equipo puede seguir.",
        "Su ejemplo baja la resistencia del resto ante un cambio.",
      ],
    ],
    expectations: {
      "Backend Dev": 2,
      "QA Engineer": 2,
      Arquitecto: 3,
      "Scrum Master": 3,
    },
  },
];
