import CharacterSheet from "@/components/character/character-sheet";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative">
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <CharacterSheet />
    </main>
  );
}