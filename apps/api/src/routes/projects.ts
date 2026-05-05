import { db } from "@envbox/database";
import { Hono } from "hono";

import { apiError } from "../lib/errors";

const profileNamePattern = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export const projectsRoutes = new Hono()
  .get("/", async (c) => {
    const projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { profiles: true },
    });

    return c.json({ projects });
  })
  .post("/", async (c) => {
    const body = await c.req.json().catch(() => {
      throw apiError("invalidJsonBody");
    });

    if (!body || typeof body !== "object") {
      throw apiError("invalidProjectPayload");
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const defaultProfile =
      typeof body.defaultProfile === "string" ? body.defaultProfile.trim() : "dev";

    if (!name) {
      throw apiError("projectNameRequired");
    }

    if (!profileNamePattern.test(defaultProfile)) {
      throw apiError("invalidProfileName");
    }

    const project = await db.project.create({
      data: {
        name,
        defaultProfile,
        profiles: {
          create: {
            name: defaultProfile,
          },
        },
      },
      include: {
        profiles: true,
      },
    });

    return c.json({ project }, 201);
  });