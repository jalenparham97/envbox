import { Hono } from "hono";

import { apiError, formatApiError } from "./lib/errors";
import { healthRoutes } from "./routes/health";
import { projectEnvRoutes } from "./routes/project-env";
import { projectsRoutes } from "./routes/projects";

export function createApp() {
  const app = new Hono({ strict: false });

  app.route("/health", healthRoutes);
  app.route("/projects", projectsRoutes);
  app.route("/projects", projectEnvRoutes);

  app.notFound((c) => {
    const { body, status } = formatApiError(apiError("routeNotFound"), c.req.path);

    return c.json(body, status);
  });

  app.onError((caughtError, c) => {
    const { body, status } = formatApiError(caughtError, c.req.path);

    if (status >= 500) {
      console.error(caughtError);
    }

    return c.json(body, status);
  });

  return app;
}

const app = createApp();

export type AppType = typeof app;

export default app;
