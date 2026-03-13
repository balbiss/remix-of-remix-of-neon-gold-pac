export interface RoundResult {
  id: number;
  amount: number;
  won: boolean;
}

interface RoundHistoryProps {
  rounds: RoundResult[];
}

export function RoundHistory({ rounds }: RoundHistoryProps) {
  if (rounds.length === 0) return null;

  return (
    <div className="glass-panel rounded-xl p-2.5 mt-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5">
        Últimas Rodadas
      </p>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {rounds.slice(-8).reverse().map(r => (
          <div
            key={r.id}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-black ${
              r.won
                ? 'bg-neon-green/15 text-neon-green'
                : 'bg-neon-red/15 text-neon-red'
            }`}
          >
            {r.won ? '+' : '-'}R$ {Math.abs(r.amount).toFixed(2)}
          </div>
        ))}
      </div>
    </div>
  );
}
