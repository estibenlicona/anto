import { useState } from "react";
import { Pagination } from "@tuya-ui/components";

export const meta = {
  title: "Rango largo",
  description: "Con muchas páginas, Pagination colapsa el medio en puntos suspensivos, conservando primera, última y actual.",
  caption: "24 páginas",
};

export default function Example() {
  const [page, setPage] = useState(12);

  return <Pagination page={page} pageCount={24} onPageChange={setPage} />;
}
