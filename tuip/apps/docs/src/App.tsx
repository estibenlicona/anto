import { Routes, Route, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { ComponentDetail } from "./pages/ComponentDetail";
import { firstComponentPath } from "./data/navigation";
import { Color, Espaciado, Iconografia, Instalacion, Tipografia } from "./pages/DocPages";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />

        <Route path="/instalacion" element={<Instalacion />} />

        <Route path="/fundamentos/tipografia" element={<Tipografia />} />
        <Route path="/fundamentos/color" element={<Color />} />
        <Route path="/fundamentos/espaciado" element={<Espaciado />} />
        <Route path="/fundamentos/iconografia" element={<Iconografia />} />

        <Route path="/components/:name" element={<ComponentDetail />} />

        {/* Pages this or an earlier change retired, kept as redirects so links
            that are already out in the world do not land on nothing: the
            catalogue, whose job the grouped sidebar now does; the tokens page,
            split into the three Fundamentos pages; and the CLI reference and
            project-anatomy pages, retired along with the `tuip` CLI itself
            (see openspec/changes/adopt-published-component-library). */}
        <Route path="/components" element={<Navigate to={firstComponentPath()} replace />} />
        <Route path="/tokens" element={<Navigate to="/fundamentos/color" replace />} />
        <Route path="/cli" element={<Navigate to="/instalacion" replace />} />
        <Route path="/estructura" element={<Navigate to="/instalacion" replace />} />
      </Route>
    </Routes>
  );
}
