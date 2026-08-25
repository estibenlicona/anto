export default {
  plugins: {
    // En Tailwind 4 el plugin de PostCSS vive en su propio paquete: usar
    // `tailwindcss` acá falla con un error que lo dice explícitamente.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
