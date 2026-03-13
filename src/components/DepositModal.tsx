import { useState } from 'react';
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
import { Plus, Wallet, QrCode, Copy, CheckCircle2, X } from "lucide-react";
import { toast } from 'sonner';

const QUICK_AMOUNTS = [20, 50, 100];

export function DepositModal() {
  const [amount, setAmount] = useState('');
  const [showPix, setShowPix] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGeneratePix = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 1) {
      toast.error('Insira um valor válido');
      return;
    }
    setShowPix(true);
    toast.success('Código PIX gerado!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('00020126580014BR.GOV.BCB.PIX0136pacbet-pix-ficticio-1234-5678-90ab5204000053039865405' + amount + '5802BR5913PAC BET GAMES6009SAO PAULO62070503***6304E2D8');
    setCopied(true);
    toast.success('Copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer open={open} onOpenChange={(val) => { setOpen(val); if (!val) setShowPix(false); }}>
      <DrawerTrigger asChild>
        <button className="flex items-center justify-center w-[40px] h-[40px] bg-primary rounded-full hover:scale-105 active:scale-95 transition-all glow-gold shadow-[0_0_20px_rgba(255,215,0,0.4)]">
          <Plus className="h-5 w-5 text-black font-black" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950 border-t-2 border-primary/20 p-0 rounded-t-[2.5rem] focus:outline-none">
        <div className="mx-auto w-12 h-1.5 bg-white/10 rounded-full mt-4 mb-2" />
        <DrawerHeader className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 glow-gold">
               <QrCode className="h-6 w-6 text-primary" />
             </div>
             <div>
               <DrawerTitle className="text-2xl font-black text-primary text-glow-gold uppercase italic tracking-tighter">Recarga</DrawerTitle>
               <p className="text-xs text-muted-foreground uppercase font-black tracking-widest leading-none">Instantâneo via PIX</p>
             </div>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:text-white">
              <X className="h-6 w-6" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-6 py-8 space-y-8">
          {!showPix ? (
            <>
              <div className="space-y-4">
                <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Valores Rápidos</Label>
                <div className="grid grid-cols-3 gap-3">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className={`h-[56px] rounded-2xl font-black text-base transition-all border-2 relative overflow-hidden ${
                        amount === val.toString()
                          ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                          : 'bg-white/5 text-white border-white/10'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleGeneratePix} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="custom-amount" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Ou Digite o Valor</Label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-primary italic">R$</span>
                    <Input
                      id="custom-amount"
                      type="number"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-[72px] bg-white/5 border-2 border-white/10 rounded-[1.5rem] pl-16 text-2xl font-black text-white focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-18 py-8 text-xl font-black uppercase tracking-[0.2em] glow-gold rounded-[1.5rem] transition-all active:scale-[0.98] italic"
                  disabled={!amount}
                >
                  Gerar QR Code
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-5 bg-white rounded-[2rem] shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                <QrCode className="w-48 h-48 text-black" />
              </div>
              
              <div className="text-center space-y-1">
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Valor a pagar</p>
                <p className="text-4xl font-[1000] text-primary text-glow-gold italic italic uppercase">R$ {parseFloat(amount).toFixed(2)}</p>
              </div>

              <Button
                onClick={handleCopyCode}
                className={`w-full h-16 text-base font-black uppercase rounded-2xl transition-all shadow-xl active:scale-95 ${
                  copied ? 'bg-green-500 hover:bg-green-600 text-white' : 'glow-gold'
                }`}
              >
                {copied ? <CheckCircle2 className="h-5 w-5 mr-2" /> : <Copy className="h-5 w-5 mr-2" />}
                {copied ? 'Copiado' : 'Copiar Código PIX'}
              </Button>

              <button 
                onClick={() => setShowPix(false)}
                className="text-xs font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest"
              >
                Alterar Valor
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 justify-center py-3 px-5 rounded-full bg-zinc-900 border border-white/5">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-xs uppercase font-black text-muted-foreground tracking-tight">Depósito Automático • Sem Taxas</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
