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
    <header className="relative w-full bg-black/80 backdrop-blur-xl border-b border-white/10 h-20 px-5 flex items-center justify-between z-50 shadow-lg">
      <div className="flex flex-col">
        <h1 className="text-xl font-black tracking-tighter text-primary text-glow-gold leading-none italic uppercase">
          PAC <span className="text-white">BET</span>
        </h1>
        <p className="text-[13px] text-muted-foreground uppercase tracking-widest font-black opacity-40">Official Arena</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-white/10 py-2.5 px-4 rounded-full shadow-inner">
          <Wallet className="h-5 w-5 text-primary" />
          <span className="font-black text-base italic tracking-tight">
            R$ {balance.toFixed(2)}
          </span>
        </div>

        <WithdrawalModal />

        <DepositModal />

        <button 
          onClick={() => signOut()}
          className="ml-1 p-2 text-zinc-600 hover:text-white transition-colors"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
