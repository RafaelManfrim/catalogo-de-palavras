import { useAuth } from "./contexts/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { StatsBar } from "./components/StatsBar";
import { WordInput } from "./components/WordInput";
import { WordList } from "./components/WordList";
import { RandomWord } from "./components/RandomWord";

function App() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-500">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="space-y-3">
          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Catalogo de Palavras
            </h1>
            <p className="text-zinc-500 text-sm">Acompanhe seu vocabulario em ingles</p>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 bg-zinc-800/40 border border-zinc-700/40 rounded-lg px-3 py-2">
            <span>{user.email}</span>
            <button
              onClick={logout}
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
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
