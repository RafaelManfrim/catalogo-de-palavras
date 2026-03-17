import { useState } from "react";
import toast from "react-hot-toast";
import {
  useWords,
  useRepeatWord,
  useDeleteWord,
  useSetWordStudied,
} from "../hooks/useWords";

type SortField = "createdAt" | "text" | "stars";
type SortOrder = "asc" | "desc";

function starLevel(stars: number): string {
  if (stars >= 6) return "text-amber-400";
  if (stars >= 3) return "text-zinc-300";
  if (stars >= 1) return "text-orange-400";
  return "text-zinc-600";
}

function levelBadge(stars: number): { label: string; className: string } | null {
  if (stars >= 6) return { label: "ouro", className: "bg-amber-400/15 text-amber-400 border-amber-400/30" };
  if (stars >= 3) return { label: "prata", className: "bg-zinc-300/10 text-zinc-300 border-zinc-400/30" };
  if (stars >= 1) return { label: "bronze", className: "bg-orange-400/15 text-orange-400 border-orange-400/30" };
  return null;
}

export function WordList() {
  const [sort, setSort] = useState<SortField>("createdAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [filter, setFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: words = [], isLoading } = useWords(sort, order);
  const repeatWord = useRepeatWord();
  const deleteWord = useDeleteWord();
  const setStudied = useSetWordStudied();

  const handleSort = (field: SortField) => {
    if (sort === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder(field === "text" ? "asc" : "desc");
    }
  };

  const handleDelete = (id: number, text: string) => {
    if (deletingId !== id) {
      setDeletingId(id);
      toast("Clique novamente para confirmar exclusao.");
      setTimeout(() => {
        setDeletingId((current) => (current === id ? null : current));
      }, 3000);
      return;
    }

    deleteWord.mutate(id, {
      onSuccess: () => {
        setDeletingId(null);
        toast.success(`"${text}" foi excluida.`);
      },
      onError: (error: any) => {
        setDeletingId(null);
        toast.error(error?.error || "Nao foi possivel excluir agora.");
      },
    });
  };

  const handleRepeat = (id: number, text: string) => {
    repeatWord.mutate(id, {
      onSuccess: () => {
        toast.success(`"${text}" repetida (+1 estrela) e voltou para fila.`);
      },
      onError: (error: any) => {
        toast.error(error?.error || "Nao foi possivel repetir agora.");
      },
    });
  };

  const handleSetStudied = (id: number, text: string, studied: boolean) => {
    setStudied.mutate(
      { id, studied },
      {
        onSuccess: () => {
          toast.success(
            studied
              ? `"${text}" movida para Estudadas.`
              : `"${text}" voltou para Novas.`
          );
        },
        onError: (error: any) => {
          toast.error(error?.error || "Nao foi possivel atualizar o estado.");
        },
      }
    );
  };

  const filtered = filter
    ? words.filter((w) => w.text.includes(filter.toLowerCase()))
    : words;
  const newWords = filtered.filter((w) => !w.studied);
  const studiedWords = filtered.filter((w) => w.studied);

  const sortIndicator = (field: SortField) => {
    if (sort !== field) return "";
    return order === "asc" ? " ^" : " v";
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-zinc-800/50 rounded-lg h-14 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter + Sort controls */}
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filtrar palavras..."
          className="bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-500 outline-none focus:border-zinc-600 transition-colors flex-1 sm:max-w-xs"
        />
        <div className="flex gap-1 text-xs">
          {(
            [
              ["createdAt", "Data"],
              ["text", "A-Z"],
              ["stars", "Estrelas"],
            ] as [SortField, string][]
          ).map(([field, label]) => (
            <button
              key={field}
              onClick={() => handleSort(field)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                sort === field
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-300"
              }`}
            >
              {label}
              <span className="font-mono">{sortIndicator(field)}</span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          {words.length === 0
            ? "Nenhuma palavra cadastrada ainda. Comece adicionando uma!"
            : "Nenhuma palavra encontrada com esse filtro."}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">
                Novas / Na fila
              </h3>
              <span className="text-xs text-zinc-500">{newWords.length}</span>
            </div>
            {newWords.length === 0 ? (
              <div className="text-center py-5 text-sm text-zinc-600 border border-zinc-800 rounded-lg">
                Nenhuma palavra na fila.
              </div>
            ) : (
              <div className="space-y-1.5">
                {newWords.map((word) => {
                  const badge = levelBadge(word.stars);
                  return (
                    <div
                      key={word.id}
                      className="group flex items-center gap-3 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/30 rounded-lg px-4 py-3 transition-colors"
                    >
                      <span className="text-zinc-100 font-medium flex-1 text-left">
                        {word.text}
                      </span>
                      {badge && (
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium hidden sm:inline ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      )}
                      <span
                        className={`text-sm tabular-nums min-w-[2rem] text-right ${starLevel(word.stars)}`}
                      >
                        {"*".repeat(Math.min(word.stars, 5))}
                        {word.stars > 0 && (
                          <span className="ml-0.5 text-zinc-500 text-xs">
                            {word.stars}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleSetStudied(word.id, word.text, true)}
                        className="px-2.5 py-1 rounded-md text-xs bg-zinc-700/50 text-zinc-300 hover:bg-emerald-500/30 hover:text-emerald-200 transition-colors"
                      >
                        Estudei
                      </button>
                      <button
                        onClick={() => handleDelete(word.id, word.text)}
                        title="Remover palavra"
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                          deletingId === word.id
                            ? "bg-red-600/80 text-white"
                            : "bg-zinc-700/50 hover:bg-red-600/40 text-zinc-500 hover:text-red-300"
                        }`}
                      >
                        {deletingId === word.id ? "confirmar?" : "x"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-zinc-500">
                Estudadas
              </h3>
              <span className="text-xs text-zinc-500">{studiedWords.length}</span>
            </div>
            {studiedWords.length === 0 ? (
              <div className="text-center py-5 text-sm text-zinc-600 border border-zinc-800 rounded-lg">
                Nenhuma palavra estudada.
              </div>
            ) : (
              <div className="space-y-1.5">
                {studiedWords.map((word) => {
                  const badge = levelBadge(word.stars);
                  return (
                    <div
                      key={word.id}
                      className="group flex items-center gap-3 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/30 rounded-lg px-4 py-3 transition-colors"
                    >
                      <span className="text-zinc-100 font-medium flex-1 text-left">
                        {word.text}
                      </span>
                      {badge && (
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-medium hidden sm:inline ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      )}
                      <span
                        className={`text-sm tabular-nums min-w-[2rem] text-right ${starLevel(word.stars)}`}
                      >
                        {"*".repeat(Math.min(word.stars, 5))}
                        {word.stars > 0 && (
                          <span className="ml-0.5 text-zinc-500 text-xs">
                            {word.stars}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleSetStudied(word.id, word.text, false)}
                        className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/20 text-emerald-300 hover:bg-zinc-700 hover:text-zinc-300 transition-colors"
                      >
                        Voltar fila
                      </button>
                      <button
                        onClick={() => handleRepeat(word.id, word.text)}
                        disabled={repeatWord.isPending}
                        title="Repetir palavra"
                        className="px-2.5 py-1 rounded-md text-xs bg-zinc-700/50 hover:bg-violet-600/80 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-400 hover:text-white transition-colors"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleDelete(word.id, word.text)}
                        title="Remover palavra"
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                          deletingId === word.id
                            ? "bg-red-600/80 text-white"
                            : "bg-zinc-700/50 hover:bg-red-600/40 text-zinc-500 hover:text-red-300"
                        }`}
                      >
                        {deletingId === word.id ? "confirmar?" : "x"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
