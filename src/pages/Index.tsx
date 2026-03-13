import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { BetPanel } from '@/components/BetPanel';
import { GameOverlay } from '@/components/GameOverlay';
import { GoldenParticles } from '@/components/GoldenParticles';
import { VirtualJoystick } from '@/components/VirtualJoystick';
import { RoundHistory, RoundResult } from '@/components/RoundHistory';
import { CashOutButton } from '@/components/CashOutButton';
import { usePacmanGame } from '@/game/usePacmanGame';
import { useSwipeControls } from '@/hooks/useSwipeControls';
import { playWinSound } from '@/utils/sounds';
import { COLS, ROWS, CELL_SIZE } from '@/game/constants';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Index = () => {
  const { profile, refreshProfile } = useAuth();
  const balance = profile?.balance ?? 0;
  const [betAmount, setBetAmount] = useState(5);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [roundCounter, setRoundCounter] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const { canvasRef, gameState, coinsEaten, totalCoins, currentMultiplier, startGame, setDirection, setGameState } = usePacmanGame();

  const earnings = betAmount * currentMultiplier;
  const isPlaying = gameState === 'playing';
  const showParticles = gameState === 'won' || cashedOut;
  const isLost = gameState === 'lost';

  useSwipeControls(setDirection, isPlaying);

  useEffect(() => {
    if (!isPlaying) return;
    const prevent = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest?.('[data-no-swipe]')) return;
      e.preventDefault();
    };
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.addEventListener('touchmove', prevent, { passive: false });
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.removeEventListener('touchmove', prevent);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (gameState === 'won') {
      playWinSound();
    }
  }, [gameState]);

  const handlePlay = async () => {
    if (!profile) return;
    if (betAmount > balance || betAmount <= 0) {
      toast.error('Saldo insuficiente ou aposta inválida');
      return;
    }

    try {
      // Deduct balance in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ balance: balance - betAmount })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
      setCashedOut(false);
      startGame();
    } catch (error: any) {
      toast.error('Erro ao iniciar jogo: ' + error.message);
    }
  };

  const handleCashOut = async () => {
    if (!isPlaying || earnings <= 0 || !profile) return;
    
    try {
      setCashedOut(true);
      playWinSound();
      
      // Update balance in Supabase with earnings
      const { error } = await supabase
        .from('profiles')
        .update({ balance: balance + earnings })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      setGameState('won');
    } catch (error: any) {
      toast.error('Erro ao resgatar: ' + error.message);
    }
  };

  const handleOverlayClose = async () => {
    const won = gameState === 'won';
    // If they won by eating all coins (not manual cashout)
    if (won && !cashedOut && profile) {
      const winAmount = betAmount * 2;
      try {
        await supabase
          .from('profiles')
          .update({ balance: balance + winAmount })
          .eq('id', profile.id);
        
        await refreshProfile();
      } catch (error) {
        console.error('Error auto-claiming win:', error);
      }
    }

    const wonAmount = won ? (cashedOut ? earnings : betAmount * currentMultiplier) : 0;

    setRoundCounter(prev => prev + 1);
    setRounds(prev => [
      ...prev,
      { id: roundCounter, amount: won ? wonAmount : betAmount, won },
    ]);
    setCashedOut(false);
    setGameState('idle');
  };

  const overlayAmount = cashedOut ? earnings : betAmount;

  return (
    <div className="game-container">
      <GameHeader />

      <main className="game-content-scrollable">
        <div className="game-canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={COLS * CELL_SIZE}
            height={ROWS * CELL_SIZE}
            className="block shadow-[0_0_80px_rgba(0,0,0,0.8)]"
          />
          {isPlaying && (
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/10 glow-gold">
              <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest leading-tight">Ganhos</p>
              <p className="text-base font-[1000] text-primary text-glow-gold leading-tight italic">
                R$ {earnings.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="bet-panel-fixed">
        {!isPlaying ? (
          <div className="w-full space-y-0">
            <div className="px-4 py-1">
              <RoundHistory rounds={rounds} />
            </div>
            <BetPanel
              betAmount={betAmount}
              onBetChange={setBetAmount}
              onPlay={handlePlay}
              disabled={isPlaying || betAmount > balance || betAmount <= 0}
              earnings={earnings}
              isPlaying={isPlaying}
            />
          </div>
        ) : (
          <div className="w-full pb-8 px-4 pt-2">
            <CashOutButton earnings={earnings} onCashOut={handleCashOut} lost={isLost} />
          </div>
        )}
      </footer>

      <VirtualJoystick onDirection={setDirection} enabled={isPlaying} />
      <GoldenParticles active={showParticles} />

      {(gameState === 'won' || gameState === 'lost') && (
        <GameOverlay type={gameState} amount={overlayAmount} onClose={handleOverlayClose} />
      )}
    </div>
  );
};

export default Index;
