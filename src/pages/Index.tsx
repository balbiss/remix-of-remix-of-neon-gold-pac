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

const Index = () => {
  const [balance, setBalance] = useState(100);
  const [betAmount, setBetAmount] = useState(5);
  const [rounds, setRounds] = useState<RoundResult[]>([]);
  const [roundCounter, setRoundCounter] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const { canvasRef, gameState, coinsEaten, totalCoins, startGame, setDirection, setGameState } = usePacmanGame();

  const coinValue = totalCoins > 0 ? (betAmount * 2) / totalCoins : 0;
  const earnings = coinsEaten * coinValue;
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

  const handlePlay = () => {
    if (betAmount > balance || betAmount <= 0) return;
    setBalance(prev => prev - betAmount);
    setCashedOut(false);
    startGame();
  };

  const handleCashOut = () => {
    if (!isPlaying || earnings <= 0) return;
    setCashedOut(true);
    playWinSound();
    setGameState('won');
  };

  const handleOverlayClose = () => {
    const won = gameState === 'won';
    const cashOutAmount = cashedOut ? earnings : (won ? betAmount * 2 : 0);

    if (won) {
      setBalance(prev => prev + cashOutAmount);
    }

    setRoundCounter(prev => prev + 1);
    setRounds(prev => [
      ...prev,
      { id: roundCounter, amount: cashedOut ? earnings : betAmount, won },
    ]);
    setCashedOut(false);
    setGameState('idle');
  };

  const overlayAmount = cashedOut ? earnings : betAmount;

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden select-none">
      <GameHeader balance={balance} />

      {/* Game canvas */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className={`w-full relative ${isPlaying ? 'max-w-full h-full flex items-center justify-center' : 'max-w-[480px] px-0.5 py-1'}`}>
          <canvas
            ref={canvasRef}
            width={COLS * CELL_SIZE}
            height={ROWS * CELL_SIZE}
            className="block rounded-lg w-full h-auto"
          />
          {isPlaying && (
            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-lg px-2.5 py-1">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-tight">Ganhos</p>
              <p className="text-sm font-black text-primary text-glow-gold leading-tight">
                R$ {earnings.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Bet Panel + Round History — hidden during gameplay */}
      {!isPlaying && (
        <div className="shrink-0 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <BetPanel
            betAmount={betAmount}
            onBetChange={setBetAmount}
            onPlay={handlePlay}
            disabled={isPlaying || betAmount > balance || betAmount <= 0}
            earnings={earnings}
            isPlaying={isPlaying}
          />
          <RoundHistory rounds={rounds} />
        </div>
      )}

      {/* Cash Out Button — visible during gameplay */}
      {(isPlaying || isLost) && (
        <CashOutButton earnings={earnings} onCashOut={handleCashOut} lost={isLost} />
      )}

      {/* Virtual Joystick */}
      <VirtualJoystick onDirection={setDirection} enabled={isPlaying} />

      {/* Golden particles on win */}
      <GoldenParticles active={showParticles} />

      {(gameState === 'won' || gameState === 'lost') && (
        <GameOverlay type={gameState} amount={overlayAmount} onClose={handleOverlayClose} />
      )}
    </div>
  );
};

export default Index;
