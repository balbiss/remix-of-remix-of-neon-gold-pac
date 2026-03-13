import { Wallet, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { WithdrawalModal } from './WithdrawalModal';
import { DepositModal } from './DepositModal';
import { useNavigate } from 'react-router-dom';

export function GameHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const balance = profile?.balance ?? 0;

  return (
    <header className="relative w-full bg-black/80 backdrop-blur-xl border-b border-white/10 h-16 px-5 flex items-center justify-between z-50 shadow-lg">
      <div className="flex flex-col">
        <h1 className="text-base font-black tracking-tighter text-primary text-glow-gold leading-none italic uppercase">
          PAC <span className="text-white">BET</span>
        </h1>
        <p className="text-[12px] text-muted-foreground uppercase tracking-widest font-black opacity-40">Official Arena</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 py-2 px-3.5 rounded-full shadow-inner">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="font-black text-sm italic tracking-tight">
            R$ {balance.toFixed(2)}
          </span>
        </div>

        <WithdrawalModal />

        <DepositModal />

        <button 
          onClick={() => signOut()}
          className="ml-1 p-1 text-zinc-600 hover:text-white transition-colors"
          title="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
