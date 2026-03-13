import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, QrCode, Copy, CheckCircle2, Wallet, Zap } from 'lucide-react';
import { toast } from 'sonner';

const QUICK_AMOUNTS = [20, 50, 100];

const Deposit = () => {
  const [amount, setAmount] = useState('');
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleGeneratePix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 1) {
      toast.error('Insira um valor válido para depósito');
      return;
    }
    setShowPix(true);
    toast.success('Código PIX gerado com sucesso!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136pacbet-pix-ficticio-1234-5678-90ab5204000053039865405' + amount + '5802BR5913PAC BET GAMES6009SAO PAULO62070503***6304E2D8');
    setCopied(true);
    toast.success('Código copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden select-none">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="p-5 flex items-center gap-4 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5 z-20">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-muted-foreground hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5 active:scale-90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-[1000] text-primary text-glow-gold uppercase italic tracking-tighter leading-none">Depósito Recarga</h1>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Instantâneo via PIX</p>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-md mx-auto w-full space-y-8 z-10 animate-in fade-in duration-500">
        {!showPix ? (
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Escolha um valor rápido</Label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {QUICK_AMOUNTS.map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className={`h-16 rounded-[1.5rem] font-black text-lg transition-all border relative overflow-hidden group ${
                      amount === val.toString()
                        ? 'bg-primary text-black border-primary glow-gold scale-95'
                        : 'bg-white/5 text-white border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="relative z-10">R$ {val}</span>
                    {amount === val.toString() && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGeneratePix} className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-3 w-3 text-muted-foreground" />
                  <Label htmlFor="custom-amount" className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Ou digite o valor</Label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 blur-2xl group-focus-within:bg-primary/10 transition-colors pointer-events-none" />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-[1000] text-primary/50 group-focus-within:text-primary transition-colors italic">R$</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-20 bg-white/5 border-white/10 pl-16 text-3xl font-[1000] text-white rounded-[2rem] focus:border-primary transition-all border-2 placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full h-20 text-xl font-[1000] uppercase tracking-[0.2em] glow-gold rounded-[2rem] transition-all active:scale-[0.98] italic"
                  disabled={!amount}
                >
                  Confirmar Recarga
                </Button>
                
                <p className="text-[10px] text-muted-foreground font-bold text-center uppercase tracking-widest opacity-50">
                  Sem taxas • Crédito Imediato • 100% Seguro
                </p>
              </div>
            </form>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col items-center gap-8">
              <div className="relative group">
                <div className="absolute inset-[-10px] bg-primary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="p-6 bg-white rounded-[3rem] relative shadow-[0_0_50px_rgba(255,215,0,0.3)] rotate-1 group-hover:rotate-0 transition-transform">
                  <div className="w-56 h-56 bg-zinc-50 flex items-center justify-center border-4 border-zinc-100 rounded-[2rem] relative overflow-hidden">
                    <QrCode className="w-48 h-48 text-black" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-muted-foreground font-black uppercase tracking-[0.3em] text-[10px]">Total a Pagar</p>
                <p className="text-5xl font-[1000] text-primary text-glow-gold italic italic uppercase tracking-tighter">R$ {parseFloat(amount).toFixed(2)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] block text-center">Pix Copia e Cola</Label>
              <div className="relative group">
                <textarea
                  readOnly
                  value="00020126580014BR.GOV.BCB.PIX0136pacbet-pix-ficticio-1234-5678..."
                  className="w-full h-28 bg-white/5 border border-white/10 rounded-[2.5rem] p-6 text-[10px] font-mono text-zinc-500 resize-none focus:outline-none focus:border-primary/30 transition-colors"
                />
                <Button
                  onClick={handleCopyCode}
                  className={`absolute bottom-4 right-4 h-12 px-6 font-black uppercase text-xs rounded-2xl transition-all shadow-xl active:scale-90 ${
                    copied ? 'bg-green-500 hover:bg-green-600 glow-none text-white' : 'glow-gold'
                  }`}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copiado' : 'Copiar Código'}
                </Button>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPix(false)}
                className="w-full h-14 border-white/10 hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
              >
                Alterar Valor
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full h-12 text-zinc-600 hover:text-white font-black uppercase tracking-tighter rounded-2xl text-[10px]"
              >
                Voltar para o Início
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 text-center pointer-events-none opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">Global Payment Gateway • PAC BET Official</p>
      </div>
    </div>
  );
};

export default Deposit;
