import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAudio } from "./useAudio";

export type GamePhase = "ready" | "playing" | "ended";

interface RobotGameState {
  phase: GamePhase;
  score: number;
  lives: number;
  time: number;
  playerName: string;
  highScores: { playerName: string; score: number; timeElapsed: number }[];
  
  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  updateTime: (delta: number) => void;
  setPlayerName: (name: string) => void;
  setHighScores: (scores: { playerName: string; score: number; timeElapsed: number }[]) => void;
}

export const useRobotGame = create<RobotGameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    score: 0,
    lives: 3,
    time: 0,
    playerName: "",
    highScores: [],
    
    start: () => {
      set(() => ({ 
        phase: "playing",
        score: 0,
        lives: 3,
        time: 0
      }));
      
      // Set up game timer
      let lastTime = performance.now();
      
      // Function to update the game timer
      const updateGameTimer = () => {
        if (get().phase !== "playing") return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;
        
        set(state => ({ time: state.time + deltaTime }));
        
        // Continue updating the timer
        requestAnimationFrame(updateGameTimer);
      };
      
      // Start the game timer
      requestAnimationFrame(updateGameTimer);
    },
    
    restart: () => {
      set(() => ({ 
        phase: "ready",
        score: 0,
        lives: 3,
        time: 0
      }));
    },
    
    end: () => {
      set((state) => {
        // Only transition from playing to ended
        if (state.phase === "playing") {
          return { phase: "ended" };
        }
        return {};
      });
    },
    
    addScore: (points) => {
      set(state => ({ score: state.score + points }));
      
      // Play success sound when score is added
      useAudio.getState().playSuccess();
    },
    
    loseLife: () => {
      set(state => {
        const newLives = state.lives - 1;
        
        // Play hit sound when losing a life
        useAudio.getState().playHit();
        
        // End game if no lives left
        if (newLives <= 0) {
          return { lives: 0, phase: "ended" };
        }
        
        return { lives: newLives };
      });
    },
    
    updateTime: (delta) => {
      set(state => ({ time: state.time + delta }));
    },
    
    setPlayerName: (name) => {
      set(() => ({ playerName: name }));
    },
    
    setHighScores: (scores) => {
      set(() => ({ highScores: scores }));
    }
  }))
);

// Subscribe to state changes for debugging
if (process.env.NODE_ENV === 'development') {
  useRobotGame.subscribe(
    state => state.phase,
    (phase) => {
      console.log(`Game phase changed to: ${phase}`);
    }
  );
  
  useRobotGame.subscribe(
    state => state.score,
    (score) => {
      console.log(`Score updated: ${score}`);
    }
  );
  
  useRobotGame.subscribe(
    state => state.lives,
    (lives) => {
      console.log(`Lives updated: ${lives}`);
    }
  );
}
