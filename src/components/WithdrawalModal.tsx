import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Landmark, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function WithdrawalModal() {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const balance = profile?.balance ?? 0;

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 10) {
      toast.error('O valor mínimo de saque é R$ 10,00');
      return;
    }

    if (withdrawAmount > balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    if (!pixKey) {
      toast.error('Informe uma chave PIX');
      return;
    }

    setLoading(true);
    try {
      // 1. Create withdrawal record
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          profile_id: profile?.id,
          amount: withdrawAmount,
          pix_key: pixKey,
          status: 'pending'
        });

      if (withdrawalError) throw withdrawalError;

      // 2. Update balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: balance - withdrawAmount })
        .eq('id', profile?.id);

      if (balanceError) throw balanceError;

      toast.success('Solicitação de saque enviada!');
      await refreshProfile();
      setOpen(false);
      setAmount('');
      setPixKey('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error('Erro ao processar saque: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="h-10 px-4 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold rounded-full active:scale-95 transition-all">
          <Landmark className="h-4 w-4" />
          <span className="text-xs font-black uppercase tracking-tighter">Saque</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950 border-t-2 border-primary/20 p-0 rounded-t-[2.5rem] focus:outline-none">
        <div className="mx-auto w-12 h-1.5 bg-white/10 rounded-full mt-4 mb-2" />
        <DrawerHeader className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 glow-gold">
               <Wallet className="h-6 w-6 text-primary" />
             </div>
             <div>
               <DrawerTitle className="text-2xl font-black text-primary text-glow-gold uppercase italic tracking-tighter">Resgatar</DrawerTitle>
               <p className="text-xs text-muted-foreground uppercase font-black tracking-widest leading-none">Via PIX Instantâneo</p>
             </div>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-6 py-8 space-y-6">
          <div className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 space-y-1 relative overflow-hidden flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-black text-muted-foreground tracking-widest">Saldo Disponível</p>
              <p className="text-3xl font-[1000] text-white italic tracking-tight">R$ {balance.toFixed(2)}</p>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl pointer-events-none" />
          </div>

          <form onSubmit={handleWithdrawal} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Valor do Saque</Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">R$</span>
                  <Input
                    id="amount"
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-[60px] bg-white/5 border-2 border-white/10 rounded-[1.25rem] pl-12 text-xl font-black focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Sua Chave PIX</Label>
                <Input
                  id="pix"
                  placeholder="CPF, E-mail ou Telefone"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="h-[60px] bg-white/5 border-2 border-white/10 rounded-[1.25rem] font-bold text-base focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] glow-gold rounded-[1.25rem] transition-all active:scale-[0.98] group italic"
              disabled={loading}
            >
              {loading ? "Processando..." : (
                <div className="flex items-center gap-3">
                  Confirmar Saque
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-2 justify-center py-3 px-5 rounded-full bg-zinc-900 border border-white/5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs uppercase font-black text-muted-foreground tracking-tight">Seguro • Instantâneo • 24/7</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
