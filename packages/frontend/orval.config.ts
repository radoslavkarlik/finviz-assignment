import { defineConfig } from "orval";

export default defineConfig({
  taxonomy: {
    input: {
      target: "../backend/src/swagger.json",
    },
    output: {
      target: "./src/api/taxonomy.ts",
      schemas: "./src/api/model",
      client: "react-query",
    },
  },
});
