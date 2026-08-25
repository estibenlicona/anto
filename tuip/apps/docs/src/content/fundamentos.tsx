import {
  accentColor,
  accentColorNames,
  attentionColor,
  attentionLevelNames,
  borderWidth,
  contrastRatio,
  breakpointBehaviour,
  color,
  controlHeight,
  elevation,
  layer,
  maxWidth,
  motion,
  primitives,
  radius,
  shadow,
  shell,
  spaceAlias,
  spacing,
  touchTarget,
  typography,
} from "@tuya-ui/tokens";
import type { DocPage } from "./page";

/**
 * Every value on these pages is read from the token package rather than
 * transcribed: a renamed token or a changed value shows up here without anyone
 * editing the documentation. The content modules only add the guidance that a
 * token cannot state about itself — when to reach for it.
 */

function flattenLeaves(pathSegments: string[], value: unknown): Array<[string, string]> {
  if (typeof value === "string") return [[pathSegments.join("."), value]];
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, nested]) =>
      flattenLeaves([...pathSegments, key], nested),
    );
  }
  return [];
}

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-control border border-neutral-default p-3">
      <div
        className="h-10 w-10 shrink-0 rounded-control border border-neutral-default"
        style={{ background: value }}
      />
      <div className="min-w-0">
        <p className="truncate font-mono text-body-sm text-neutral-default">{name}</p>
        <p className="font-mono text-body-sm text-neutral-subtle">{value}</p>
      </div>
    </div>
  );
}

/**
 * Prints the CSS variable a component would actually write, not a dotted path:
 * the name is half of what this page documents, so it has to be the real one.
 */
function SwatchGrid({
  property,
  colors,
}: {
  property: "bg" | "text" | "border" | "icon";
  colors: Record<string, unknown>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {flattenLeaves([], colors).map(([path, value]) => (
        <Swatch
          key={path}
          name={`--color-${property}-${path.replace(/\./g, "-").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`}
          value={value}
        />
      ))}
    </div>
  );
}

function PrimitiveScale({ familyName, scale }: { familyName: string; scale: Record<string, string> }) {
  return (
    <div>
      <p className="mb-2 font-mono text-body-sm capitalize text-neutral-default">{familyName}</p>
      <div className="flex overflow-hidden rounded-control border border-neutral-default">
        {Object.entries(scale).map(([step, value]) => (
          <div key={step} className="flex-1" title={`${familyName}.${step} — ${value}`}>
            <div className="h-12" style={{ background: value }} />
            <p className="px-1 py-0.5 text-center text-label text-neutral-subtle">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** What each style of the scale is for. Keyed by the token's own name. */
const TEXT_STYLE_USE: Record<string, string> = {
  display: "Título de pantalla. Uno por vista, arriba a la izquierda",
  headingLg: "Sección, o título de panel",
  headingMd: "Título de tarjeta",
  body: "Párrafos, celdas de tabla y valores de formulario",
  bodySm: "Texto de ayuda, metadatos, contenido de tablas compactas",
  label: "Etiqueta de columna y rótulos en versalitas",
  metric: "La cifra que encabeza un indicador: el valor de una tarjeta de resumen",
};

/** What relationship each alias expresses. Keyed by the alias's own name. */
const SPACING_USE: Record<string, string> = {
  hug: "Pegado: el punto de estado y su texto, el dígito y su unidad, la insignia y su contador",
  inline: "Entre elementos de una misma fila: icono y etiqueta dentro de un botón, botones de un grupo",
  stack: "Entre partes de un mismo componente: la etiqueta y su campo, el título y su subtítulo",
  group: "Entre componentes hermanos relacionados: dos campos del mismo bloque",
  inset: "Relleno interior de tarjetas, paneles, modales y celdas de tabla cómoda",
  block: "Entre bloques distintos de una misma sección: tarjeta y tarjeta, grupo de formulario",
  section: "Entre secciones de la página. Es el salto que dice «aquí empieza otro tema»",
  pageTop: "Aire entre la barra superior y la cabecera de página",
  pageBottom: "Cierre inferior, para que el último bloque no quede pegado al final del scroll",
};

export const tipografiaPage: DocPage = {
  title: "Tipografía",
  lede: "Una sola familia para la interfaz y una monoespaciada reservada a identificadores literales. La escala es cerrada: si un tamaño no está aquí, no se usa.",
  sections: [
    {
      id: "familias",
      label: "Familias",
      blocks: [
        {
          kind: "prose",
          text: "La familia sans se usa en toda la interfaz. La monoespaciada se reserva para lo que es literal —nombres de token, rutas de archivo, comandos, tipos— porque ahí el ancho fijo ayuda a comparar y a no confundir caracteres parecidos.",
        },
        {
          kind: "table",
          columns: [
            { key: "role", header: "Rol", width: 0.8 },
            { key: "stack", header: "Familia", mono: true, width: 2.6 },
          ],
          rows: [
            { role: "Interfaz", stack: typography.fontFamily.sans },
            { role: "Literales", stack: typography.fontFamily.mono },
          ],
        },
      ],
    },
    {
      id: "escala",
      label: "La escala",
      blocks: [
        {
          kind: "prose",
          text: "Siete estilos, ni uno más. Cada uno trae su tamaño, su interlineado y su peso juntos, de modo que no se puedan combinar en una pareja que la escala nunca definió. Si hace falta un octavo, casi siempre es un problema de jerarquía en la pantalla y no una carencia de la escala. Los estilos se nombran por su rol, no por su tamaño: seis cubren la jerarquía de título a etiqueta, y `metric` queda aparte porque una cifra que encabeza un indicador no compite con esa jerarquía sino que vive en otro eje.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-col gap-3">
              {Object.entries(typography.textStyle).map(([name, style]) => (
                <div key={name} className="flex flex-wrap items-baseline gap-4">
                  <span
                    style={{
                      fontSize: style.fontSize,
                      fontWeight: style.fontWeight,
                      lineHeight: style.lineHeight,
                      letterSpacing:
                        "letterSpacing" in style ? style.letterSpacing : undefined,
                    }}
                    className="text-neutral-default"
                  >
                    Tuya UI
                  </span>
                  <span className="font-mono text-body-sm text-neutral-subtle">
                    {name} · {style.fontSize} / {style.lineHeight} · {style.fontWeight}
                  </span>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Estilo", mono: true, width: 1 },
            { key: "size", header: "Tamaño / interlineado", mono: true, width: 1.2 },
            { key: "weight", header: "Peso", mono: true, width: 0.5 },
            { key: "use", header: "Uso previsto", width: 2 },
          ],
          rows: Object.entries(typography.textStyle).map(([name, style]) => ({
            token: name,
            size: `${style.fontSize} / ${style.lineHeight}`,
            weight: style.fontWeight,
            use: TEXT_STYLE_USE[name] ?? "—",
          })),
        },
      ],
    },
    {
      id: "cifras",
      label: "Cifras",
      blocks: [
        {
          kind: "prose",
          text: "Todo número de negocio lleva cifras tabulares: cada dígito ocupa el mismo ancho y las columnas se comparan de un vistazo, que es lo único que se buscaba al recurrir a una monoespaciada. La monoespaciada queda para cadenas literales —identificadores, ramas, código— donde el ancho fijo sí significa algo.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-10">
              <div>
                <p
                  className="text-neutral-default"
                  style={{ fontVariantNumeric: typography.numeric.fontVariantNumeric }}
                >
                  38.5 · 111.0 · 6.25
                </p>
                <p className="mt-1 font-mono text-body-sm text-neutral-subtle">
                  numeric · {typography.numeric.fontVariantNumeric}
                </p>
              </div>
              <div>
                <p className="font-mono text-neutral-default">TUY-4821</p>
                <p className="mt-1 font-mono text-body-sm text-neutral-subtle">
                  mono · solo identificadores literales
                </p>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      id: "pesos",
      label: "Pesos",
      blocks: [
        {
          kind: "prose",
          text: "Cuatro pesos, sin intermedios, y cada uno con su rol: cuerpo, énfasis de interfaz, títulos y la cifra que encabeza un indicador. El peso distingue jerarquía dentro de un mismo tamaño; cuando hace falta más distinción que eso, lo que corresponde es cambiar de paso en la escala, no engordar el texto. `bold` es el único que pertenece a un solo estilo —`metric`—, y ahí está su límite: un peso sin rol asignado es lo que abre la puerta a parejas que la escala nunca definió.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-6">
              {Object.entries(typography.fontWeight).map(([name, value]) => (
                <div key={name} className="flex flex-col gap-1">
                  <span style={{ fontWeight: value }} className="text-heading-md text-neutral-default">
                    Tuya UI
                  </span>
                  <span className="font-mono text-body-sm text-neutral-subtle">
                    {name} · {value}
                  </span>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ],
};

export const colorPage: DocPage = {
  title: "Color y tokens",
  lede: "Dos capas: una paleta primitiva que nadie consume directamente, y sobre ella los tokens semánticos que sí usan los componentes. El rojo de marca dirige la acción primaria y nada más.",
  sections: [
    {
      id: "arquitectura",
      label: "Tres capas",
      blocks: [
        {
          kind: "prose",
          text: "La primitiva tiene el valor, la semántica tiene el significado, y la de componente tiene la excepción. Un componente solo consume la capa semántica: por eso cambiar el rojo de marca es cambiar un primitivo, y no perseguir su uso por todo el sistema.",
        },
        {
          kind: "table",
          columns: [
            { key: "layer", header: "Capa", width: 0.8 },
            { key: "example", header: "Ejemplo", mono: true, width: 1.6 },
            { key: "what", header: "Qué es", width: 2.2 },
          ],
          rows: [
            {
              layer: "Primitiva",
              example: "--tuya-brand-500",
              what: "El valor bruto. Nunca se usa directamente en un componente. Cambia casi nunca.",
            },
            {
              layer: "Semántica",
              example: "--color-bg-brand-bold",
              what: "El significado. Es lo único que un componente puede referenciar, y donde se reasigna el tema oscuro.",
            },
            {
              layer: "Componente",
              example: "--button-primary-bg",
              what: "Opcional, solo cuando un componente necesita apartarse. Si hay muchos, la capa semántica está incompleta.",
            },
          ],
        },
        {
          kind: "prose",
          text: "El nombre de un token semántico se lee en voz alta y se entiende: propiedad, rol, énfasis y estado, en ese orden. Un nombre que describe apariencia —«rojo claro»— miente en cuanto llega el tema oscuro.",
        },
        {
          kind: "code",
          label: "nomenclatura",
          code: `--color-[propiedad]-[rol]-[énfasis]-[estado]

propiedad   bg · text · border · icon
rol         neutral · brand · danger · warning · success · info · discovery
énfasis     subtle · soft · default · bold
estado      hover · pressed · disabled · selected`,
        },
      ],
    },
    {
      id: "marca",
      label: "Marca",
      blocks: [
        {
          kind: "callout",
          tone: "danger",
          title: "El rojo señala una sola cosa por pantalla",
          text: "El color de marca marca la acción primaria y la posición actual en la navegación. Repartido entre elementos secundarios deja de dirigir la mirada, que es lo único para lo que sirve.",
        },
        {
          kind: "custom",
          render: () => <PrimitiveScale familyName="brand" scale={primitives.brand} />,
        },
        {
          kind: "table",
          columns: [
            { key: "step", header: "Paso", mono: true, width: 0.6 },
            { key: "value", header: "Claro", mono: true, width: 0.8 },
            { key: "valueDark", header: "Oscuro", mono: true, width: 0.8 },
            { key: "use", header: "Uso", width: 2.6 },
          ],
          rows: [
            {
              step: "500",
              value: primitives.brand[500],
              use: "El rojo de marca. Navegación activa, anillo de foco, borde de marca y logotipo — todo lo que no lleva texto encima.",
            },
            {
              step: "600",
              value: primitives.brand[600],
              use: "Fondo de la acción primaria y texto rojo sobre blanco. Es el paso donde el rojo alcanza el contraste que exige el texto.",
            },
            {
              step: "50 – 100",
              value: `${primitives.brand[50]} – ${primitives.brand[100]}`,
              use: "Fondos de selección, fila activa, insignia de marca.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "El rojo de marca no es el rojo de error",
          text: "El error y lo destructivo usan un rojo profundo distinto, y nunca comunican solo por matiz: siempre llevan además icono y texto.",
        },
      ],
    },
    {
      id: "primitivos",
      label: "Paleta primitiva",
      blocks: [
        {
          kind: "prose",
          text: "Escalas crudas sin significado asignado. El 90% de la interfaz vive en los neutros, ligeramente fríos para que el rojo cálido de la marca resalte por contraste de temperatura. Las familias semánticas se definen en los pasos que el sistema realmente usa, no como rampas completas.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-col gap-4">
              {Object.entries(primitives).map(([family, scale]) => (
                <PrimitiveScale
                  key={family}
                  familyName={family}
                  scale={scale as Record<string, string>}
                />
              ))}
            </div>
          ),
        },
      ],
    },
    {
      id: "fondo",
      label: "Fondo",
      blocks: [
        { kind: "custom", render: () => <SwatchGrid property="bg" colors={color.light.background} /> },
      ],
    },
    {
      id: "texto",
      label: "Texto",
      blocks: [
        { kind: "custom", render: () => <SwatchGrid property="text" colors={color.light.text} /> },
      ],
    },
    {
      id: "borde",
      label: "Borde",
      blocks: [
        {
          kind: "prose",
          text: "Los trazos neutros no son intensidades a elegir por gusto: cada uno responde a una pregunta distinta. `soft` es translúcido y sólo insinúa un límite — se compone sobre la superficie que tenga debajo, así que sirve igual en claro y en oscuro, pero NO alcanza el mínimo de contraste para delimitar un componente de forma accesible: no lo elijas para eso. `default` divide por dentro de una superficie ya delimitada. `bold` es el trazo que sí clara ese mínimo, para cuando el límite tiene que percibirse y no sólo estar.",
        },
        { kind: "custom", render: () => <SwatchGrid property="border" colors={color.light.border} /> },
      ],
    },
    {
      id: "icono",
      label: "Ícono",
      blocks: [
        { kind: "custom", render: () => <SwatchGrid property="icon" colors={color.light.icon} /> },
      ],
    },
    {
      id: "acento",
      label: "Paleta de acento",
      blocks: [
        {
          kind: "callout",
          tone: "warning",
          title: "La paleta de acento no comunica estado",
          text: "No reemplaza a success, warning, danger ni info, y un matiz de acento no dice que algo esté sano, en riesgo o roto. Sirve para otra cosa: distinguir los pasos de una escala ordinal —el nivel de dominio de alguien, la criticidad de un sistema— donde lo que hay que leer es cuánto, no qué. Donde el color sí signifique estado, lo que corresponde son los roles semánticos de arriba.",
        },
        {
          kind: "prose",
          text: "Vive bajo su propio prefijo —--color-accent-<matiz>-fill— justamente para que no se la pueda confundir con una familia semántica. Los cuatro matices se eligieron como una sola progresión, no como cuatro familias sueltas: comparten tratamiento para que la distancia entre el primero y el segundo se lea igual que la del tercero al cuarto. Por eso blue no es un alias de info aunque se le parezca — prestarlo ataría la paridad de esta escala a decisiones que se toman por otros motivos. La escala se lee celeste → azul → violeta → magenta (sky, blue, violet, magenta): los nombres dicen el matiz, porque un token que se llame distinto de como pinta miente.",
        },
        {
          kind: "prose",
          text: "Un solo paso por matiz, y sólo tiñe elementos gráficos. La definición documenta tres —tinta para texto, relleno para gráficos, superficie para fondos— y acá entra uno, porque uno es el que algo usa: la pieza que consume esta escala no tiene fondo teñido ni texto teñido. Un token entra cuando algo lo ejercita, no para completar una tabla. Donde el color va sobre texto, lo que corresponde es la capa semántica.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-col gap-3">
              {accentColorNames.map((name) => (
                <div key={name} className="flex items-center gap-3">
                  <span
                    className="inline-block h-8 w-8 shrink-0 rounded-control border-default border-neutral-default"
                    style={{ backgroundColor: accentColor.light[name].fill }}
                  />
                  <code className="font-mono text-label text-neutral-subtle">
                    accent.{name}.fill · {accentColor.light[name].fill} / {accentColor.dark[name].fill}
                  </code>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "prose",
          text: "Un matiz de acento no trae superficie propia: tiñe segmentos que se apoyan en lo que sea que haya debajo. Por eso no se lo mide contra una superficie elegida como representativa, sino contra todas las que el sistema puede poner debajo — un matiz que sólo pasara sobre el fondo más favorable no estaría verificado. El piso es 3:1, el de un componente de interfaz. La tabla se calcula desde los propios tokens, y la verificación automática falla el build si alguno cae por debajo.",
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Matiz", mono: true, width: 1.1 },
            { key: "value", header: "Valor", mono: true, width: 0.8 },
            { key: "row", header: "Fila", mono: true, width: 0.7 },
            { key: "canvas", header: "Lienzo", mono: true, width: 0.7 },
            { key: "selected", header: "Fila sel.", mono: true, width: 0.7 },
            { key: "dark", header: "Fila oscura", mono: true, width: 0.8 },
          ],
          rows: accentColorNames.map((name) => {
            const light = accentColor.light[name].fill;
            const dark = accentColor.dark[name].fill;
            const ratio = (fg: string, bg: string) => `${contrastRatio(fg, bg).toFixed(2)}:1`;
            return {
              token: `accent.${name}`,
              value: light,
              valueDark: dark,
              row: ratio(light, color.light.background.neutral.default),
              canvas: ratio(light, color.light.background.neutral.subtlest),
              selected: ratio(light, color.light.background.neutral.selected),
              dark: ratio(dark, color.dark.background.neutral.default),
            };
          }),
        },
        {
          kind: "prose",
          text: "Un valor por tema, como en la capa semántica. Con la escala celeste → magenta los matices claros no llegan a 3:1 sobre la fila oscura (magenta queda en 2.83:1), así que el tema oscuro los aclara un paso. Cada paleta se mide contra las superficies de su tema — fila, lienzo y fila seleccionada en claro; fila en oscuro — y el build falla si un cambio futuro baja un paso del piso. El más ajustado es sky sobre la fila seleccionada, con 0.27 de margen: sky partió del celeste pálido #93C5FD de la referencia y se bajó hasta pasar.",
        },
      ],
    },
    {
      id: "atencion",
      label: "Escala de atención",
      blocks: [
        {
          kind: "callout",
          tone: "warning",
          title: "Lo que no pide atención va en la familia neutra",
          text: "La escala no tiene un cuarto paso para \"está en orden\", y no es un olvido. Un escalón de color para lo que no pide nada invita a pintar la superficie entera, y una escala donde todo lleva color deja de señalar — que es exactamente lo que estos tres pasos existen para hacer. Es la regla que separa un mapa de calor que se lee de un vistazo de una grilla de colores bonita.",
        },
        {
          kind: "prose",
          text: "El cuarto vocabulario de color del sistema, y existe porque los otros tres responden preguntas distintas. Los roles semánticos responden qué es esto y afirman un estado sin graduarlo: algo está en riesgo o no lo está. La paleta de acento responde cuánto pero se declara explícitamente muda sobre el estado: un paso violet no está peor que uno blue, sólo después. La escala de atención responde las dos a la vez — gradúa un estado que ya se afirmó — y sirve cuando hay muchas cosas a la vez y no todas urgen igual: un mapa de calor de brechas, una grilla de alertas, una lista de vencimientos.",
        },
        {
          kind: "prose",
          text: "Vive bajo su propio prefijo —--color-attention-<paso>-fill— y publica un solo paso por escalón, que es relleno. La pieza que la consume tiñe una superficie chica que se lee por su color; no lleva texto encima. Se probó publicar además el texto legible sobre cada relleno y se descartó al medirlo: low cae en la zona muerta donde ni el texto claro ni el oscuro llegan a 4.5:1, y forzarlo habría elegido la escala por un texto que nadie escribe adentro en vez de por la separación contra el fondo, que es lo que importa. Una cifra dentro del cuadro va al lado, no adentro.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-col gap-3">
              {attentionLevelNames.map((name) => (
                <div key={name} className="flex items-center gap-3">
                  <span
                    className="inline-block h-8 w-8 shrink-0 rounded-control border-default border-neutral-default"
                    style={{ backgroundColor: attentionColor.light[name].fill }}
                  />
                  <code className="font-mono text-label text-neutral-subtle">
                    attention.{name}.fill · {attentionColor.light[name].fill} / {attentionColor.dark[name].fill}
                  </code>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "prose",
          text: "Los tres salen de los roles que ya expresan atención, para que el escalón más grave de un mapa y una alerta del sistema no sean dos rojos distintos: en tema claro high es el mismo valor que el relleno de danger. Los otros dos no pudieron ser los pasos 400 de warning y danger, que eran los candidatos obvios: con el piso de 3:1 quedan en 2.12:1 y 2.95:1 sobre la fila seleccionada. En tema oscuro la coincidencia con danger tampoco se puede sostener —ese rojo da 1.90:1 sobre la fila oscura, o sea que el cuadro desaparecería—, así que high toma el escalón claro de la misma familia. El mínimo de contraste manda sobre la coincidencia exacta.",
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Paso", mono: true, width: 1.1 },
            { key: "value", header: "Valor", mono: true, width: 0.8 },
            { key: "row", header: "Fila", mono: true, width: 0.7 },
            { key: "canvas", header: "Lienzo", mono: true, width: 0.7 },
            { key: "selected", header: "Fila sel.", mono: true, width: 0.7 },
            { key: "dark", header: "Fila oscura", mono: true, width: 0.8 },
          ],
          rows: attentionLevelNames.map((name) => {
            const light = attentionColor.light[name].fill;
            const dark = attentionColor.dark[name].fill;
            const ratio = (fg: string, bg: string) => `${contrastRatio(fg, bg).toFixed(2)}:1`;
            return {
              token: `attention.${name}`,
              value: light,
              valueDark: dark,
              row: ratio(light, color.light.background.neutral.default),
              canvas: ratio(light, color.light.background.neutral.subtlest),
              selected: ratio(light, color.light.background.neutral.selected),
              dark: ratio(dark, color.dark.background.neutral.default),
            };
          }),
        },
        {
          kind: "prose",
          text: "El orden se lee distinto en cada tema y es a propósito. El matiz gradúa igual en los dos —ámbar, después rojo—, pero dentro del rojo la intensidad la marca la separación del fondo: en claro se oscurece y en oscuro se aclara. low va aparte en ambos: es ámbar, y su lugar en la escala lo dice el matiz, no la luminancia. El paso más ajustado es low sobre la fila seleccionada, con 0.33 de margen.",
        },
        {
          kind: "callout",
          tone: "info",
          title: "No reemplaza al acento, ni a un rol, ni al heat de SegmentedBar",
          text: "Si hay que distinguir los pasos de una escala ordinal sin decir que alguno esté mal —seniority, nivel de dominio—, eso es acento. Si hay que afirmar un estado sin graduarlo, eso es un rol semántico. Y el heat de SegmentedBar es otra cosa todavía: gradúa cuánta gente cae en cada tramo de una distribución, no cuánta atención pide algo, y por eso vive dentro de ese componente y no acá.",
        },
      ],
    },
    {
      id: "oscuro",
      label: "Tema oscuro",
      blocks: [
        {
          kind: "prose",
          text: "No es la paleta invertida. Las superficies se distinguen entre sí por su claridad y no por sombras, los acentos se aclaran para sostener el contraste sobre fondo oscuro, y el texto nunca llega al blanco puro: el texto claro sobre fondo oscuro se percibe más grueso de lo que es.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-3">
              {(
                [
                  ["Lienzo", color.dark.background.neutral.subtlest],
                  ["Superficie", color.dark.background.neutral.default],
                  ["Elevada", color.dark.background.neutral.subtle],
                  ["Borde", color.dark.border.neutral.default],
                  ["Marca", color.dark.background.brand.bold],
                  ["Texto", color.dark.text.neutral.default],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex min-w-[132px] flex-col gap-2 rounded-control border border-neutral-default p-3"
                >
                  <div
                    className="h-10 w-full rounded-control border border-neutral-default"
                    style={{ background: value }}
                  />
                  <div>
                    <p className="text-body-sm text-neutral-default">{label}</p>
                    <p className="font-mono text-body-sm text-neutral-subtle">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "custom",
          render: () => <SwatchGrid property="bg" colors={color.dark.background} />,
        },
      ],
    },
    {
      id: "elevacion",
      label: "Elevación",
      blocks: [
        {
          kind: "prose",
          text: "Cada superficie combina un fondo y una sombra. Se usan juntas: aplicar la sombra sin el fondo produce un borde flotante que no corresponde a ninguna superficie del sistema.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-6">
              {Object.entries(elevation.light.surface).map(([name, surface]) => (
                <div
                  key={name}
                  className="flex h-24 w-40 items-center justify-center rounded-control font-mono text-body-sm text-neutral-default"
                  style={{ background: surface.background, boxShadow: surface.boxShadow }}
                >
                  {name}
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      id: "sombras",
      label: "Sombras",
      blocks: [
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-6">
              {Object.entries(shadow).map(([name, value]) => (
                <div
                  key={name}
                  className="flex h-16 w-24 items-center justify-center rounded-control bg-neutral-default font-mono text-body-sm text-neutral-subtle"
                  style={{ boxShadow: value }}
                >
                  {name}
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ],
};

export const espaciadoPage: DocPage = {
  title: "Espaciado y layout",
  lede: "Una escala sobre base de 4px con un alias por cada relación que expresa, y las medidas que dan forma a la pantalla: la estructura que comparten las aplicaciones, sus puntos de quiebre, las alturas de control, los anchos máximos y las capas.",
  sections: [
    {
      id: "escala",
      label: "La escala",
      blocks: [
        {
          kind: "prose",
          text: "Toda medida es un múltiplo de 4px, sin excepciones ni valores intermedios. Los pasos se saltan valores en el tramo alto porque a esa distancia la diferencia ya no se percibe como una decisión, sino como un descuido.",
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Paso", mono: true, width: 0.6 },
            { key: "value", header: "Valor", mono: true, width: 0.8 },
          ],
          rows: Object.entries(spacing).map(([name, value]) => ({ token: name, value })),
        },
        {
          kind: "prose",
          text: "Pero estos números no se usan directamente. Un número no dice cuándo aplicarlo, y esa es justamente la decisión que se toma al maquetar: se elige el alias, no el píxel. La escala es el inventario; el alias es la decisión.",
        },
      ],
    },
    {
      id: "alias",
      label: "Alias semánticos",
      blocks: [
        {
          kind: "table",
          columns: [
            { key: "token", header: "Alias", mono: true, width: 1 },
            { key: "value", header: "Valor", mono: true, width: 0.6 },
            { key: "use", header: "Relación que expresa", width: 2.6 },
          ],
          rows: Object.entries(spaceAlias).map(([name, value]) => ({
            token: `space.${name}`,
            value,
            use: SPACING_USE[name] ?? "—",
          })),
        },
        {
          kind: "callout",
          tone: "danger",
          title: "El salto dentro de un grupo va siempre por debajo del salto entre grupos",
          text: "El espacio comunica pertenencia: lo que está junto se lee junto. Si la separación dentro de un grupo iguala a la que hay entre grupos, el usuario no sabe dónde termina una idea y empieza otra.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-8">
              {(
                [
                  ["Bien", spaceAlias.stack, spaceAlias.block],
                  ["Mal", spaceAlias.group, spaceAlias.group],
                ] as const
              ).map(([label, inner, outer]) => (
                <div key={label}>
                  <p className="mb-2 text-body-sm text-neutral-subtle">
                    {label} · {inner} dentro, {outer} entre
                  </p>
                  <div
                    className="rounded-control border border-neutral-default p-4"
                    style={{ display: "flex", flexDirection: "column", gap: outer }}
                  >
                    {[0, 1].map((group) => (
                      <div key={group} style={{ display: "flex", flexDirection: "column", gap: inner }}>
                        <div className="h-2.5 w-32 rounded-control bg-neutral-subtle-pressed" />
                        <div className="h-2.5 w-24 rounded-control bg-neutral-subtle-pressed" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "callout",
          tone: "info",
          title: "Si hace falta una línea para separar, falta espacio",
          text: "Una divisoria entre dos bloques que ya están bien espaciados es redundante. Cuando dos bloques necesitan la línea para leerse como separados, lo que hay que subir es el paso de espaciado.",
        },
      ],
    },
    {
      id: "anatomia",
      label: "Anatomía de la página",
      blocks: [
        {
          kind: "prose",
          text: "Todas las aplicaciones del sistema comparten el mismo esqueleto. Cambia el contenido, nunca el marco: quien aprende a moverse en una, se mueve en todas.",
        },
        {
          kind: "table",
          columns: [
            { key: "zone", header: "Zona", width: 1 },
            { key: "size", header: "Medida", mono: true, width: 0.9 },
            { key: "what", header: "Qué contiene", width: 2.4 },
          ],
          rows: [
            {
              zone: "Rail de navegación",
              size: shell.railWidth,
              what: "Fijo. Colapsa a iconos bajo el punto de quiebre medio, y a cajón superpuesto bajo el menor.",
            },
            {
              zone: "Barra superior",
              size: shell.topBarHeight,
              what: "Ruta, contexto global y cuenta. Nunca acciones de la pantalla.",
            },
            {
              zone: "Cabecera de página",
              size: `${spaceAlias.pageTop} / ${spaceAlias.block}`,
              what: "Antetítulo, título, descripción y las acciones de la pantalla a la derecha.",
            },
            {
              zone: "Cuerpo",
              size: `gap ${spaceAlias.block}`,
              what: "Secciones apiladas. Cada sección: su título y su contenido.",
            },
            {
              zone: "Cierre inferior",
              size: spaceAlias.pageBottom,
              what: "Para que el último bloque no quede pegado al final del scroll.",
            },
          ],
        },
      ],
    },
    {
      id: "quiebres",
      label: "Puntos de quiebre",
      blocks: [
        {
          kind: "table",
          columns: [
            { key: "range", header: "Rango", mono: true, width: 1 },
            { key: "columns", header: "Columnas", mono: true, width: 0.6 },
            { key: "changes", header: "Qué cambia", width: 3 },
          ],
          rows: breakpointBehaviour.map((row) => ({
            range: row.range,
            columns: row.columns,
            changes: row.changes,
          })),
        },
      ],
    },
    {
      id: "anchos",
      label: "Anchos máximos",
      blocks: [
        {
          kind: "prose",
          text: "El texto se topa porque pasadas unas 75 caracteres por línea el ojo pierde el renglón. Los datos no tienen ese límite: una tabla siempre agradece el ancho, porque más ancho es más columnas visibles.",
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Token", mono: true, width: 1 },
            { key: "value", header: "Valor", mono: true, width: 0.7 },
            { key: "use", header: "Tipo de contenido", width: 2 },
          ],
          rows: [
            { token: "width.prose", value: maxWidth.prose, use: "Texto de lectura" },
            { token: "width.form", value: maxWidth.form, use: "Formulario" },
            { token: "width.panel", value: maxWidth.panel, use: "Panel de detalle" },
            { token: "width.page", value: maxWidth.page, use: "Página" },
            { token: "—", value: "100%", use: "Tabla y dashboard: sin tope" },
          ],
        },
      ],
    },
    {
      id: "controles",
      label: "Alturas de control",
      blocks: [
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap items-end gap-4">
              {Object.entries(controlHeight).map(([name, value]) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div
                    className="flex w-28 items-center justify-center rounded-control border border-neutral-default bg-neutral-subtle font-mono text-body-sm text-neutral-subtle"
                    style={{ height: value }}
                  >
                    {value}
                  </div>
                  <span className="font-mono text-body-sm text-neutral-subtle">{name}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Token", mono: true, width: 1 },
            { key: "value", header: "Valor", mono: true, width: 0.6 },
            { key: "use", header: "Dónde", width: 2.4 },
          ],
          rows: [
            { token: "size.control.sm", value: controlHeight.sm, use: "Dentro de tablas y barras de herramientas" },
            { token: "size.control.md", value: controlHeight.md, use: "Por defecto en formularios" },
            { token: "size.control.lg", value: controlHeight.lg, use: "Acción principal y todo lo táctil" },
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: `En táctil el área activable nunca baja de ${touchTarget}`,
          text: "Aunque el control se vea más pequeño, su área de toque alcanza el mínimo. Un control de 32px dentro de una tabla sigue siendo alcanzable con el pulgar.",
        },
      ],
    },
    {
      id: "capas",
      label: "Capas",
      blocks: [
        {
          kind: "prose",
          text: "Seis valores, ninguno intermedio. Un componente elige la capa a la que pertenece, no un número que espera que sea suficientemente alto.",
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Capa", mono: true, width: 1.2 },
            { key: "value", header: "Valor", mono: true, width: 0.5 },
            { key: "use", header: "Qué vive ahí", width: 2.2 },
          ],
          rows: [
            { token: "layer.content", value: layer.content, use: "El contenido de la página" },
            { token: "layer.sticky-table-header", value: layer.stickyTableHeader, use: "Cabecera de tabla fija" },
            { token: "layer.navigation", value: layer.navigation, use: "Rail y barra superior" },
            { token: "layer.overlay", value: layer.overlay, use: "Cajón y modal" },
            { token: "layer.menu", value: layer.menu, use: "Popover y menú" },
            { token: "layer.notification", value: layer.notification, use: "Tooltip y toast" },
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Un z-index de 9999 es síntoma, no solución",
          text: "Aparece cuando las capas nunca se nombraron. Si un elemento necesita un valor que no está en esta tabla, lo que hay mal resuelto es el layout.",
        },
      ],
    },
    {
      id: "radios",
      label: "Radios",
      blocks: [
        {
          kind: "prose",
          text: "Esquinas contenidas: el redondeo excesivo lee como software de consumo, no como herramienta. Los controles y los contenedores usan radios distintos, de modo que la forma ya insinúa qué es clicable, y la píldora se reserva a piezas que no son controles.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-4">
              {Object.entries(radius).map(([name, value]) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-12 bg-neutral-selected"
                    style={{ borderRadius: value }}
                  />
                  <span className="font-mono text-body-sm text-neutral-subtle">
                    {name} · {value}
                  </span>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "table",
          columns: [
            { key: "token", header: "Token", mono: true, width: 1 },
            { key: "value", header: "Valor", mono: true, width: 0.6 },
            { key: "use", header: "Dónde", width: 2.4 },
          ],
          rows: [
            { token: "radius.control", value: radius.control, use: "Controles y campos" },
            { token: "radius.surface", value: radius.surface, use: "Tarjetas, modales y menús" },
            { token: "radius.pill", value: "pill", use: "Chips y avatares. Nunca un control" },
          ],
        },
      ],
    },
    {
      id: "borde",
      label: "Ancho de borde",
      blocks: [
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap gap-6">
              {Object.entries(borderWidth).map(([name, value]) => (
                <div key={name} className="flex flex-col items-center gap-1">
                  <div
                    className="h-12 w-24 rounded-control bg-neutral-default"
                    style={{
                      borderStyle: "solid",
                      borderWidth: value,
                      borderColor: "var(--color-border-neutral-default)",
                    }}
                  />
                  <span className="font-mono text-body-sm text-neutral-subtle">
                    {name} — {value}
                  </span>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
    {
      id: "motion",
      label: "Motion",
      blocks: [
        {
          kind: "prose",
          text: "Duraciones cortas y curvas suaves: la animación en una herramienta de trabajo confirma que algo pasó, no entretiene. Todo lo que dure más que el paso largo se percibe como lentitud de la aplicación.",
        },
        {
          kind: "table",
          columns: [
            { key: "group", header: "Grupo", width: 0.8 },
            { key: "token", header: "Token", mono: true, width: 1 },
            { key: "value", header: "Valor", mono: true, width: 2 },
          ],
          rows: [
            ...Object.entries(motion.duration).map(([name, value]) => ({
              group: "Duración",
              token: name,
              value,
            })),
            ...Object.entries(motion.easing).map(([name, value]) => ({
              group: "Easing",
              token: name,
              value,
            })),
          ],
        },
      ],
    },
  ],
};
