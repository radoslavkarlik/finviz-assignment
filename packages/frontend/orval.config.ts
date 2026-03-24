import { defineConfig } from "orval";

export default defineConfig({
  taxonomy: {
    input: {
      target: "http://localhost:3000/swagger.json",
    },
    output: {
      target: "./src/api/taxonomy.ts",
      schemas: "./src/api/model",
      client: "react-query",
      baseUrl: "http://localhost:3000",
    },
  },
});
