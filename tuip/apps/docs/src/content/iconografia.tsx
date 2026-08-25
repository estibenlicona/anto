import { Icon, iconFamily, iconPaths, type IconName } from "@tuya-ui/components";
import type { DocPage } from "./page";

/** The families the library declares, with the label each is read under. */
const FAMILY_LABELS: Array<{ id: keyof typeof iconFamily; label: string; note?: string }> = [
  { id: "navigation", label: "Navegación y estructura" },
  { id: "actions", label: "Acciones" },
  { id: "status", label: "Estado y feedback" },
  { id: "data", label: "Datos y análisis" },
  {
    id: "domain",
    label: "Dominio Tuya TI",
    note: "Los que no existen en ninguna librería abierta: el vocabulario propio de la gestión de capacidad. Aquí es donde el set se gana su razón de ser.",
  },
  { id: "objects", label: "Personas, tiempo y objetos" },
];

function FamilyGrid({ names }: { names: readonly string[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-control border border-neutral-default bg-neutral-subtle-hover sm:grid-cols-4 lg:grid-cols-6">
      {names.map((name) => (
        <div
          key={name}
          className="flex flex-col items-center gap-3 bg-neutral-default px-2 py-5 text-neutral-default"
        >
          <Icon name={name as IconName} size={24} />
          <span className="break-all text-center font-mono text-label text-neutral-subtle">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

const SIZE_USE: Array<{ size: 16 | 20 | 24 | 32; use: string }> = [
  { size: 16, use: "Dentro de texto y tablas compactas" },
  { size: 20, use: "Por defecto, en botones y navegación" },
  { size: 24, use: "Cabeceras y estados vacíos" },
  { size: 32, use: "Solo en la ilustración de un estado vacío" },
];

export const iconografiaPage: DocPage = {
  title: "Iconografía",
  lede: `${Object.keys(iconPaths).length} iconos construidos sobre la misma retícula y las mismas reglas de trazo, más el método para dibujar el siguiente sin que se note la costura.`,
  sections: [
    {
      id: "instalar",
      label: "Traerlos al proyecto",
      blocks: [
        {
          kind: "prose",
          text: "Los iconos y el componente que los renderiza vienen incluidos en @tuya-ui/components. El SVG nunca se pega suelto en una pantalla: se pide por nombre.",
        },
        {
          kind: "code",
          label: "uso",
          code: `import { Icon } from "@tuya-ui/components";

// Decorativo: acompaña al texto, y queda oculto para lectores de pantalla.
<button><Icon name="plus" /> Crear iniciativa</button>

// Única etiqueta del control: necesita nombre accesible.
<button><Icon name="more" label="Más acciones" /></button>`,
        },
      ],
    },
    {
      id: "base",
      label: "La base",
      blocks: [
        {
          kind: "prose",
          text: "Todo icono nace en un lienzo de 24×24 con un margen muerto intocable. Dentro del área viva la forma debe llenar el espacio: un icono tímido se ve roto al lado de uno que sí lo ocupa.",
        },
        {
          kind: "table",
          columns: [
            { key: "rule", header: "Regla", width: 1 },
            { key: "value", header: "Valor", mono: true, width: 0.8 },
            { key: "why", header: "Por qué", width: 2.2 },
          ],
          rows: [
            {
              rule: "Trazo",
              value: "1.5px",
              why: "Uniforme, y nunca se escala: a 16px o a 32px sigue siendo 1.5. Escalarlo rompería la coherencia del set.",
            },
            {
              rule: "Terminales y uniones",
              value: "round",
              why: "Sin excepción. Es lo que da al set su carácter y lo que hace que un icono nuevo no desentone.",
            },
            {
              rule: "Relleno",
              value: "none",
              why: "Solo contorno. El único relleno admitido es el punto de estado.",
            },
            {
              rule: "Color",
              value: "currentColor",
              why: "El icono hereda el color del texto que acompaña. Nunca trae color propio ni un rol semántico distinto al de su bloque.",
            },
          ],
        },
      ],
    },
    {
      id: "tamanos",
      label: "Tamaños",
      blocks: [
        {
          kind: "prose",
          text: "Cuatro tamaños, nada intermedio: 18 o 22 difuminan el trazo y rompen la nitidez.",
        },
        {
          kind: "custom",
          render: () => (
            <div className="flex flex-wrap items-end gap-8">
              {SIZE_USE.map(({ size }) => (
                <div key={size} className="flex flex-col items-center gap-2 text-neutral-default">
                  <Icon name="capacity" size={size} />
                  <span className="font-mono text-label text-neutral-subtle">{size}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          kind: "table",
          columns: [
            { key: "size", header: "Tamaño", mono: true, width: 0.5 },
            { key: "use", header: "Dónde", width: 3 },
          ],
          rows: SIZE_USE.map(({ size, use }) => ({ size: String(size), use })),
        },
      ],
    },
    {
      id: "accesibilidad",
      label: "Accesibilidad",
      blocks: [
        {
          kind: "table",
          columns: [
            { key: "case", header: "Caso", width: 1.2 },
            { key: "value", header: "Qué aplica", mono: true, width: 1.2 },
            { key: "why", header: "Por qué", width: 2 },
          ],
          rows: [
            {
              case: "Icono junto a texto",
              value: 'aria-hidden="true"',
              why: "Es decorativo: el texto ya nombra la acción, y anunciarlo dos veces estorba.",
            },
            {
              case: "Icono como única etiqueta",
              value: 'role="img" + aria-label',
              why: "Sin etiqueta, el control no tiene nombre accesible y no se puede operar a ciegas.",
            },
            {
              case: "Siempre",
              value: 'focusable="false"',
              why: "Evita que el SVG capture el foco en navegadores que lo hacen focusable por defecto.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "danger",
          title: "Ningún icono comunica solo",
          text: "Un estado siempre lleva además texto o color de fondo. Alrededor del 8% de los hombres no distingue rojo de verde, y un icono que solo se diferencia por matiz no les dice nada.",
        },
      ],
    },
    ...FAMILY_LABELS.map((family) => ({
      id: family.id,
      label: `${family.label} · ${iconFamily[family.id].length}`,
      blocks: [
        ...(family.note ? [{ kind: "prose" as const, text: family.note }] : []),
        {
          kind: "custom" as const,
          render: () => <FamilyGrid names={iconFamily[family.id]} />,
        },
      ],
    })),
    {
      id: "nuevo",
      label: "Cómo se dibuja el siguiente",
      blocks: [
        {
          kind: "callout",
          tone: "warning",
          title: "Primero, no lo dibujes",
          text: "Busca en la librería un concepto equivalente. Un icono nuevo por cada matiz de significado convierte el set en ruido. La pregunta correcta no es «¿existe este dibujo?» sino «¿este concepto es realmente distinto de los que ya hay?».",
        },
        {
          kind: "table",
          columns: [
            { key: "step", header: "Paso", width: 1.2 },
            { key: "what", header: "Qué hacer", width: 3 },
          ],
          rows: [
            {
              step: "Nombra antes de dibujar",
              what: "Kebab-case, en inglés, por concepto y no por forma. Si el nombre necesita explicación, el icono también la necesitará: replantea el concepto.",
            },
            {
              step: "Parte de una figura guía",
              what: "Círculo, cuadrado o rectángulo según la masa que quieras, y ocupa el área viva completa.",
            },
            {
              step: "Reutiliza lo que existe",
              what: "Si el icono es «algo + reloj», usa el reloj de status-pending tal cual. Los modificadores viven en esquinas fijas.",
            },
            {
              step: "Máximo tres elementos",
              what: "Y ningún detalle a menos de 2px de separación: a 16px se convierte en una mancha.",
            },
            {
              step: "Prueba de fuego",
              what: "Ponlo a 16px al lado de tres iconos existentes. Si destaca —más pesado, más ligero, más grande— está mal. Un icono correcto es invisible dentro del set.",
            },
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Los iconos se extraen del documento de diseño, no se editan aquí",
          text: "El mapa de trazos lo genera un script desde el documento de iconografía. Para corregir un dibujo se corrige allí y se vuelve a generar; editar el archivo a mano lo dejaría desincronizado de su fuente.",
        },
      ],
    },
  ],
};
