import "dotenv/config";

import db from "../src/client";

async function testDatabase(): Promise<void> {
  try {
    const project = await db.project.create({
      data: {
        name: "Envbox Smoke Test",
      },
    });

    const profile = await db.profile.create({
      data: {
        projectId: project.id,
        name: "dev",
      },
    });

    const scope = await db.scope.create({
      data: {
        projectId: project.id,
        name: "api",
        path: "apps/api/.env",
      },
    });

    const variable = await db.variable.create({
      data: {
        projectId: project.id,
        name: "DATABASE_URL",
        type: "secret",
        secret: true,
        required: true,
      },
    });

    await db.scopeVariable.create({
      data: {
        scopeId: scope.id,
        variableId: variable.id,
      },
    });

    await db.variableValue.create({
      data: {
        projectId: project.id,
        profileId: profile.id,
        scopeId: scope.id,
        variableId: variable.id,
        value: "postgres://example",
      },
    });

    const envState = await db.project.findUniqueOrThrow({
      where: {
        id: project.id,
      },
      include: {
        profiles: true,
        scopes: {
          include: {
            variables: {
              include: {
                variable: true,
              },
            },
          },
        },
        variables: true,
        values: true,
      },
    });

    console.log(`Database smoke test passed for ${envState.name}.`);
  } catch (error) {
    console.error("Database smoke test failed.", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

await testDatabase();