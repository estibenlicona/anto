import { useState } from "react";
import { Pagination } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Controlada por el consumidor: page y onPageChange, sin estado propio.",
  caption: "5 páginas — el rango completo cabe sin puntos suspensivos",
};

export default function Example() {
  const [page, setPage] = useState(1);

  return <Pagination page={page} pageCount={5} onPageChange={setPage} />;
}
