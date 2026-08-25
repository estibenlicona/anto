import { withCustomConfig, type ComponentDoc } from "react-docgen-typescript";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");

export interface ExtractedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
}

/** Props of a single exported component. A file can export several (e.g. card.tsx). */
export interface ExtractedComponentApi {
  displayName: string;
  props: ExtractedProp[];
}

const parser = withCustomConfig(join(packageRoot, "tsconfig.json"), {
  savePropValueAsString: true,
  shouldExtractLiteralValuesFromEnum: true,
  // Keep only props declared in our own sources. Without this, a component
  // like `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>` drags in
  // every DOM attribute declared in @types/react and the table is unusable.
  propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes("node_modules"),
});

/**
 * react-docgen-typescript reports a literal union as the bare name "enum" and
 * puts the members in `value`, and it appends "| undefined" to every optional
 * prop. Neither is useful to a reader, so rebuild the union and drop the
 * redundant undefined that optionality already implies.
 */
function formatType(prop: ComponentDoc["props"][string]): string {
  const { name, value } = prop.type;

  if (name === "enum" && Array.isArray(value)) {
    const members = value.map((member: { value: string }) => member.value).filter((member) => member !== "undefined");
    if (members.length > 0) return members.join(" | ");
  }

  return name.replace(/\s*\|\s*undefined\b/, "");
}

function toExtractedProp(name: string, prop: ComponentDoc["props"][string]): ExtractedProp {
  return {
    name,
    type: formatType(prop),
    required: prop.required,
    defaultValue: prop.defaultValue ? String(prop.defaultValue.value) : null,
    description: prop.description ?? "",
  };
}

/**
 * Parses one component source file. Returns one entry per exported component,
 * each with only that component's own props. An empty `props` array means the
 * component genuinely has no own props (it only spreads native attributes);
 * an empty *result* means nothing was parsed at all, which callers treat as an
 * extraction failure rather than as "no props".
 */
export function extractComponentApi(sourceRelativePath: string): ExtractedComponentApi[] {
  return parser.parse(join(packageRoot, sourceRelativePath)).map((doc) => ({
    displayName: doc.displayName,
    props: Object.entries(doc.props)
      .map(([name, prop]) => toExtractedProp(name, prop))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
