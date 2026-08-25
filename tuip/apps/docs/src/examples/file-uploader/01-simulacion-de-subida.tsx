import { useEffect, useRef, useState } from "react";
import { FileUploader, type FileUploaderItem } from "@tuya-ui/components";

export const meta = {
  title: "Simulación de subida",
  description: "El progreso avanza de verdad en el tiempo — FileUploader solo presenta el estado, no lo inventa. Los archivos en posición impar terminan en error, para ver los tres estados sin depender de qué elijas.",
  caption: "onFilesAdded agrega filas en 'uploading'; un intervalo real las hace avanzar hasta success o error",
};

let nextId = 0;

export default function Example() {
  const [files, setFiles] = useState<FileUploaderItem[]>([]);
  // Keyed separately from `files` — whether a row is scripted to fail is
  // demo bookkeeping, not part of the real FileUploaderItem shape.
  const endsInError = useRef(new Map<string, boolean>());
  const intervals = useRef(new Map<string, ReturnType<typeof setInterval>>());

  useEffect(() => {
    const activeIntervals = intervals.current;
    return () => activeIntervals.forEach((interval) => clearInterval(interval));
  }, []);

  function simulateUpload(id: string) {
    const interval = setInterval(() => {
      setFiles((current) =>
        current.map((item) => {
          if (item.id !== id || item.status !== "uploading") return item;
          const nextProgress = Math.min((item.progress ?? 0) + 15 + Math.random() * 15, 100);
          if (nextProgress < 100) return { ...item, progress: nextProgress };

          clearInterval(intervals.current.get(id));
          intervals.current.delete(id);
          return endsInError.current.get(id)
            ? { ...item, status: "error", errorMessage: "La conexión se interrumpió antes de terminar." }
            : { ...item, status: "success" };
        }),
      );
    }, 350);
    intervals.current.set(id, interval);
  }

  function handleFilesAdded(added: File[]) {
    const startIndex = files.length;
    const newItems: FileUploaderItem[] = added.map((file, index) => {
      const id = `file-${nextId++}`;
      // Deterministic by position, not content, so the demo doesn't depend on which files you pick.
      endsInError.current.set(id, (startIndex + index) % 2 === 1);
      return { id, file, status: "uploading", progress: 0 };
    });

    setFiles((current) => [...current, ...newItems]);
    newItems.forEach((item) => simulateUpload(item.id));
  }

  function handleFileRemove(id: string) {
    const interval = intervals.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervals.current.delete(id);
    }
    endsInError.current.delete(id);
    setFiles((current) => current.filter((item) => item.id !== id));
  }

  return (
    <FileUploader label="Adjuntar archivos" files={files} onFilesAdded={handleFilesAdded} onFileRemove={handleFileRemove} />
  );
}
