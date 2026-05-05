import { db } from "@envbox/database";
import { Hono } from "hono";

import { apiError } from "../lib/errors";

export const projectEnvRoutes = new Hono().get("/:projectId/env", async (c) => {
  const projectId = c.req.param("projectId");

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      profiles: true,
      scopes: {
        include: {
          variables: {
            include: { variable: true },
          },
        },
      },
      variables: true,
      values: true,
    },
  });

  if (!project) throw apiError("projectEnvNotFound");

  return c.json({ project });
});