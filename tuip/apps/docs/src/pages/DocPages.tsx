import { DocPageView } from "../components/DocPageView";
import { instalacionPage } from "../content/instalacion";
import { colorPage, espaciadoPage, tipografiaPage } from "../content/fundamentos";
import { iconografiaPage } from "../content/iconografia";

/**
 * Every content-only page is the same view over a different `DocPage`, so the
 * layout, the index and the heading structure stay identical across them.
 */
export const Instalacion = () => <DocPageView page={instalacionPage} />;
export const Tipografia = () => <DocPageView page={tipografiaPage} />;
export const Color = () => <DocPageView page={colorPage} />;
export const Espaciado = () => <DocPageView page={espaciadoPage} />;
export const Iconografia = () => <DocPageView page={iconografiaPage} />;
