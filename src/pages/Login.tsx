import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Wallet, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen relative overflow-hidden flex flex-col items-center justify-center px-6 py-12 select-none bg-black">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[30%] h-[30%] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-[320px] z-10 space-y-8">
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-8 duration-700">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 glow-gold mb-2 rotate-6">
             <Wallet className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-black text-primary text-glow-gold tracking-tighter uppercase italic leading-none">
              PAC<span className="text-white">BET</span>
            </h1>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.4em] font-black opacity-60">
              The Premium Experience
            </p>
          </div>
        </div>

        <div className="auth-card border-2 border-white/5 bg-zinc-950/60 backdrop-blur-3xl p-8 rounded-[2rem] shadow-[0_20px_100px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Seu E-mail</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[56px] bg-black/40 border-2 border-white/10 rounded-2xl pl-12 focus:border-primary/50 text-base font-bold placeholder:text-zinc-800 transition-all"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase font-black text-muted-foreground tracking-widest ml-1">Sua Senha</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-[56px] bg-black/40 border-2 border-white/10 rounded-2xl pl-12 focus:border-primary/50 text-base font-bold placeholder:text-zinc-800 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-[60px] text-base font-black uppercase tracking-[0.2em] glow-gold rounded-2xl transition-all active:scale-[0.98] mt-4 shadow-xl italic"
              disabled={loading}
            >
              {loading ? "Entrando..." : (
                <div className="flex items-center gap-2">
                  Entrar na Arena
                  <LogIn className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">
              Novo por aqui?{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-white transition-colors underline underline-offset-8"
              >
                Crie sua conta
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 text-[8px] uppercase font-black tracking-[0.3em] text-zinc-800 pointer-events-none">
        Secure Encryption & Fair Play
      </div>
    </div>
  );
};

export default Login;
