/**
 * Los matchers de jest-dom (`toBeInTheDocument`, `toHaveAttribute`, …) se
 * registran en tiempo de ejecución desde `vitest.setup.ts`, pero su
 * augmentación de tipos vive en el módulo que se importa acá. Sin este archivo
 * la suite corre igual y `tsc --noEmit` falla, que es la peor de las dos
 * combinaciones posibles.
 */
import "@testing-library/jest-dom/vitest";
