import Fastify from "fastify";
import cors from "@fastify/cors";
import { wordRoutes } from "./routes/words.js";

const app = Fastify({ logger: true });

app.register(cors, {
  origin: "http://localhost:5173",
});

app.register(wordRoutes);

app.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    await app.listen({ port: 3333, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3333");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
