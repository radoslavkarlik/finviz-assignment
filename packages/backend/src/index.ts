import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = process.env.PORT ?? 3000;

const __dirname = import.meta.dirname;
const data: Array<unknown> = JSON.parse(readFileSync(join(__dirname, "parsed.json"), "utf-8"));

app.get("/api", (req, res) => {
  const page = parseInt((req.query.page as string) ?? "1", 10);
  const offset = parseInt((req.query.offset as string) ?? "20", 10);

  const start = (page - 1) * offset;
  const items = data.slice(start, start + offset);

  res.json(items);
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(JSON.parse(readFileSync(join(__dirname, "swagger.json"), "utf-8"))),
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
