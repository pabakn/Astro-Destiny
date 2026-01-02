import { z } from "zod";
import { insertContactSchema, insertBlogPostSchema, insertHoroscopeSchema, contactSubmissions, blogPosts, horoscopes } from "./schema";

export const api = {
  contacts: {
    create: {
      method: "POST" as const,
      path: "/api/contact",
      input: insertContactSchema,
      responses: {
        201: z.object({ message: z.string() }),
        400: z.object({ message: z.string() }),
      },
    },
  },
  posts: {
    list: {
      method: "GET" as const,
      path: "/api/posts",
      responses: {
        200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/posts/:id",
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  horoscopes: {
    list: {
      method: "GET" as const,
      path: "/api/horoscopes",
      responses: {
        200: z.array(z.custom<typeof horoscopes.$inferSelect>()),
      },
    },
  },
  chat: {
    send: {
      method: "POST" as const,
      path: "/api/chat",
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({ response: z.string() }),
        500: z.object({ message: z.string() }),
      },
    },
  },
};

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};
