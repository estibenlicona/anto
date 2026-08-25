import type { Preview } from "@storybook/react";
import "../src/styles/styles.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "white", // Color de fondo predeterminado
      values: [
        { name: "white", value: "#F4F4F4" },
        { name: "gray", value: "#f0f0f0" },
      ],
    },
  },
};

export default preview;
