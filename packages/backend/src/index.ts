import cors from "cors";
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
const port = process.env.PORT ?? 3000;

const __dirname = import.meta.dirname;
const data: Array<unknown> = JSON.parse(readFileSync(join(__dirname, "parsed.json"), "utf-8"));
const swagger = JSON.parse(readFileSync(join(__dirname, "swagger.json"), "utf-8"));

app.get("/swagger.json", (_req, res) => {
  res.json(swagger);
});

app.get("/api", (req, res) => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const offset = parseInt((req.query.offset as string) ?? "20", 10);

  const start = (page - 1) * offset;
  const items = data.slice(start, start + offset);

  res.json({ items, total: data.length });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swagger));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
