import { useRobotGame } from "@/lib/stores/useRobotGame";
import { useKeyboardControls } from "@react-three/drei";
import { useEffect, useState } from "react";

export default function GameUI() {
  const score = useRobotGame(state => state.score);
  const lives = useRobotGame(state => state.lives);
  const time = useRobotGame(state => state.time);
  const gamePhase = useRobotGame(state => state.phase);
  const [timeDisplay, setTimeDisplay] = useState("00:00");
  
  // Format time display as mm:ss
  useEffect(() => {
    if (gamePhase === 'playing') {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      setTimeDisplay(
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  }, [time, gamePhase]);
  
  // Control instructions overlay
  const [showControls, setShowControls] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Game Stats UI */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900/80 text-white px-4 py-2 rounded-md">
            <span className="font-bold">SCORE:</span> {score}
          </div>
          
          <div className="bg-gray-900/80 text-white px-4 py-2 rounded-md">
            <span className="font-bold">LIVES:</span> {lives}
          </div>
        </div>
        
        <div className="bg-gray-900/80 text-white px-4 py-2 rounded-md">
          <span className="font-bold">TIME:</span> {timeDisplay}
        </div>
      </div>
      
      {/* Controls Help */}
      {showControls && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/80 text-white p-4 rounded-md text-center">
          <h3 className="font-bold mb-2">CONTROLS</h3>
          <p>Move: WASD or Arrow Keys</p>
          <p>Jump: SPACE</p>
          <p>Restart: R</p>
        </div>
      )}
    </div>
  );
}
