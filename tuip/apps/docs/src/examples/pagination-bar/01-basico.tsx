import { useState } from "react";
import { PaginationBar } from "@tuya-ui/components";

export const meta = {
  title: "Básico",
  description: "Resumen a la izquierda, tamaño de página y navegación a la derecha.",
  caption: "total, pageSize y pageSizeOptions controlados por el consumidor",
};

const TOTAL = 32;

export default function Example() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const pageCount = Math.max(1, Math.ceil(TOTAL / pageSize));

  return (
    <PaginationBar
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
      total={TOTAL}
      pageSize={pageSize}
      pageSizeOptions={[5, 10, 25]}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setPage(1);
      }}
    />
  );
}
