import { startServer } from "#api/start-server";

const port = Number(process.env.PORT) || 3000;

startServer(port).catch((error) => {
  console.error(error);
  process.exit(1);
});
