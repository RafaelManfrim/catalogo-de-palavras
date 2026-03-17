import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./routes/auth.js";
import { wordRoutes } from "./routes/words.js";
import { env } from "./env/index.js";

const app = Fastify({ logger: true });

app.register(jwt, { secret: env.JWT_SECRET });

app.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch {
    return reply.status(401).send({ error: "Unauthorized" });
  }
});

app.register(cors);

app.register(authRoutes);
app.register(wordRoutes);

app.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    console.log("Server running on http://localhost:" + env.PORT);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
