import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Mail, Lock, User, CreditCard, ChevronRight, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10 space-y-12"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-primary/10 rounded-3xl border border-primary/20 flex items-center justify-center mb-4 glow-gold"
          >
            <div className="text-4xl">💎</div>
          </motion.div>
          <h1 className="text-6xl font-[1000] text-primary tracking-tighter uppercase italic leading-none text-glow-gold">
            PAC<span className="text-white">BET</span>
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-black opacity-40">
            High Stakes • Premium Gaming
          </p>
        </div>

        <div className="bg-zinc-950/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative">
          <div className="bottom-gradient absolute top-0 left-0" />
          
          <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-10">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Cadastro</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="login">
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleLogin} 
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nome@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock className="w-4 h-4" />}
                        required
                      />
                    </div>
                  </div>
                  <Button variant="premium" size="xl" className="w-full group" disabled={loading}>
                    {loading ? "Entrando..." : (
                      <span className="flex items-center gap-2">
                        Acessar Arena
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>

              <TabsContent value="signup">
                <motion.form 
                  key="signup-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSignup} 
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Nome Completo</Label>
                      <Input
                        id="fullname"
                        placeholder="Seu Nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        icon={<User className="w-4 h-4" />}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        placeholder="000.000.000-00"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        icon={<CreditCard className="w-4 h-4" />}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-sg">E-mail</Label>
                      <Input
                        id="email-sg"
                        type="email"
                        placeholder="seu@contato.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-sg">Senha</Label>
                      <Input
                        id="password-sg"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={<Lock className="w-4 h-4" />}
                        required
                      />
                    </div>
                  </div>
                  <Button variant="premium" size="xl" className="w-full group" disabled={loading}>
                    {loading ? "Processando..." : (
                      <span className="flex items-center gap-2">
                        Criar Perfil VIP
                        <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </motion.div>

      <div className="absolute bottom-10 text-[8px] uppercase font-black tracking-[0.4em] text-zinc-800 opacity-50">
        Premium Gaming Foundation • Verified Secure
      </div>
    </div>
  );
};

export default Auth;
