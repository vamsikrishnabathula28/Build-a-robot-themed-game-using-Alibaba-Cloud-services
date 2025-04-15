import { useEffect } from "react";
import { useAudio } from "@/lib/stores/useAudio";
import { useRobotGame } from "@/lib/stores/useRobotGame";

export default function SoundManager() {
  const { backgroundMusic, isMuted } = useAudio();
  const gamePhase = useRobotGame(state => state.phase);
  
  // Start/stop background music based on game phase
  useEffect(() => {
    if (!backgroundMusic) return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        backgroundMusic.pause();
      } else if (gamePhase === 'playing' && !isMuted) {
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
    };
    
    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Play background music when game starts
    if (gamePhase === 'playing' && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    } else {
      backgroundMusic.pause();
    }
    
    // Pause background music when game ends or is not playing
    if (gamePhase !== 'playing') {
      backgroundMusic.pause();
    }
    
    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      backgroundMusic.pause();
    };
  }, [gamePhase, backgroundMusic, isMuted]);
  
  // Adjust music based on mute state
  useEffect(() => {
    if (!backgroundMusic) return;
    
    if (isMuted) {
      backgroundMusic.pause();
    } else if (gamePhase === 'playing') {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  }, [isMuted, backgroundMusic, gamePhase]);
  
  return null;
}
