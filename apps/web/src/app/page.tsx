import { Button } from "@envbox/ui";
import { getGreeting } from "@envbox/utils";

export default function Page() {
  return (
    <main>
      <section className="home">
        <h1>Envbox</h1>
        <p>{getGreeting("Envbox")}. A focused Bun + Turbo monorepo with shared config ready to grow.</p>
        <Button>Start building</Button>
      </section>
    </main>
  );
}