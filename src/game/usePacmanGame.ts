import { useCallback, useEffect, useRef, useState } from 'react';
import { MAZE, COLS, ROWS, countCoins, Direction, Position, Ghost } from './constants';
import { vibrateLight, vibrateLoss } from '@/utils/haptics';
import { playCoinSound, playLoseSound } from '@/utils/sounds';

export type GameState = 'idle' | 'playing' | 'won' | 'lost';

const GHOST_CONFIGS = [
  { color: '#FF3C7F', glowColor: 'rgba(255,60,127,0.6)' },
  { color: '#00D4FF', glowColor: 'rgba(0,212,255,0.6)' },
  { color: '#00FF88', glowColor: 'rgba(0,255,136,0.6)' },
];

const SPEED = 0.125; // 1 unit every 8 frames for perfect grid alignment

function findSpawn(type: number): Position {
  for (let r = 0; r < MAZE.length; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === type) return { x: c, y: r };
    }
  }
  return { x: 9, y: 16 };
}

function findGhostSpawns(): Position[] {
  const spawns: Position[] = [];
  for (let r = 0; r < MAZE.length; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAZE[r][c] === 3) spawns.push({ x: c, y: r });
    }
  }
  return spawns;
}

function canMove(maze: number[][], x: number, y: number, dir?: Direction): boolean {
  // Strict look-ahead: we check if the cell we are entering is a wall (0)
  // Pac-Man is always centered on one axis, so we only check the axis of movement
  const rX = Math.round(x);
  const rY = Math.round(y);

  if (rY < 0 || rY >= maze.length || rX < 0 || rX >= COLS) return false;
  
  // If moving, check both the rounded position and the "floor/ceil" based on direction
  // to ensure we never even touch the wall boundary pixels
  const px = dir === 'left' ? Math.floor(x + 0.05) : dir === 'right' ? Math.ceil(x - 0.05) : rX;
  const py = dir === 'up' ? Math.floor(y + 0.05) : dir === 'down' ? Math.ceil(y - 0.05) : rY;

  return maze[py]?.[px] !== 0;
}

const DIRS: Record<Direction, Position> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
  left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const ALL_DIRS: Direction[] = ['up', 'down', 'left', 'right'];

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
  const glowPhaseRef = useRef(0);

  const initGame = useCallback(() => {
    setMaze(MAZE.map(r => [...r]));
    pacmanRef.current = findSpawn(4);
    pacmanDirRef.current = 'right';
    nextDirRef.current = 'right';
    setCoinsEaten(0);
    const spawns = findGhostSpawns();
    ghostsRef.current = spawns.slice(0, 3).map((pos, i) => ({
      pos: { ...pos }, dir: ALL_DIRS[(i + 2) % 4], ...GHOST_CONFIGS[i],
    }));
  }, []);

  const startGame = useCallback(() => { initGame(); setGameState('playing'); }, [initGame]);
  const setDirection = useCallback((dir: Direction) => { nextDirRef.current = dir; }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const localMaze = MAZE.map(r => [...r]);
    let localCoins = 0;

    const loop = () => {
      glowPhaseRef.current += 0.05;
      const canvas = canvasRef.current;
      if (!canvas) { animFrameRef.current = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animFrameRef.current = requestAnimationFrame(loop); return; }

        // Logic: Move entities
        const moveEntity = (ent: { pos: Position, dir: Direction }, isPacman = false) => {
          const atCenter = Number.isInteger(ent.pos.x) && Number.isInteger(ent.pos.y);
          
          if (atCenter) {
            const targetDir = isPacman ? nextDirRef.current : ent.dir;
            const nextV = DIRS[targetDir];
            
            // Check if can turn or continue
            if (canMove(localMaze, ent.pos.x + nextV.x, ent.pos.y + nextV.y, targetDir)) {
              ent.dir = targetDir;
            } else {
              const currentV = DIRS[ent.dir];
              // If cannot move in current direction, must stop or change
              if (!canMove(localMaze, ent.pos.x + currentV.x, ent.pos.y + currentV.y, ent.dir)) {
                if (!isPacman) {
                  const options = ALL_DIRS.filter(d => d !== OPPOSITE[ent.dir] && canMove(localMaze, ent.pos.x + DIRS[d].x, ent.pos.y + DIRS[d].y, d));
                  ent.dir = options.length > 0 ? options[Math.floor(Math.random() * options.length)] : OPPOSITE[ent.dir];
                } else {
                  return; // Stop Pacman
                }
              }
            }
          }

          const v = DIRS[ent.dir];
          const nextX = parseFloat((ent.pos.x + v.x * SPEED).toFixed(3));
          const nextY = parseFloat((ent.pos.y + v.y * SPEED).toFixed(3));

          // Strict Rigid Collision: If next position is invalid, snap to grid center
          if (canMove(localMaze, nextX, nextY, ent.dir)) {
            ent.pos.x = nextX;
            ent.pos.y = nextY;
          } else {
            ent.pos.x = Math.round(ent.pos.x);
            ent.pos.y = Math.round(ent.pos.y);
          }
        };

      moveEntity({ pos: pacmanRef.current, dir: pacmanDirRef.current }, true);
      pacmanDirRef.current = nextDirRef.current; // Buffer check handled inside moveEntity

      // Pacman collisions (Precise collection at center)
      const px = pacmanRef.current.x;
      const py = pacmanRef.current.y;
      const gridX = Math.round(px);
      const gridY = Math.round(py);
      
      // Collect only when very close to center of a coin cell
      const distToCenter = Math.sqrt(Math.pow(px - gridX, 2) + Math.pow(py - gridY, 2));
      
      if (distToCenter < 0.2 && localMaze[gridY]?.[gridX] === 1) {
        localMaze[gridY][gridX] = 2;
        localCoins++;
        setCoinsEaten(localCoins);
        vibrateLight();
        playCoinSound();
        if (localCoins >= totalCoins) { setGameState('won'); return; }
      }

      ghostsRef.current.forEach(ghost => {
        moveEntity(ghost);
        const dx = Math.abs(ghost.pos.x - pacmanRef.current.x);
        const dy = Math.abs(ghost.pos.y - pacmanRef.current.y);
        if (dx < 0.75 && dy < 0.75) { // Increased death radius for fairness
          vibrateLoss();
          playLoseSound();
          setGameState('lost');
          return;
        }
      });

      mouthOpenRef.current = Math.sin(Date.now() / 80) > 0;

      // Draw: Dynamic cell sizing for 100vw
      const cellW = canvas.width / COLS;
      const cellH = canvas.height / MAZE.length;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let r = 0; r < MAZE.length; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = localMaze[r][c];
          const x = c * cellW;
          const y = r * cellH;
          if (cell === 0) {
            ctx.fillStyle = '#060B19'; // Original deep blue/black wall
            ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
            ctx.strokeStyle = '#0066FF'; // Target blue neon
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1.5, y + 1.5, cellW - 3, cellH - 3);
          } else if (cell === 1) {
            ctx.fillStyle = '#FFD700';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(x + cellW / 2, y + cellH / 2, cellW * 0.12, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw entities
      const drawEnt = (pos: Position, color: string, isPac: boolean, dir?: Direction) => {
        const ex = pos.x * cellW + cellW / 2;
        const ey = pos.y * cellH + cellH / 2;
        const r = cellW * 0.45;
        ctx.save();
        ctx.shadowBlur = 10; ctx.shadowColor = color;
        ctx.fillStyle = color;
        if (isPac) {
          const angles: Record<Direction, number> = { right: 0, down: 0.5, left: 1, up: 1.5 };
          const startAngle = angles[dir || pacmanDirRef.current];
          const mouthSize = mouthOpenRef.current ? 0.22 : 0.04;
          
          ctx.beginPath();
          ctx.arc(ex, ey, r, (startAngle + mouthSize) * Math.PI, (startAngle + 2 - mouthSize) * Math.PI);
          ctx.lineTo(ex, ey);
          ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(ex, ey - r * 0.2, r, Math.PI, 0);
          ctx.lineTo(ex + r, ey + r * 0.6);
          ctx.lineTo(ex - r, ey + r * 0.6); ctx.fill();
          ctx.fillStyle = 'white'; ctx.beginPath();
          ctx.arc(ex - r * 0.3, ey - r * 0.2, r * 0.25, 0, Math.PI * 2);
          ctx.arc(ex + r * 0.3, ey - r * 0.2, r * 0.25, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'black'; ctx.beginPath();
          ctx.arc(ex - r * 0.2, ey - r * 0.1, r * 0.1, 0, Math.PI * 2);
          ctx.arc(ex + r * 0.4, ey - r * 0.1, r * 0.1, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      };

      drawEnt(pacmanRef.current, '#FFFF00', true, pacmanDirRef.current);
      ghostsRef.current.forEach(g => drawEnt(g.pos, g.color, false, g.dir));

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, totalCoins]);

  return { canvasRef, gameState, coinsEaten, totalCoins, startGame, setDirection, setGameState };
}
