import { StatsBar } from "./components/StatsBar";
import { WordInput } from "./components/WordInput";
import { WordList } from "./components/WordList";
import { RandomWord } from "./components/RandomWord";

function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Catalogo de Palavras
          </h1>
          <p className="text-zinc-500 text-sm">
            Acompanhe seu vocabulario em ingles
          </p>
        </header>

        {/* Stats */}
        <StatsBar />

        {/* Add word */}
        <WordInput />

        {/* Random word review */}
        <RandomWord />

        {/* Word list */}
        <WordList />
      </div>
    </div>
  );
}

export default App;
