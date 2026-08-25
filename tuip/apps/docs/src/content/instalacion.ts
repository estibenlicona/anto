import type { DocPage } from "./page";

/**
 * Every command and file path here matches `packages/components/package.json`
 * (published as `@tuya-ui/components`). If the package's build or exports change,
 * this page is the first thing to re-check.
 */
export const instalacionPage: DocPage = {
  title: "Instalación",
  lede: "Un paquete de npm trae el catálogo completo, sus estilos y sus tipos. No hay configuración de Tailwind que replicar ni código que copiar a tu repositorio: instalás la dependencia y la actualizás como a cualquier otra.",
  sections: [
    {
      id: "requisitos",
      label: "Requisitos",
      blocks: [
        {
          kind: "prose",
          text: "Node 18 o superior y React 18 en el proyecto anfitrión. No hace falta tener Tailwind CSS instalado ni configurado: los estilos de los componentes vienen ya compilados dentro del paquete.",
        },
        {
          kind: "prose",
          text: "La interfaz usa IBM Plex Sans, y IBM Plex Mono para cadenas literales. Los tokens declaran las familias, pero servirlas es responsabilidad del proyecto anfitrión: el paquete no incluye archivos de fuente, porque pesarían más que el resto del código junto. La vía más corta es instalar los paquetes de Fontsource e importar los pesos que uses.",
        },
        {
          kind: "code",
          label: "terminal",
          code: `npm install @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono`,
        },
        {
          kind: "code",
          label: "src/main.tsx",
          code: `import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "Sin las fuentes, la interfaz se ve pero no es la del sistema",
          text: "Las familias declaran un respaldo del sistema, así que nada se rompe si faltan. Lo que se pierde es la tipografía que sostiene la escala: los tamaños siguen siendo los correctos sobre una fuente que no es la elegida.",
        },
      ],
    },
    {
      id: "instalar-el-paquete",
      label: "Instalar el paquete",
      blocks: [
        {
          kind: "prose",
          text: "Se instala una vez, como cualquier dependencia de npm. Las dependencias de terceros que usan los componentes internamente (Radix, date-fns, entre otras) se instalan solas junto con el paquete: no hay que declararlas a mano.",
        },
        {
          kind: "code",
          label: "terminal",
          code: `npm install @tuya-ui/components`,
        },
      ],
    },
    {
      id: "estilos",
      label: "Estilos",
      blocks: [
        {
          kind: "prose",
          text: "El paquete incluye una hoja de estilos autocontenida, con los tokens de marca y las clases que usan los componentes ya compiladas. Se importa una sola vez, en el punto de entrada de la app.",
        },
        {
          kind: "code",
          label: "src/main.tsx",
          code: `import "@tuya-ui/components/styles.css";`,
        },
        {
          kind: "callout",
          tone: "info",
          title: "No hace falta extender ningún preset de Tailwind",
          text: "Aunque los componentes están construidos con Tailwind CSS, esa configuración vive dentro del paquete y se resuelve en su propio build. El proyecto que instala @tuya-ui/components no necesita tener Tailwind instalado.",
        },
      ],
    },
    {
      id: "primer-componente",
      label: "Primer componente",
      blocks: [
        {
          kind: "prose",
          text: "Con el paquete instalado y sus estilos importados, cualquier componente del catálogo se usa como una dependencia más: se importa por nombre.",
        },
        {
          kind: "code",
          label: "src/App.tsx",
          code: `import { Button } from "@tuya-ui/components";

export function App() {
  return <Button variant="primary">Guardar</Button>;
}`,
        },
        {
          kind: "prose",
          text: "Actualizar a una versión nueva de @tuya-ui/components (npm update @tuya-ui/components) trae las correcciones y los componentes nuevos del catálogo sin tocar tu código. Un cambio que rompe la API pública de un componente sube la versión mayor del paquete y viene con su propia guía de migración en el changelog.",
        },
      ],
    },
  ],
};
