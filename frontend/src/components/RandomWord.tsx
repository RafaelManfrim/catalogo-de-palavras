import { useState } from "react";
import toast from "react-hot-toast";
import { useSetWordStudied } from "../hooks/useWords";
import { api } from "../services/api";
import type { Word } from "../services/api";

function starLevel(stars: number): string {
  if (stars >= 6) return "text-amber-400";
  if (stars >= 3) return "text-zinc-300";
  if (stars >= 1) return "text-orange-400";
  return "text-zinc-600";
}

export function RandomWord() {
  const [word, setWord] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [emptyQueue, setEmptyQueue] = useState(false);
  const setStudied = useSetWordStudied();

  const fetchRandom = async () => {
    setLoading(true);
    setRevealed(false);
    try {
      const w = await api.getRandomWord();
      setEmptyQueue(!w);
      setWord(w);
      if (!w) {
        toast("Nao ha palavras na fila.");
      }
    } catch {
      toast.error("Nao foi possivel sortear agora.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkStudiedAndNext = () => {
    if (word) {
      setStudied.mutate(
        { id: word.id, studied: true },
        {
          onSuccess: () => {
            toast.success(`"${word.text}" marcada como estudada.`);
            fetchRandom();
          },
          onError: () => {
            toast.error("Nao foi possivel atualizar a palavra.");
          },
        }
      );
    }
  };

  return (
    <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          Palavra Aleatoria
        </h2>
        <button
          onClick={fetchRandom}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-md bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          {loading ? "..." : word ? "Proxima" : "Sortear"}
        </button>
      </div>

      {word ? (
        <div className="text-center py-4">
          <div
            className={`flex gap-2 items-center justify-center transition-all ${!revealed && "blur-md cursor-pointer select-none"}`}
            onClick={() => setRevealed(true)}
          >
            <span className="text-2xl sm:text-3xl font-bold text-zinc-100">
              {word.text}
            </span>
            <span
              className={`text-sm tabular-nums ${starLevel(word.stars)}`}
            >
              {"*".repeat(Math.min(word.stars, 10))}{" "}
              <span className="text-zinc-500">{word.stars}</span>
            </span>
          </div>

          {!revealed && (
            <p className="text-zinc-500 text-sm mb-3">
              Clique para revelar
            </p>
          )}

          {revealed && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-2">
                {word.partOfSpeech && <span className="text-zinc-400/90">{word.partOfSpeech}</span>}
                {word.phonetic && <span>{word.phonetic}</span>}
              </div>
              {(word.phonetic || word.audioUrls.length > 0) && (
                <div className="text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-2">
                  {word.audioUrls.slice(0, 2).map((audioUrl) => (
                    <audio key={audioUrl} controls preload="none" className="h-7">
                      <source src={audioUrl} />
                    </audio>
                  ))}
                </div>
              )}
              <button
                onClick={handleMarkStudiedAndNext}
                className="px-4 py-1.5 rounded-md text-sm bg-violet-600/80 hover:bg-violet-500 text-white transition-colors"
              >
                Estudei
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-sm">
          {emptyQueue ? (
            <p className="text-zinc-500">
              Nao ha palavras na fila. Marque alguma estudada como "Voltar fila".
            </p>
          ) : (
            <p className="text-zinc-500">Clique em "Sortear" para revisar uma palavra</p>
          )}
        </div>
      )}
    </div>
  );
}
