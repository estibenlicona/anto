import { Link } from "react-router";
import { Card, CardBody, CardHeader } from "@tuya-ui/components";
import { CodeBlock } from "../components/CodeBlock";
import { PageHeader } from "../components/PageHeader";
import { usePublishToc } from "../components/TocContext";
import { displayableComponents } from "../data/registry";
import { firstComponentPath } from "../data/navigation";

const INSTALL = `npm install @tuya-ui/components

import "@tuya-ui/components/styles.css";
import { Button } from "@tuya-ui/components";`;

const SECTIONS = [
  { id: "empezar", label: "Empezar" },
  { id: "que-incluye", label: "Qué incluye" },
];

export function Home() {
  usePublishToc(SECTIONS);

  return (
    <div>
      <PageHeader
        title="Introducción"
        lede="Design tokens y componentes React accesibles, distribuidos como un único paquete de npm versionado. Instalás la librería, importás sus estilos una vez, y actualizás como a cualquier otra dependencia."
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={firstComponentPath()}
            className="rounded-control bg-brand-bold px-4 py-2 text-body-sm font-medium text-brand-on-bold hover:bg-brand-bold-hover"
          >
            Ver componentes
          </Link>
          <Link
            to="/instalacion"
            className="rounded-control border border-neutral-default px-4 py-2 text-body-sm font-medium text-neutral-default hover:bg-neutral-subtle-hover"
          >
            Instalar @tuya-ui/components
          </Link>
        </div>
      </PageHeader>

      <section id="empezar" className="mt-[52px] scroll-mt-20">
        <h2 className="mb-3.5 text-heading-lg font-semibold tracking-[-0.02em] text-neutral-default">
          Empezar
        </h2>
        <p className="max-w-2xl text-body-sm text-neutral-subtle">
          Instalá el paquete, importá su hoja de estilos una vez, y usá los componentes que
          necesites.
        </p>
        <div className="mt-4 max-w-2xl">
          <CodeBlock code={INSTALL} label="Terminal" />
        </div>
      </section>

      <section id="que-incluye" className="mt-[52px] scroll-mt-20">
        <h2 className="mb-3.5 text-heading-lg font-semibold tracking-[-0.02em] text-neutral-default">
          Qué incluye
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <span className="text-heading-md text-neutral-default">Design tokens</span>
            </CardHeader>
            <CardBody>
              <p className="text-body-sm text-neutral-subtle">
                Paleta primitiva y tokens semánticos por rol, con modo claro y oscuro y contraste
                verificado contra WCAG AA.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <span className="text-heading-md text-neutral-default">
                {displayableComponents.length} componentes
              </span>
            </CardHeader>
            <CardBody>
              <p className="text-body-sm text-neutral-subtle">
                Construidos sobre los tokens, con variantes, estados de interacción y accesibilidad
                documentada.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <span className="text-heading-md text-neutral-default">Un solo paquete</span>
            </CardHeader>
            <CardBody>
              <p className="text-body-sm text-neutral-subtle">
                Versionado semánticamente, con changelog y guía de migración en cada versión que
                rompe la API.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}
