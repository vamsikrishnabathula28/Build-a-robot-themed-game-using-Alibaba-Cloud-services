import { useRobotGame } from "@/lib/stores/useRobotGame";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAudio } from "@/lib/stores/useAudio";

export default function Menu() {
  const startGame = useRobotGame(state => state.start);
  const { toggleMute, isMuted } = useAudio();
  const [playerName, setPlayerName] = useState("");
  const [nameError, setNameError] = useState("");
  
  // Fetch high scores
  const { data: highScores, isLoading } = useQuery({
    queryKey: ['/api/scores'],
  });
  
  const handleStartGame = () => {
    // Validate player name
    if (!playerName.trim()) {
      setNameError("Please enter a name");
      return;
    }
    
    // Set player name and start game
    useRobotGame.getState().setPlayerName(playerName);
    startGame();
  };
  
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-blue-500 flex flex-col items-center justify-center p-6 z-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-6 bg-blue-600">
          <h1 className="text-4xl font-bold text-white text-center tracking-wider">ROBO RUNNER</h1>
          <p className="text-blue-100 text-center mt-2">A 3D robot adventure</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setNameError("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
              maxLength={15}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
            )}
          </div>
          
          <button
            onClick={handleStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 mb-4"
          >
            START GAME
          </button>
          
          <button
            onClick={toggleMute}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-150"
          >
            {isMuted ? "🔇 UNMUTE SOUND" : "🔊 MUTE SOUND"}
          </button>
          
          {/* How to Play */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">How to Play</h2>
            <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
              <li>Move your robot with WASD or arrow keys</li>
              <li>Jump over obstacles with SPACE</li>
              <li>Collect golden orbs to gain points</li>
              <li>Avoid obstacles or lose lives</li>
              <li>Press R to restart if you run out of lives</li>
            </ul>
          </div>
          
          {/* High Scores */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">High Scores</h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading scores...</p>
            ) : highScores && highScores.length > 0 ? (
              <div className="bg-gray-50 rounded-md p-2">
                <ol className="text-sm">
                  {highScores.slice(0, 5).map((score, index) => (
                    <li key={index} className="flex justify-between py-1 border-b last:border-0 border-gray-200">
                      <span className="font-medium">{index + 1}. {score.playerName}</span>
                      <span className="font-bold">{score.score}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No high scores yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
