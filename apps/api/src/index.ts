import { getGreeting } from "@envbox/utils";

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3001),
  fetch() {
    return Response.json({ message: getGreeting("Envbox API") });
  },
});

console.log(`API listening on http://localhost:${server.port}`);