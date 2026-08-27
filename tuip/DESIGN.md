---
name: Tuya UI
description: Sistema de diseño de Tuya CA — tokens en dos capas, componentes React y una sola luz roja que dice dónde actuar.
colors:
  # Marca (escala brand). Los valores son el tema claro; el oscuro reasigna los mismos primitivos (ver Colors).
  tuya-red: "#ED1C29"
  tuya-red-action: "#C9151F"
  tuya-red-action-hover: "#A21018"
  tuya-red-action-pressed: "#7A0C12"
  tuya-red-mid: "#FF9AA1"
  tuya-red-tint: "#FFF1F2"
  tuya-red-night: "#F8626C"
  # Neutros fríos (escala neutral)
  graphite-cold: "#26262C"
  graphite-subtle: "#55555E"
  slate-gray: "#74747E"
  ash: "#A0A0A8"
  line-neutral: "#E3E3E6"
  line-soft: "#74747E2E"
  surface: "#FFFFFF"
  surface-subtlest: "#FAFAFB"
  surface-subtle: "#F4F4F5"
  surface-subtle-hover: "#EFEFF0"
  fog-canvas: "#F6F6F7"
  night-canvas: "#0E0E11"
  night-surface: "#17171B"
  night-surface-raised: "#26262C"
  night-line: "#3C3C44"
  night-text: "#FAFAFB"
  # Halos de foco (translúcidos, se componen sobre cualquier superficie)
  focus-ring-brand: "#ED1C294D"
  focus-ring-neutral: "#74747E4D"
  # Velo detrás de una superficie bloqueante: oscuro en los dos temas
  scrim: "#26262C66"
  night-scrim: "#0E0E1199"
  # Estado: tinte (100) · tono (600) · texto (800)
  danger-tint: "#FBE9EA"
  danger-deep: "#8E0F18"
  danger-text: "#700C13"
  warning-tint: "#FBF2DE"
  warning-amber: "#B57A00"
  warning-text: "#6E4B00"
  success-tint: "#E7F3EC"
  success-green: "#116B4B"
  success-text: "#0D5239"
  info-tint: "#E8F0FC"
  info-blue: "#1B5FBF"
  info-text: "#154A96"
  discovery-tint: "#EFEAFB"
  discovery-violet: "#5B3FC4"
  discovery-text: "#3D2894"
typography:
  display:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: "40px"
  headline:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
  title:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "26px"
  body:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "26px"
  body-sm:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.09em"
  metric:
    fontFamily: "IBM Plex Sans, system-ui, -apple-system, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: "40px"
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
rounded:
  none: "0px"
  compact: "4px"
  control: "8px"
  surface: "12px"
  pill: "9999px"
spacing:
  hug: "4px"
  inline: "8px"
  stack: "12px"
  group: "16px"
  inset: "24px"
  block: "32px"
  section: "48px"
  page-top: "64px"
  page-bottom: "96px"
components:
  button-primary:
    backgroundColor: "{colors.tuya-red-action}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.tuya-red-action-hover}"
  button-primary-active:
    backgroundColor: "{colors.tuya-red-action-pressed}"
  button-primary-small:
    padding: "4px 12px"
    height: "32px"
  button-primary-large:
    typography: "{typography.body}"
    padding: "10px 20px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-subtle-hover}"
  button-subtle:
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-subtle-hover:
    backgroundColor: "{colors.surface-subtle-hover}"
  button-danger:
    backgroundColor: "{colors.danger-deep}"
    textColor: "{colors.surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
    height: "40px"
  button-link:
    textColor: "{colors.tuya-red-action}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "40px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.surface}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.tuya-red-tint}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  chip-filter:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  chip-filter-selected:
    backgroundColor: "{colors.graphite-cold}"
    textColor: "{colors.surface}"
  badge:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.success-text}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "4px 10px"
  tag:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    width: "40px"
  table-header-cell:
    backgroundColor: "{colors.surface-subtlest}"
    textColor: "{colors.graphite-subtle}"
    typography: "{typography.label}"
    padding: "8px 16px"
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    padding: "12px 16px"
  table-cell-compact:
    padding: "6px 12px"
  modal:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-cold}"
    rounded: "{rounded.surface}"
    padding: "24px 24px 12px"
    width: "480px"
  modal-footer:
    backgroundColor: "{colors.surface-subtle}"
    padding: "16px 24px"
  select:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
    height: "40px"
  select-item:
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  select-item-highlighted:
    backgroundColor: "{colors.tuya-red-tint}"
  navbar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.graphite-cold}"
    height: "56px"
    padding: "0 20px"
  sidebar-item-active:
    backgroundColor: "{colors.tuya-red-tint}"
    textColor: "{colors.graphite-cold}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.control}"
    padding: "0 10px"
---

# Design System: Tuya UI

## Overview

**Creative North Star: "El Tablero de Control"**

Una sala de operaciones serena: todo lo que hay en pantalla es neutro, frío y legible —grises
con un grado de azul, IBM Plex Sans a 16px, cifras tabulares— y una sola luz encendida, el rojo
Tuya, solo donde el sistema quiere que la mirada vaya: un botón primario por vista, el riel de la
sección activa, el halo de foco. Esa escasez es lo que lo convierte en señal.

El tono es **sereno, preciso, denso y cercano**. Cada medida es una decisión cerrada (siete
estilos de texto, tres alturas de control, contraste AA verificado en el build); las pantallas
son de gestión, diseñadas primero a 1440px; y el sistema explica el porqué de sus reglas en
voseo. Rechaza, confirmado: el look genérico de plantilla (grises cálidos, Inter, radios y
sombras de kit), degradados y vidrio en la interfaz, y el color como único canal de significado.

**Key Characteristics:**
- Un solo acento cromático (rojo Tuya) reservado a la acción primaria, la navegación activa y el
  foco; todo lo demás vive en neutros fríos.
- Tokens en dos capas: primitivos → semánticos nombrados por rol (`bg/text/border/icon` × rol ×
  énfasis × estado). Los componentes solo tocan la capa semántica.
- Tema oscuro escrito a mano, no invertido: las superficies se separan por claridad, los acentos
  se aclaran, el texto nunca es blanco puro.
- Escalas cerradas: 7 estilos de texto, 3 alturas de control (32/40/48), 4 radios, 6 capas de
  z-index, 4 tamaños de icono (16/20/24/32).
- Cuatro vocabularios de color que responden preguntas distintas: semántico («qué es»),
  identidad («quién es»), acento («cuánto»), atención («cuánto urge»).
- Sombras que solo caen hacia abajo: la luz viene de arriba, el borde delimita y la sombra eleva.

## Colors

Una paleta casi monocroma de grises fríos, un rojo que señala, y cinco familias de estado que se
distinguen por matiz **y** por forma o texto.

### Primary
- **Rojo Tuya** (#ED1C29): el rojo de marca en su papel puro. Vive donde no hay texto encima: el
  halo y el borde de foco, el borde de marca, el riel izquierdo de la sección activa en el
  sidebar, el punto de notificación sin leer, el cuadrado del logo en la barra superior. Contra
  blanco mide 4.38:1 —suficiente para un elemento gráfico (3:1), no para texto.
- **Rojo Tuya Acción** (#C9151F): el paso 600, un escalón más profundo, es el fondo del botón
  primario y el color del texto de marca (el enlace, el «actual» del selector de aplicaciones).
  Existe porque blanco sobre #ED1C29 no llega a AA, y el piso AA manda sobre la literalidad del
  color de marca. Hover baja a #A21018, pressed a #7A0C12: la secuencia entera se corre un paso.
- **Rojo Tuya Medio** (#FF9AA1): el peldaño intermedio de una escala de intensidad (barra
  segmentada), nunca superficie para texto ni límite de interfaz.
- **Tinte Tuya** (#FFF1F2): la selección. Fila activa de tabla, ítem activo del sidebar, chip de
  filtro aplicado. Es «rojo» tan diluido que ya no señala acción, solo pertenencia.
- **Rojo Tuya Noche** (#F8626C): en tema oscuro el rojo se aclara al paso 400 para sostener el
  contraste sobre #17171B; hover 300, pressed 200 —«menos intenso» en oscuro va hacia el
  fondo, no hacia el blanco.

### Neutral
- **Grafito Frío** (#26262C): texto por defecto y, como fondo, el estado seleccionado de un chip
  de filtro y la superficie «bold». Nunca negro puro.
- **Grafito Sutil** (#55555E): texto secundario, iconos por defecto. El gris con el que se escribe
  todo lo que acompaña.
- **Gris Pizarra** (#74747E): el único paso medio que supera 3:1 contra blanco y contra casi
  negro. Por eso es el texto más claro aún legible, el borde «bold» que sí delimita, el fondo
  «strong» de un control apagado, y la base (al 18%) del trazo suave.
- **Ceniza** (#A0A0A8): texto e iconos deshabilitados.
- **Línea Neutra** (#E3E3E6): el borde estándar de cards, campos, cabeceras y divisores; también
  el fondo «pressed» de una superficie sutil.
- **Línea Suave** (#74747E al 18% → #74747E2E): trazo translúcido para insinuar un borde sin
  declararlo (botón secundario). Compone a ~1.2:1: presente, no perceptible como límite.
- **Superficie** (#FFFFFF): cards, campos, barra superior y sidebar. La misma blancura para toda
  la cáscara, a propósito: el shell se lee como una sola pieza.
- **Superficie Sutilísima** (#FAFAFB) y **Superficie Sutil** (#F4F4F5): el lienzo de la página
  (un paso bajo la card) y los rellenos neutros (botón secundario, celda de adorno de un campo,
  fondo de badge neutro). Hover #EFEFF0, pressed #E3E3E6.
- **Lienzo Niebla** (#F6F6F7): un blanco roto un grado más frío, fuera de la escala, con
  exactamente dos consumidores: el cuerpo de la página y la barra de breadcrumb.
- **Noche** (#0E0E11 lienzo · #17171B superficie · #26262C elevada · #3C3C44 línea · #FAFAFB
  texto): el tema oscuro. La card está «encima» del lienzo por ser más clara, no por proyectar
  sombra.

### Status (tinte · tono · texto)
Cada familia se documenta en cinco pasos y se usa siempre con el mismo emparejamiento: el tinte
(100) de fondo bajo el texto profundo (800); el tono (600) para el relleno sólido, el borde, el
icono y el punto de estado. En oscuro el tinte se vuelve el paso 900 y el texto el 400; el tono
sólido no cambia porque carga su propio contraste.
- **Peligro** (#FBE9EA · #8E0F18 · #700C13): un rojo profundo, deliberadamente distinto del rojo
  Tuya. Un error nunca puede confundirse con la acción primaria.
- **Advertencia** (#FBF2DE · #B57A00 · #6E4B00): ámbar. Único tono sólido que lleva texto oscuro
  encima (#17171B), porque la luz del ámbar no sostiene texto blanco.
- **Éxito** (#E7F3EC · #116B4B · #0D5239): verde bosque.
- **Información** (#E8F0FC · #1B5FBF · #154A96): azul.
- **Descubrimiento** (#EFEAFB · #5B3FC4 · #3D2894): violeta; lo nuevo, lo beta.

### Vocabularios aparte
- **Identidad** (12 matices de la paleta de personas de Fluent/Teams; fondo = tono al 15% sobre
  blanco, texto = shade20): distinguen a una persona de otra. Nunca significan estado.
- **Acento** (celeste #93C5FD → azul #2563EB → violeta #7C3AED → magenta #A21CAF; en oscuro
  #38BDF8 / #60A5FA / #A78BFA / #E879F9): los pasos de una escala ordinal (nivel, criticidad,
  madurez). Solo relleno de gráficos, nunca texto.
- **Atención** (bajo = ámbar #B57A00 · medio = mezcla de rojos · alto = #8E0F18, el mismo rojo
  que peligro): gradúa cuánta atención pide algo en un mapa de calor. No hay paso «sin
  atención»: lo que está en orden va en neutro.

### Named Rules
**The One Red Rule.** El rojo Tuya aparece en una sola acción por vista, en la posición actual de
la navegación y en el foco. Un badge, un tag, un chip, un gráfico nunca son «brand»: ese rol no
está disponible para ellos, y ni la API lo ofrece.

**The AA Over Literal Rule.** Cuando el color de marca y el contraste AA no pueden ser ambos
ciertos, gana el contraste y la secuencia entera se corre un paso. Ningún color de texto se
elige por parecido a la marca.

**The Never-Hue-Alone Rule.** Nada comunica solo por color. Badge lleva punto y texto; Tag es
píldora y Badge es cuadrado; el error lleva mensaje; el icono de estado tiene forma propia. Uno
de cada doce hombres no distingue rojo de verde.

**The Four Vocabularies Rule.** Semántico dice qué es, identidad dice quién es, acento dice
cuánto, atención dice cuánto urge. No se prestan pasos entre sí: `accent.blue` no es `info`, y
una persona nunca es `danger`.

## Typography

**Display Font:** IBM Plex Sans (fallback system-ui, -apple-system, sans-serif)
**Body Font:** IBM Plex Sans (la misma familia carga toda la interfaz, cifras incluidas)
**Label/Mono Font:** IBM Plex Mono (fallback ui-monospace, SFMono-Regular, Consolas, monospace),
solo para cadenas literales: IDs, ramas, código.

**Character:** una sola familia humanista-técnica con formas abiertas que aguantan 12px en una
tabla densa y con pesos suficientes para construir jerarquía sin volverse genérica. Los números
de negocio van en `tabular-nums` para que una columna se compare de un vistazo sin recurrir a
la mono, cuyo aire de terminal se reserva para lo que de verdad es literal.

### Hierarchy
- **Display** (semibold 600, 34px / 40px): título de pantalla. Uno por vista, arriba a la
  izquierda.
- **Headline** (semibold 600, 24px / 32px): título de sección o de panel.
- **Title** (semibold 600, 18px / 26px): título de card.
- **Body** (regular 400, 16px / 26px): el default —párrafos, celdas de tabla, valores de
  formulario. 16px porque entre los lectores hay usuarios ocasionales y externos; no está
  optimizado para el experto. Prosa hasta 680px de ancho (~75 caracteres).
- **Body Small** (regular 400, 14px / 22px): texto de ayuda, metadatos, tablas compactas, y el
  texto de casi todos los controles (botones, campos, chips, badges, navegación).
- **Label** (semibold 600, 12px / 16px, tracking 0.09em, MAYÚSCULAS): cabecera de columna,
  rúbrica de grupo en el sidebar («Aplicaciones internas»), pequeñas etiquetas de sección.
- **Metric** (bold 700, 40px / 40px, tracking −0.04em, tabular): la cifra que encabeza un
  indicador —el valor que una summary card existe para mostrar. Interlineado igual al tamaño
  porque es una sola línea; el tracking negativo evita que los dígitos se separen.

Cuatro pesos, cada uno con un rol: regular (cuerpo), medium (énfasis de interfaz: botones,
badges, tags, ítem de menú), semibold (títulos, label, ítem activo), bold (solo `metric`).

### Named Rules
**The No Eighth Step Rule.** Siete estilos y ninguno más. Una pantalla que parece necesitar un
tamaño intermedio tiene un problema de jerarquía, no un paso faltante: se cambia de nivel, no se
inventa un tamaño. Cada estilo empaqueta tamaño, interlineado y peso para que no exista una
combinación que nadie aprobó (`text-body-sm` es una sola utilidad, no tres).

**The Tabular Figures Rule.** Toda cifra que se compare verticalmente —tabla, lista de
indicadores, columna de métricas— lleva `tabular-nums`. La mono no es para números; es para
texto que es literalmente una cadena.

## Layout

El sistema es un **shell de aplicación compartido** (tokens `shell.*`): barra superior fija de
56px (48px bajo 960px en la Navbar suelta), riel lateral de 248px que colapsa a 64px de solo
iconos, y el contenido en un lienzo un paso más oscuro que las superficies. La cabecera de marca
del riel mide lo mismo que la barra y comparte su filete, así la línea corre continua de borde a
borde. Quien aprende a moverse en una aplicación Tuya se mueve en todas.

**Breakpoints y comportamiento** (640 / 1024 / 1440 / 1920):
- **< 640:** una columna. Navegación en cajón superpuesto. Las tablas se vuelven tarjetas
  apiladas, sin scroll horizontal.
- **640–1023 (8 columnas):** riel colapsado a iconos. Indicadores en 2×2. Los paneles laterales
  se superponen en vez de dividir la pantalla.
- **1024–1439 (12 columnas):** layout completo, riel expandido. El mínimo para el que se diseñan
  las pantallas de gestión.
- **1440–1919:** el ancho de trabajo objetivo. Todo se diseña primero acá.
- **≥ 1920:** el contenido se topa en 1728px y se centra. Las tablas siguen creciendo: más ancho
  es más columnas visibles.

**Ritmo de espaciado:** base 4px, nueve pasos (4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96) y un
alias por relación, que es lo que se usa al maquetar: `hug` 4 (punto y su texto), `inline` 8
(icono y label dentro de un botón), `stack` 12 (label y su campo), `group` 16 (dos campos del
mismo bloque), `inset` 24 (padding interior de cards, paneles y modales), `block` 32 (bloques de
una sección), `section` 48 (entre secciones), `page-top` 64 (aire bajo la barra), `page-bottom`
96 (cierre del scroll).

**Anchos máximos por tipo de contenido:** prosa 680px, formulario 640px, panel 480px, página
1728px. Los datos no se topan: una tabla siempre agradece más ancho.

**Superficies flotantes:** modal 480 / 640 / 880px (nunca pantalla completa en desktop), drawer
480 / 720px (detalle de fila sin perder la tabla), popover 280–360px (filtros de columna),
tooltip 240px («una frase; si necesita dos, era un popover»).

**Alturas de control:** 32px (dentro de tablas y toolbars), 40px (default en formularios), 48px
(acción primaria y todo lo que se toque). Nada entre las tres. Área táctil mínima 44px aunque
el control mida 32.

**Capas (z-index):** contenido 0 · cabecera de tabla fija 10 · navegación 100 · overlay 400 ·
menú 600 · notificación 800. Un componente elige su capa, no un número que espera sea alto.

### Named Rules
**The Belonging Gap Rule.** El espacio comunica pertenencia: el hueco dentro de un grupo es
siempre menor que el hueco entre grupos. Cuando son iguales, nadie sabe dónde termina una idea.

**The Data Welcomes Width Rule.** El texto se topa a ~75 caracteres porque el ojo pierde la línea;
la tabla no se topa nunca, porque más ancho son más columnas visibles.

## Elevation & Depth

Plano con sombra estructural. Las superficies están en reposo sobre el lienzo y se distinguen de
él por un escalón de gris (lienzo #FAFAFB → card #FFFFFF); el **borde delimita** y la **sombra
eleva**, dos funciones distintas que por eso conviven en la misma card. Ninguna sombra es
ambiental ni decorativa: todas dicen literalmente «esto está por encima de aquello». En tema
oscuro la sombra desaparece de la ecuación y la altura se expresa por claridad (lienzo #0E0E11
→ superficie #17171B → elevada #26262C).

### Shadow Vocabulary
Cada paso se lee como luz desde arriba: más desplazamiento que desenfoque, y un spread negativo
que recoge los lados para que nada asome por el borde superior. Un paso cuyo blur se extiende
tanto a los lados como cae hacia abajo no es elevación: es una mancha calcando el contorno.
- **Raised · sm** (`0 2px 4px -1px rgb(0 0 0 / 0.08)`): cards en reposo. Superficie `subtle`
  + sombra sm es el par de elevación «raised».
- **Menu · md** (`0 4px 8px -2px rgb(0 0 0 / 0.10)`): menús desplegables, popovers, el selector
  de aplicaciones.
- **Overlay · lg** (`0 12px 24px -4px rgb(0 0 0 / 0.14)`): modales y drawers. Superficie
  `default` + sombra lg es el par «overlay».
- **Edge** (`2px 0 4px -1px rgb(0 0 0 / 0.08)`): la única que no viene de arriba porque no es
  elevación: es la costura de una columna congelada proyectada sobre el contenido que se
  desliza debajo. Es `sm` girada al eje horizontal, para que las dos nunca parezcan materiales
  distintos.
- **Sunken**: superficie `subtlest` sin sombra. Lo hundido no proyecta.

### Named Rules
**The Light From Above Rule.** Toda sombra de elevación cae hacia abajo y nunca asoma por arriba.
Una sombra que rodea el elemento por igual no existe en el sistema.

**The Border Delimits, Shadow Lifts Rule.** La sombra no puede definir el borde superior de una
superficie porque se proyecta hacia abajo; por eso toda superficie elevada lleva además su trazo
de #E3E3E6. Quitar uno de los dos deja la card a medias.

## Shapes

Esquinas redondeadas con moderación y jerarquía: la diferencia de radio insinúa qué es clicable
—el control siempre queda por debajo de la superficie que lo contiene— y ambos se escalaron
juntos hacia un redondeo algo más pronunciado que el de un kit genérico.

- **Compact** (4px): controles de 16px de lado o menos, como el checkbox. Un radio no escala: a
  32px, 8px es una esquina; a 16px es medio lado, o sea un círculo, y un checkbox circular dice
  «elegí uno» mientras acepta varios.
- **Control** (8px): botones, campos, chips, badges, ítems del sidebar, la miniatura de logo
  (24×24 rojo Tuya) de la barra superior.
- **Surface** (12px): cards, modales, menús, drawers.
- **Pill** (9999px): solo tags y avatares, el punto de estado del badge y el contador del
  sidebar. Nunca un control.

**Bordes:** 1px (`default`) para todo trazo; 2px (`bold`) solo para el riel izquierdo del ítem
activo del sidebar y el spinner. Todo botón lleva borde aunque sea transparente, para que las
variantes midan lo mismo.

**Foco:** un anillo de 3px sin separación, translúcido (el color base del control al 30%: rojo
para primario y link, gris para secundario y campos, rojo peligro para danger y campos con
error). Ancho porque es translúcido; sin gap porque el gap se pintaba de blanco y sobre cualquier
otra superficie era una banda de nadie. El control se lee como él mismo iluminado, no como un
aro ajeno encima.

**Iconos:** retícula 24×24, trazo 1.5px uniforme que no escala, terminales y uniones redondas,
solo contorno (el único relleno admitido es el punto de estado). Tamaños 16 (dentro de texto y
tablas compactas), 20 (botones y navegación), 24 (cabeceras y estados vacíos), 32 (solo la
ilustración de un estado vacío). Nada entre ellos: 18 o 22 desenfocan el trazo.

### Named Rules
**The Control Under Surface Rule.** El radio de un control (8px) siempre es menor que el de la
superficie que lo contiene (12px). Un botón con el radio de una card deja de parecer un botón.

**The Pill Is Never A Control Rule.** La píldora identifica (tag, avatar, contador); nunca se
acciona. Un botón redondo es un botón de otro sistema.

## Components

Los controles son **contenidos y exactos**: radio 8px, un solo trazo, sin relieve, y el foco
ilumina el control con su propio color. Nada grita. Todas las transiciones de estado son
`transition-colors` a 200ms con `cubic-bezier(0.2, 0, 0, 1)` (`duration-normal ease-standard`).

**Motion: cada superficie llega desde donde viene.** El movimiento confirma que algo pasó y dice
de dónde salió; no entretiene. Cuatro recetas (`animate-*`, definidas en tokens) cubren todas
las superposiciones, una por clase de superficie, para que dos superficies de la misma clase no
puedan llegar distinto por accidente:
- **fade** (200ms entrada / 100ms salida): el velo detrás de una superficie bloqueante, y la
  salida de todo lo que no necesita dirección.
- **panel** (200 / 100): una superficie centrada —Modal, Command Palette— se asienta desde 8px
  más abajo y un 2% más chica, como una tarjeta apoyada en el escritorio.
- **float** (100 / 100): una superficie anclada —Menu, Popover, Select, Combobox, Tooltip—
  crece desde el borde de su ancla (`transform-origin` = el origen que Radix publica), así el ojo
  lee a qué control pertenece.
- **slide** (300 / 200): una superficie que entra por un borde —Drawer, Toast— viaja su propio
  ancho; es la única en el paso lento porque la distancia, no la importancia, fija la duración.

Entradas con `cubic-bezier(0, 0, 0.2, 1)`, salidas siempre más cortas y con
`cubic-bezier(0.4, 0, 1, 1)`. Nunca más de 300ms. Bajo `prefers-reduced-motion` cada receta
conserva su fundido y pierde el desplazamiento: se hereda de los `@keyframes`, ningún componente
lo declara. Hover y foco no se animan más allá de `transition-colors`; ningún elemento se mueve
al pasar el puntero.

### Buttons
- **Shape:** esquinas de control (8px), borde 1px siempre presente (transparente salvo en
  secondary) para que todas las variantes ocupen la misma caja. Texto medium.
- **Primary:** fondo Rojo Tuya Acción (#C9151F), texto blanco, padding 8px 16px (40px de alto);
  small 4px 12px (32px), large 10px 20px con body 16px (48px). Es **la** acción de la vista:
  una por pantalla.
- **Hover / Active / Focus:** hover #A21018, pressed #7A0C12; foco = anillo 3px de rojo Tuya al
  30%. Cargando: spinner circular de borde 2px en `currentColor` y `aria-busy`. Deshabilitado:
  50% de opacidad y cursor `not-allowed`.
- **Secondary:** fondo Superficie Sutil (#F4F4F5), Línea Suave translúcida, texto Grafito;
  hover #EFEFF0, pressed #E3E3E6, foco gris al 30%.
- **Subtle:** transparente, texto Grafito; hover y pressed como secondary. Sin caja a propósito.
- **Danger:** fondo Peligro Profundo (#8E0F18), texto blanco; hover #700C13, pressed #331416.
- **Link:** texto Rojo Tuya Acción subrayado (offset 2px), hover con fondo sutil; parece texto
  enlazado y no un botón.

### Chips
- **Style:** esquinas de control (8px), padding 4px 10px, body-sm, gap 6px.
- **Removable (filtro aplicado):** fondo Tinte Tuya (#FFF1F2), texto Grafito, botón × de 16px
  en Grafito Sutil que se oscurece al hover.
- **Selectable (filtro conmutable):** en reposo fondo blanco con Línea Neutra, hover #EFEFF0;
  **seleccionado = fondo Grafito Frío con texto blanco**, nunca rojo: un filtro encendido no es
  la acción primaria. Contador opcional en tabular-nums.

### Badge vs Tag
- **Badge** (estado, `role="status"`): cuadrado de control (8px), padding 4px 10px, body-sm
  medium, tinte de la familia bajo su texto profundo (#E7F3EC/#0D5239, #E8F0FC/#154A96,
  #FBF2DE/#6E4B00, #FBE9EA/#700C13, #EFEAFB/#3D2894, #F4F4F5/#26262C) y un punto de 6px en el
  tono 600. El punto dice «esto es una condición que puede dejar de pasar»; se apaga para una
  clasificación fija. `brand` no existe como variante.
- **Tag** (pertenencia a un conjunto): píldora, padding 2px 10px, ancho mínimo 40px para que
  «XS» y «L» midan igual en una columna; mismo tinte/texto que Badge por matiz nombrado por
  color (gray, green, blue, amber, red, purple), sin punto y sin rol ARIA. Forma y ausencia de
  punto son lo que los distingue: ninguno es decoración.

### Cards / Containers
- **Corner Style:** superficie (12px).
- **Background:** blanco sobre lienzo #FAFAFB (o Lienzo Niebla en el cuerpo de página).
- **Shadow Strategy:** `sm` en reposo (par «raised»). Ver Elevation.
- **Border:** 1px Línea Neutra (#E3E3E6), el mismo trazo estándar del catálogo —se probó el
  translúcido y la diferencia era 1.03:1, o sea nada, y solo dejaba a Card como excepción.
- **Internal Padding:** header, body y footer a 12px 16px; header y footer separados por el
  mismo trazo del contorno para que la card se lea como una pieza.

### Inputs / Fields
- **Style:** blanco, borde 1px Línea Neutra, esquinas de control (8px), padding 8px 12px,
  body-sm en Grafito (40px de alto). Label encima con `stack` 12px; hint o error debajo.
- **Adornos (prefijo/sufijo):** una celda propia del control —fondo Superficie Sutil, filete
  divisorio, texto Grafito Sutil— para que «COP» o «FTE» se lean como parte del campo y no como
  algo que el usuario escribió.
- **Focus:** anillo 3px gris al 30% (rojo peligro al 30% si hay error); sin outline nativo.
- **Error / Disabled:** error marca borde y anillo en Peligro; deshabilitado usa fondo #EFEFF0,
  texto Ceniza y cursor `not-allowed`. `required` pone asterisco y `aria-required` pero nunca el
  atributo nativo, para que la validación siga siendo del formulario.

### Tables
- **Frame:** cuando lleva toolbar o footer, un solo marco de superficie (12px, trazo Línea
  Neutra, fondo blanco) rodea toolbar + tabla + pie; sin slots, la tabla empieza en su cabecera.
  El pie es «casi blanco» (#FAFAFB) como un `tfoot`: es un pie, no más contenido.
- **Cabecera:** fondo Superficie Sutilísima (#FAFAFB); celdas en **Label** (12px, 0.09em,
  MAYÚSCULAS) en bold y Grafito Sutil, siempre con menos padding vertical que el cuerpo (8px vs
  12px en comfortable). Cabecera ordenable: botón que pasa a Grafito y a Rojo Tuya Acción al
  hover; el chevron de dirección se pinta en rojo de marca —es «posición actual», no acción.
- **Cuerpo:** body-sm en Grafito, filas separadas por 1px Línea Neutra, hover #FAFAFB. Tres
  densidades por contexto, nunca por gusto: **comfortable** 12px 16px, **compact** 6px 12px,
  **matrix** 4px 8px (una celda con un medidor o un dígito, donde el padding que hace legible
  al texto separa tanto las columnas que el ojo ya no compara filas).
- **Columnas numéricas:** `align="right"` arrastra `tabular-nums` consigo; no existe la
  combinación «alineada a la derecha con dígitos proporcionales».
- **Primera columna congelada:** las celdas mismas son `sticky` (una sola `<table>`, semántica
  nativa intacta); cada sección conserva su propio fondo y la costura `edge` aparece solo cuando
  hay algo oculto a la izquierda.
- **Fila de detalle:** se expande bajo la fila con padding comfortable sea cual sea la densidad,
  sobre #FAFAFB.

### Modals
- **Uso:** para decidir, no para consultar; bloquea la página hasta que el usuario responde. Sin
  disparador incorporado: quien lo abre es dueño de `open`/`onOpenChange`, y el foco vuelve a
  ese elemento al cerrar.
- **Overlay:** el velo `scrim` —Grafito Frío al 40% en claro, Noche (#0E0E11) al 60% en
  oscuro—, capa `overlay` (400). Tiene token propio porque debe ser oscuro en los dos temas:
  empuja la página hacia atrás, y eso se hace con sombra sea cual sea el tema.
- **Panel:** 480px por defecto (640 / 880 si hace falta; nunca pantalla completa en desktop),
  máx. 85vh, superficie (12px), **trazo Línea Neutra + sombra lg**: la sombra cae hacia abajo y
  dejaba el borde superior sin definir, que es justo donde el diálogo se fundía con la pantalla.
- **Anatomía:** cabecera 24px 24px 0 con título Heading MD (18px semibold) y cierre en icono 20px
  Grafito Sutil; cuerpo 12px 24px en body-sm Grafito Sutil con scroll propio; pie 16px 24px sobre
  Superficie Sutil con trazo superior y las acciones alineadas a la derecha con gap 12px
  (secundario antes que primario).

### Selects / Menus
- **Disparador:** misma receta que el campo de texto (blanco, 1px Línea Neutra, 8px, 40px,
  body-sm) con chevron de 16px a la derecha; placeholder en Grafito Sutil; error y foco como en
  Inputs.
- **Menú desplegable:** superficie de control (8px) con trazo Línea Neutra y sombra **md**, capa
  `menu` (600), padding interior 4px, alto máximo 256px con scroll.
- **Ítem:** 8px 12px, esquinas de control, body-sm; **resaltado = fondo Tinte Tuya** (#FFF1F2),
  el mismo paso de selección que la fila activa y el ítem de sidebar; el elegido lleva un check
  de 16px; deshabilitado en Ceniza con cursor `not-allowed`. El mismo patrón sirve para Menu, el
  selector de aplicaciones de la barra (300px, rúbrica label en mayúsculas) y Combobox.

### Navigation
- **Barra superior:** sticky, 48px (56px desde 960px), padding horizontal 20px, blanca con
  borde inferior Línea Neutra en su variante clara; **variante oscura** en Grafito Noche
  (#17171B) con texto #FFFFFF y hover en #26262C. Logo = cuadrado 24px Rojo Tuya Acción + nombre
  del producto en body-sm semibold; selector de aplicaciones como menú de 300px con rúbrica
  label en mayúsculas; campo de búsqueda con atajo visible; campana con punto rojo de 8px;
  avatar con menú de cuenta. Enlace «Saltar al contenido» visible solo con foco.
- **Sidebar:** 248px / 64px colapsado, misma superficie blanca que la barra clara (mismo token,
  a propósito) con borde derecho Línea Neutra. Grupos con rúbrica label en Gris Pizarra; ítems
  body-sm con icono de 20px, esquinas de control, riel izquierdo de 2px. **Activo:** riel Rojo
  Tuya + fondo Tinte Tuya + semibold. **Inactivo:** texto Grafito Sutil, hover #EFEFF0. Activo,
  hover y reposo difieren por tono y no por claridad, para que sean tres estados. Contador en
  píldora Rojo Tuya Acción. Colapsado: tooltip a la derecha.

### Signature: indicadores de capacidad
CapacityBar, SegmentedBar, LevelMeter, Meter, DistributionCard, SeniorityCard y Sparkline son el
vocabulario propio del sistema: rellenos sin texto encima que se leen por su color junto a una
leyenda. Usan la escala de **acento** para pasos ordinales (celeste → magenta), la de
**atención** para urgencia (ámbar → rojo profundo), los estados semánticos cuando el color
significa estado, y el Rojo Tuya Medio como peldaño de intensidad de marca. SeniorityCard mide
116px de ancho fijo (72px sin etiqueta) por 44px (36px compacta) para que el nivel de una fila
se compare con el de otra. La cifra que encabeza un indicador va en **Metric** (40px bold
tabular); una cifra dentro de un cuadro coloreado va al lado, nunca adentro.

## Do's and Don'ts

### Do:
- **Do** reservar el rojo Tuya (#ED1C29 / #C9151F) a una acción primaria por vista, la posición
  actual en la navegación y el anillo de foco.
- **Do** consumir solo la capa semántica (`bg-brand-bold`, `text-neutral-subtle`,
  `border-neutral-default`); los primitivos y los hex sueltos fallan el build.
- **Do** usar los siete estilos de texto como utilidades cerradas (`text-body-sm`, `text-label`)
  y `tabular-nums` en toda cifra que se compare.
- **Do** emparejar estado con forma o texto: punto + texto en Badge, píldora vs cuadrado, mensaje
  junto al borde de error.
- **Do** separar superficies con el escalón de gris (lienzo → card) y un trazo de 1px, y elevar
  con sombras que solo caen hacia abajo.
- **Do** elegir la altura de control entre 32 / 40 / 48 y el radio entre 4 / 8 / 12 / píldora.
- **Do** maquetar con los alias de espaciado (`hug` → `page-bottom`) y mantener el hueco interno
  de un grupo menor que el hueco entre grupos.
- **Do** diseñar primero a 1440px y verificar que a 1024px el shell completo sigue entrando.
- **Do** usar el Tinte Tuya (#FFF1F2) como único color de selección: fila activa, ítem de sidebar,
  opción resaltada de un menú, chip de filtro aplicado.
- **Do** elegir la densidad de tabla por contexto (comfortable / compact / matrix) y alinear a la
  derecha toda columna numérica, que arrastra `tabular-nums` consigo.
- **Do** dar a toda superficie flotante clara (modal, menú, popover) su trazo Línea Neutra
  además de la sombra: la sombra no define el borde superior.
- **Do** ordenar las acciones de un pie de modal por énfasis creciente, con el primario último y
  a la derecha.

### Don't:
- **Don't** pintar de rojo Tuya badges, tags, chips seleccionados, gráficos o filtros
  encendidos; el estado seleccionado de un chip es Grafito Frío.
- **Don't** comunicar solo por color: ningún estado, nivel o alerta sin texto, forma o icono.
- **Don't** usar degradados, vidrio, blur ni glow en controles o superficies de interfaz; el
  degradado de marca es decoración y nunca representa un estado.
- **Don't** invertir el tema claro para obtener el oscuro: en oscuro las superficies se separan
  por claridad, el rojo sube a #F8626C y el texto es #FAFAFB, nunca blanco puro.
- **Don't** inventar un tamaño de texto, un paso de espaciado, una altura de control ni un tamaño
  de icono intermedio (18px, 22px); cambiá de nivel.
- **Don't** aplicar la píldora a un control, ni el radio de superficie (12px) a un botón.
- **Don't** usar sombras ambientales, halos o sombras que asomen por el borde superior.
- **Don't** mezclar vocabularios de color: `accent` no es `info`, una persona no es `danger`, y
  no existe un paso de atención para «sin atención».
- **Don't** recurrir a Inter, grises cálidos ni a los radios y sombras por defecto de un kit: el
  sistema es IBM Plex sobre neutros fríos.
- **Don't** pintar la cabecera de una tabla con color de marca ni con negrita de cuerpo: es Label
  en mayúsculas, Grafito Sutil sobre casi-blanco; solo el chevron de orden lleva rojo.
- **Don't** usar un modal para consultar información; es para decidir. Lo que se lee sin
  bloquear la página va en drawer o popover.
- **Don't** hacer un modal a pantalla completa en desktop ni más ancho que 880px.
- **Don't** dibujar la costura `edge` de una columna congelada mientras no haya nada oculto a la
  izquierda: dibujada siempre, deja de significar y se vuelve una raya más.
- **Don't** inventar una entrada nueva para una superposición: elegí la receta de su clase
  (`panel`, `float`, `slide`, `fade`); ni rebotes, ni elásticos, ni hover que levante o mueva.
