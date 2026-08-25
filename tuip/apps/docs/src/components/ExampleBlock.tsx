import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { Canvas } from "./Canvas";
import type { LoadedExample } from "../examples/types";

export function ExampleBlock({ example }: { example: LoadedExample }) {
  const [showCode, setShowCode] = useState(false);
  const { Component, meta } = example;
  const panelId = `example-code-${example.id}`;

  return (
    // The id is the anchor the page index jumps to; scroll-mt keeps the heading
    // clear of the sticky header.
    <section id={example.id} className="flex scroll-mt-20 flex-col gap-3">
      <div>
        <h3 className="text-heading-md text-neutral-default">{meta.title}</h3>
        {meta.description && (
          <p className="mt-1 text-body-sm text-neutral-subtle">{meta.description}</p>
        )}
      </div>

      <Canvas caption={meta.caption}>
        <Component />
      </Canvas>

      <div>
        <button
          type="button"
          onClick={() => setShowCode((visible) => !visible)}
          aria-expanded={showCode}
          aria-controls={panelId}
          className="rounded-control px-2 py-1 text-body-sm font-medium text-brand-default hover:bg-neutral-subtle-hover"
        >
          {showCode ? "Ocultar código" : "Ver código"}
        </button>
      </div>

      {showCode && (
        <div id={panelId}>
          <CodeBlock code={example.source} label={`${example.id}.tsx`} />
        </div>
      )}
    </section>
  );
}
