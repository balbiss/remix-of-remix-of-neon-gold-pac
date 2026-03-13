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
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
      {rounds.slice(-10).reverse().map(r => (
        <div
          key={r.id}
          className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-black border backdrop-blur-md ${
            r.won
              ? 'bg-green-500/10 text-green-500 border-green-500/20'
              : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}
        >
          {r.won ? '+$' : '-$'} {Math.abs(r.amount).toFixed(1)}
        </div>
      ))}
    </div>
  );
}
