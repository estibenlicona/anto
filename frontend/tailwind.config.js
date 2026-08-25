import daisyuin from "daisyui";
const { join } = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      "{src,pages,components,app,lib}/**/*!(*.stories|*.spec).{ts,tsx,html}"
    ),
  ],
  theme: {},
  plugins: [daisyuin],
};
