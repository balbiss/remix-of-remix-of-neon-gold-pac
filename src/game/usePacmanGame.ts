import { useCallback, useEffect, useRef, useState } from 'react';
import { MAZE, COLS, ROWS, CELL_SIZE, countCoins, Direction, Position, Ghost } from './constants';
import { getGameDifficulty, registerWin, resetWinStreak } from './difficulty';
import { vibrateLight, vibrateLoss } from '@/utils/haptics';
import { playCoinSound, playLoseSound } from '@/utils/sounds';

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

const GHOST_CONFIGS = [
  { color: '#FF3C7F', glowColor: 'rgba(255,60,127,0.6)' },
  { color: '#00D4FF', glowColor: 'rgba(0,212,255,0.6)' },
  { color: '#00FF88', glowColor: 'rgba(0,255,136,0.6)' },
];

function findSpawn(type: number): Position {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === type) return { x: c, y: r };
    }
  }
  return { x: 9, y: 16 };
}

function findGhostSpawns(): Position[] {
  const spawns: Position[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === 3) spawns.push({ x: c, y: r });
    }
  }
  return spawns;
}

function canMove(maze: number[][], x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
    if (y === 10 && (x < 0 || x >= COLS)) return true;
    return false;
  }
  return maze[y][x] !== 0;
}

function wrapPos(pos: Position): Position {
  let { x, y } = pos;
  if (x < 0) x = COLS - 1;
  if (x >= COLS) x = 0;
  return { x, y };
}

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right'];
const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };

export function usePacmanGame() {
  const totalCoins = countCoins();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [coinsEaten, setCoinsEaten] = useState(0);
  const [maze, setMaze] = useState<number[][]>([]);
  const pacmanRef = useRef<Position>(findSpawn(4));
  const pacmanDirRef = useRef<Direction>('right');
  const nextDirRef = useRef<Direction>('right');
  const ghostsRef = useRef<Ghost[]>([]);
  const mouthOpenRef = useRef(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const tickRef = useRef(0);
  const glowPhaseRef = useRef(0);

  const initGame = useCallback(() => {
    const newMaze = MAZE.map(r => [...r]);
    setMaze(newMaze);
    pacmanRef.current = findSpawn(4);
    pacmanDirRef.current = 'right';
    nextDirRef.current = 'right';
    setCoinsEaten(0);

    const spawns = findGhostSpawns();
    ghostsRef.current = spawns.slice(0, 3).map((pos, i) => ({
      pos: { ...pos },
      dir: ALL_DIRS[i % 4],
      ...GHOST_CONFIGS[i],
    }));
  }, []);

  const startGame = useCallback(() => {
    initGame();
    setGameState('playing');
  }, [initGame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const map: Record<string, Direction> = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    const dir = map[e.key];
    if (dir) {
      e.preventDefault();
      nextDirRef.current = dir;
    }
  }, []);

  const setDirection = useCallback((dir: Direction) => {
    nextDirRef.current = dir;
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    window.addEventListener('keydown', handleKeyDown);

    const mazeRef = MAZE.map(r => [...r]);
    let localMaze = mazeRef;
    let localCoins = 0;

    // Get difficulty settings for this round
    const difficulty = getGameDifficulty();
    // Ghost tick interval: lower = faster. Base is 8 frames.
    const ghostTickInterval = Math.max(3, Math.round(8 / difficulty.ghostSpeedMultiplier));
    const chaseAccuracy = difficulty.chaseAccuracy;
    let ghostTickAccum = 0;

    const loop = () => {
      tickRef.current++;
      ghostTickAccum++;
      glowPhaseRef.current += 0.05;
      const canvas = canvasRef.current;
      if (!canvas) { animFrameRef.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animFrameRef.current = requestAnimationFrame(loop); return; }

      // Pacman moves every 8 frames (constant)
      if (tickRef.current % 8 === 0) {
        const nd = DIRS[nextDirRef.current];
        const np = wrapPos({ x: pacmanRef.current.x + nd.x, y: pacmanRef.current.y + nd.y });
        if (canMove(localMaze, np.x, np.y)) {
          pacmanDirRef.current = nextDirRef.current;
          pacmanRef.current = np;
        } else {
          const cd = DIRS[pacmanDirRef.current];
          const cp = wrapPos({ x: pacmanRef.current.x + cd.x, y: pacmanRef.current.y + cd.y });
          if (canMove(localMaze, cp.x, cp.y)) {
            pacmanRef.current = cp;
          }
        }

        const px = pacmanRef.current.x;
        const py = pacmanRef.current.y;
        if (py >= 0 && py < ROWS && px >= 0 && px < COLS && localMaze[py][px] === 1) {
          localMaze[py][px] = 2;
          localCoins++;
          setCoinsEaten(localCoins);
          vibrateLight();
          playCoinSound();
          if (localCoins >= totalCoins) {
            registerWin();
            setGameState('won');
            return;
          }
        }

        mouthOpenRef.current = !mouthOpenRef.current;
      }

      // Ghosts move on their own interval (affected by difficulty)
      if (ghostTickAccum >= ghostTickInterval) {
        ghostTickAccum = 0;

        ghostsRef.current.forEach(ghost => {
          const possible = ALL_DIRS.filter(d => {
            if (d === OPPOSITE[ghost.dir]) return false;
            const dd = DIRS[d];
            const gp = wrapPos({ x: ghost.pos.x + dd.x, y: ghost.pos.y + dd.y });
            return canMove(localMaze, gp.x, gp.y);
          });
          if (possible.length === 0) {
            ghost.dir = OPPOSITE[ghost.dir];
          } else {
            // Chase accuracy controlled by difficulty
            if (Math.random() < chaseAccuracy) {
              const pac = pacmanRef.current;
              possible.sort((a, b) => {
                const da = DIRS[a];
                const db = DIRS[b];
                const distA = Math.abs(ghost.pos.x + da.x - pac.x) + Math.abs(ghost.pos.y + da.y - pac.y);
                const distB = Math.abs(ghost.pos.x + db.x - pac.x) + Math.abs(ghost.pos.y + db.y - pac.y);
                return distA - distB;
              });
              ghost.dir = possible[0];
            } else {
              ghost.dir = possible[Math.floor(Math.random() * possible.length)];
            }
          }
          const dd = DIRS[ghost.dir];
          ghost.pos = wrapPos({ x: ghost.pos.x + dd.x, y: ghost.pos.y + dd.y });

          if (ghost.pos.x === pacmanRef.current.x && ghost.pos.y === pacmanRef.current.y) {
            vibrateLoss();
            playLoseSound();
            resetWinStreak();
            setGameState('lost');
            return;
          }
        });
      }

      // Draw
      const w = COLS * CELL_SIZE;
      const h = ROWS * CELL_SIZE;
      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);

      const glowIntensity = 0.5 + Math.sin(glowPhaseRef.current) * 0.3;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = localMaze[r][c];
          const cx = c * CELL_SIZE;
          const cy = r * CELL_SIZE;

          if (cell === 0) {
            ctx.fillStyle = '#0D1526';
            ctx.fillRect(cx, cy, CELL_SIZE, CELL_SIZE);
            ctx.strokeStyle = 'rgba(0,100,180,0.25)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(cx + 0.5, cy + 0.5, CELL_SIZE - 1, CELL_SIZE - 1);
          } else if (cell === 1) {
            ctx.fillStyle = '#0a0f1a';
            ctx.fillRect(cx, cy, CELL_SIZE, CELL_SIZE);
            const coinCx = cx + CELL_SIZE / 2;
            const coinCy = cy + CELL_SIZE / 2;
            const coinR = CELL_SIZE * 0.22;
            
            ctx.save();
            ctx.shadowColor = `rgba(255,215,0,${glowIntensity})`;
            ctx.shadowBlur = 10 + glowIntensity * 6;
            ctx.beginPath();
            ctx.arc(coinCx, coinCy, coinR, 0, Math.PI * 2);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            ctx.fill();
            ctx.restore();
            
            const grad = ctx.createRadialGradient(coinCx - coinR * 0.3, coinCy - coinR * 0.3, 0, coinCx, coinCy, coinR);
            grad.addColorStop(0, '#FFF8DC');
            grad.addColorStop(0.5, '#FFD700');
            grad.addColorStop(1, '#DAA520');
            ctx.beginPath();
            ctx.arc(coinCx, coinCy, coinR, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          } else {
            ctx.fillStyle = '#0a0f1a';
            ctx.fillRect(cx, cy, CELL_SIZE, CELL_SIZE);
          }
        }
      }

      // Pacman
      const pac = pacmanRef.current;
      const pcx = pac.x * CELL_SIZE + CELL_SIZE / 2;
      const pcy = pac.y * CELL_SIZE + CELL_SIZE / 2;
      const pr = CELL_SIZE * 0.45;
      const mouthAngle = mouthOpenRef.current ? 0.3 : 0.05;
      const dirAngles: Record<Direction, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
      const angle = dirAngles[pacmanDirRef.current];

      ctx.save();
      ctx.shadowColor = 'rgba(255,255,0,0.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pr, angle + mouthAngle * Math.PI, angle + (2 - mouthAngle) * Math.PI);
      ctx.lineTo(pcx, pcy);
      ctx.closePath();
      ctx.fillStyle = '#FFFF00';
      ctx.fill();
      ctx.restore();

      // Ghosts
      ghostsRef.current.forEach(ghost => {
        const gx = ghost.pos.x * CELL_SIZE + CELL_SIZE / 2;
        const gy = ghost.pos.y * CELL_SIZE + CELL_SIZE / 2;
        const gr = CELL_SIZE * 0.45;

        ctx.save();
        ctx.shadowColor = ghost.glowColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = ghost.color;

        ctx.beginPath();
        ctx.arc(gx, gy - gr * 0.2, gr, Math.PI, 0);
        ctx.lineTo(gx + gr, gy + gr * 0.6);
        const waves = 3;
        for (let i = 0; i < waves; i++) {
          const wx = gx + gr - (2 * gr / waves) * (i + 0.5);
          const wy = gy + gr * 0.3;
          ctx.quadraticCurveTo(gx + gr - (2 * gr / waves) * i - gr / waves, wy, wx, gy + gr * 0.6);
        }
        ctx.lineTo(gx - gr, gy + gr * 0.6);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(gx - gr * 0.3, gy - gr * 0.2, gr * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx + gr * 0.3, gy - gr * 0.2, gr * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(gx - gr * 0.25, gy - gr * 0.15, gr * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(gx + gr * 0.35, gy - gr * 0.15, gr * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    tickRef.current = 0;
    glowPhaseRef.current = 0;
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, handleKeyDown, totalCoins]);

  return {
    canvasRef,
    gameState,
    coinsEaten,
    totalCoins,
    startGame,
    setDirection,
    setGameState,
  };
}
