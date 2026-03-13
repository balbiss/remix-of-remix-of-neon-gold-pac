import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, ShieldCheck, User, Mail, Lock, CreditCard } from "lucide-react";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signUp(email, password, fullName, cpf);
      if (error) throw error;
      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen relative overflow-hidden flex flex-col items-center justify-center px-6 py-10 select-none bg-black">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[320px] z-10 space-y-6">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-700">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 glow-gold mb-1 -rotate-3">
             <ShieldCheck className="w-8 h-8 text-primary drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-black text-primary text-glow-gold tracking-tighter uppercase italic leading-none">
              PAC<span className="text-white">BET</span>
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.3em] font-black opacity-60">
              Gold Standard Gaming
            </p>
          </div>
        </div>

        <div className="auth-card border-2 border-white/5 bg-zinc-950/60 backdrop-blur-3xl p-7 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Nome Completo</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="fullName"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-[48px] bg-black/40 border-2 border-white/10 rounded-xl pl-12 text-sm font-bold transition-all focus:border-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="cpf" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">CPF</Label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="h-[48px] bg-black/40 border-2 border-white/10 rounded-xl pl-12 text-sm font-bold transition-all focus:border-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[48px] bg-black/40 border-2 border-white/10 rounded-xl pl-12 text-sm font-bold transition-all focus:border-primary/50"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[48px] bg-black/40 border-2 border-white/10 rounded-xl pl-12 text-sm font-bold transition-all focus:border-primary/50"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-base font-black uppercase tracking-[0.2em] glow-gold rounded-xl transition-all active:scale-[0.98] mt-4 py-6 shadow-xl italic"
              disabled={loading}
            >
              {loading ? "..." : (
                <div className="flex items-center gap-2">
                  Criar Conta
                  <UserPlus className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
              Já tem conta?{" "}
              <Link
                to="/login"
                className="text-primary hover:text-white transition-colors underline underline-offset-8"
              >
                Faça Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
