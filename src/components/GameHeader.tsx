import { Wallet, Plus } from 'lucide-react';

interface GameHeaderProps {
  balance: number;
}

export function GameHeader({ balance }: GameHeaderProps) {
  return (
    <header className="glass-panel px-3 py-2.5 flex items-center justify-between shrink-0">
      <h1 className="text-lg font-black tracking-wider text-primary text-glow-gold">
        PAC-<span className="text-secondary text-glow-blue">BET</span>
      </h1>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-xl">
          <Wallet className="h-3.5 w-3.5 text-primary" />
          <span className="font-bold text-foreground text-sm">
            R$ {balance.toFixed(2)}
          </span>
        </div>

        <button className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-xl font-bold text-xs active:scale-95 transition-transform glow-gold">
          <Plus className="h-3.5 w-3.5" />
          Depósito
        </button>
      </div>
    </header>
  );
}
