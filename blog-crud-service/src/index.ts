import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const server = http.createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Blog CRUD service listening on http://localhost:${PORT}`);
});