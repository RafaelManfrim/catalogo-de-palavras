import { useState, useRef, useEffect, type FormEvent } from "react";
import toast from "react-hot-toast";
import { useSearchWords, useAddWord } from "../hooks/useWords";

export function WordInput() {
  const [value, setValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: suggestions = [] } = useSearchWords(value.trim());
  const addWord = useAddWord();

  const exactMatch = suggestions.find(
    (w) => w.text === value.trim().toLowerCase()
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;

    addWord.mutate(text, {
      onSuccess: (word) => {
        if (exactMatch?.studied) {
          toast.success(`"${text.toLowerCase()}" repetida com sucesso (+1 estrela).`);
        } else {
          const extras = [
            word.partOfSpeech ? `classe: ${word.partOfSpeech}` : null,
            word.phonetic ? `fonetica: ${word.phonetic}` : null,
            word.audioUrls.length > 0 ? `${word.audioUrls.length} audio(s)` : null,
          ]
            .filter(Boolean)
            .join(" | ");
          toast.success(
            extras
              ? `"${text.toLowerCase()}" adicionada (${extras}).`
              : `"${text.toLowerCase()}" adicionada.`
          );
        }
        setValue("");
        setShowDropdown(false);
      },
      onError: (error: any) => {
        if (error?.status === 409 && error?.word) {
          setValue(error.word.text);
          setShowDropdown(true);
        }
        toast.error(error?.error || "Erro ao adicionar palavra.");
      },
    });
  };

  function starLevel(stars: number): string {
    if (stars >= 6) return "text-amber-400";
    if (stars >= 3) return "text-zinc-300";
    if (stars >= 1) return "text-orange-400";
    return "text-zinc-600";
  }

  const isPending = addWord.isPending;

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => value.trim() && setShowDropdown(true)}
            placeholder="Type a word..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
            autoComplete="off"
            spellCheck={false}
          />

          {showDropdown && value.trim() && suggestions.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 left-0 right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
            >
              {suggestions.map((word) => (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => {
                    setValue(word.text);
                    setShowDropdown(false);
                    inputRef.current?.focus();
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-700/60 transition-colors text-left"
                >
                  <span className="text-zinc-200">
                    {word.text === value.trim().toLowerCase() ? (
                      <span className="text-violet-400 font-medium">
                        {word.text}
                        <span className="ml-2 text-xs text-violet-400/70">
                          {word.studied
                            ? "-- estudada, Enter para repetir"
                            : "-- ja existe, ainda nao estudada"}
                        </span>
                      </span>
                    ) : (
                      word.text
                    )}
                  </span>
                  <span
                    className={`text-sm tabular-nums ${starLevel(word.stars)}`}
                  >
                    {"*".repeat(Math.min(word.stars, 10))}
                    {word.stars > 0 && (
                      <span className="ml-1 text-zinc-500">{word.stars}</span>
                    )}
                    <span
                      className={`ml-2 text-[10px] uppercase ${
                        word.studied ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {word.studied ? "estudada" : "na fila"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!value.trim() || isPending}
          className="px-5 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-violet-600 hover:bg-violet-500 text-white shrink-0"
        >
          {isPending ? "..." : exactMatch?.studied ? "Repetir" : "Adicionar"}
        </button>
      </div>
    </form>
  );
}
