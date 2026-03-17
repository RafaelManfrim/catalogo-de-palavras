import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function wordRoutes(app: FastifyInstance) {
  // GET /words — list all words, optional search with ?q=
  app.get<{ Querystring: { q?: string; sort?: string; order?: string } }>(
    "/words",
    async (request) => {
      const { q, sort = "createdAt", order = "desc" } = request.query;

      const allowedSort = ["text", "stars", "createdAt", "studied"] as const;
      const sortField = allowedSort.includes(sort as any)
        ? (sort as (typeof allowedSort)[number])
        : "createdAt";
      const sortOrder = order === "asc" ? "asc" : "desc";

      const words = await prisma.word.findMany({
        where: q
          ? { text: { contains: q.toLowerCase(), mode: "insensitive" } }
          : undefined,
        orderBy: { [sortField]: sortOrder },
      });

      return words;
    }
  );

  // GET /words/search?q= — lightweight search for autocomplete
  app.get<{ Querystring: { q: string } }>(
    "/words/search",
    async (request) => {
      const { q } = request.query;
      if (!q || q.trim().length === 0) return [];

      const words = await prisma.word.findMany({
        where: { text: { startsWith: q.toLowerCase(), mode: "insensitive" } },
        orderBy: { text: "asc" },
        take: 10,
      });

      return words;
    }
  );

  // GET /words/stats — aggregate stats
  app.get("/words/stats", async () => {
    const [total, totalStudied, totalStars, avgStars] = await Promise.all([
      prisma.word.count(),
      prisma.word.count({ where: { studied: true } }),
      prisma.word.aggregate({ _sum: { stars: true } }),
      prisma.word.aggregate({ _avg: { stars: true } }),
    ]);

    return {
      totalWords: total,
      studiedWords: totalStudied,
      totalStars: totalStars._sum.stars ?? 0,
      avgStars: Math.round((avgStars._avg.stars ?? 0) * 10) / 10,
    };
  });

  // GET /words/random — random word, prioritizing lower stars
  app.get("/words/random", async () => {
    const count = await prisma.word.count({ where: { studied: false } });
    if (count === 0) return null;

    const minStars = await prisma.word.aggregate({
      where: { studied: false },
      _min: { stars: true },
    });
    const lowStarWords = await prisma.word.findMany({
      where: {
        studied: false,
        stars: { lte: (minStars._min.stars ?? 0) + 1 },
      },
    });

    const randomIndex = Math.floor(Math.random() * lowStarWords.length);
    return lowStarWords[randomIndex];
  });

  // POST /words — add a new word
  app.post<{ Body: { text: string } }>("/words", async (request, reply) => {
    const { text } = request.body;

    if (!text || text.trim().length === 0) {
      return reply.status(400).send({ error: "Word text is required" });
    }

    const normalized = text.trim().toLowerCase();

    const existing = await prisma.word.findUnique({
      where: { text: normalized },
    });

    if (existing) {
      if (!existing.studied) {
        return reply.status(409).send({
          error: "Word already exists and is not studied yet",
          word: existing,
        });
      }

      const repeatedWord = await prisma.word.update({
        where: { id: existing.id },
        data: {
          stars: { increment: 1 },
          studied: false,
        },
      });

      return reply.status(200).send(repeatedWord);
    }

    const word = await prisma.word.create({
      data: {
        text: normalized,
        studied: false,
      },
    });

    return reply.status(201).send(word);
  });

  app.patch<{ Params: { id: string }; Body: { studied: boolean } }>(
    "/words/:id/studied",
    async (request, reply) => {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({ error: "Invalid word ID" });
      }

      if (typeof request.body?.studied !== "boolean") {
        return reply.status(400).send({ error: "Field 'studied' must be boolean" });
      }

      try {
        const word = await prisma.word.update({
          where: { id },
          data: { studied: request.body.studied },
        });
        return word;
      } catch {
        return reply.status(404).send({ error: "Word not found" });
      }
    }
  );

  // PATCH /words/:id/repeat — add star only if studied
  app.patch<{ Params: { id: string } }>(
    "/words/:id/repeat",
    async (request, reply) => {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({ error: "Invalid word ID" });
      }

      const existing = await prisma.word.findUnique({ where: { id } });

      if (!existing) {
        return reply.status(404).send({ error: "Word not found" });
      }

      if (!existing.studied) {
        return reply
          .status(409)
          .send({ error: "Word must be studied before repeating", word: existing });
      }

      const word = await prisma.word.update({
        where: { id },
        data: {
          stars: { increment: 1 },
          studied: false,
        },
      });

      return word;
    }
  );

  // DELETE /words/:id — remove a word
  app.delete<{ Params: { id: string } }>(
    "/words/:id",
    async (request, reply) => {
      const id = parseInt(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({ error: "Invalid word ID" });
      }

      try {
        await prisma.word.delete({ where: { id } });
        return reply.status(204).send();
      } catch {
        return reply.status(404).send({ error: "Word not found" });
      }
    }
  );
}
