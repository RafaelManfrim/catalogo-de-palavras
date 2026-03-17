import { useStats } from "../hooks/useWords";
import { FiBookOpen, FiCheckCircle, FiStar } from "react-icons/fi";

export function StatsBar() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-zinc-800/50 rounded-xl p-3 sm:p-4 animate-pulse h-16 sm:h-20"
          />
        ))}
      </div>
    );
  }

  const items = [
    { label: "Palavras", value: stats.totalWords, icon: FiBookOpen, color: "text-blue-400" },
    { label: "Estudadas", value: stats.studiedWords, icon: FiCheckCircle, color: "text-emerald-400" },
    { label: "Estrelas", value: stats.totalStars, icon: FiStar, color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 sm:p-4 text-center"
        >
          <div className={`text-xs sm:text-sm mb-1 ${item.color}`}>
            <item.icon className="inline mr-1 mb-0.5" />
            {item.label}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-zinc-100 tabular-nums">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
