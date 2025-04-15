import { useRobotGame } from "@/lib/stores/useRobotGame";
import { apiRequest } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function GameOver() {
  const score = useRobotGame(state => state.score);
  const time = useRobotGame(state => state.time);
  const playerName = useRobotGame(state => state.playerName);
  const restartGame = useRobotGame(state => state.restart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  
  // Format time display as mm:ss
  const formattedTime = (() => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  })();
  
  // Fetch updated high scores after submission
  const { data: highScores, refetch } = useQuery<any[]>({
    queryKey: ['/api/scores'],
    initialData: [],
  });
  
  // Submit score to backend
  const submitScore = async () => {
    if (!playerName || submitted) return;
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await apiRequest('POST', '/api/scores', {
        playerName,
        score,
        timeElapsed: Math.round(time) // Round to integer to match schema
      });
      
      setSubmitted(true);
      refetch(); // Refresh high scores
    } catch (err) {
      setError("Failed to submit score. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-submit score once
  useEffect(() => {
    if (!submitted && !isSubmitting && score > 0) {
      submitScore();
    }
  }, []);
  
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-3xl font-bold text-red-600 mb-4 text-center">GAME OVER</h2>
        
        <div className="bg-gray-100 p-4 rounded-md mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Player</p>
              <p className="font-bold text-lg">{playerName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Time</p>
              <p className="font-bold text-lg">{formattedTime}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600 text-sm">Final Score</p>
              <p className="font-bold text-3xl text-blue-600">{score}</p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {/* High Scores */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">High Scores</h3>
          {highScores && highScores.length > 0 ? (
            <div className="bg-gray-50 rounded-md p-2">
              <ol className="text-sm">
                {highScores.slice(0, 5).map((score: any, index: number) => (
                  <li key={index} className="flex justify-between py-1 border-b last:border-0 border-gray-200">
                    <span className="font-medium">{index + 1}. {score.playerName}</span>
                    <span className="font-bold">{score.score}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No high scores available</p>
          )}
        </div>
        
        <div className="text-center">
          <button
            onClick={restartGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-150"
          >
            PLAY AGAIN
          </button>
          
          <p className="mt-4 text-sm text-gray-500">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded">R</kbd> to restart
          </p>
        </div>
      </div>
    </div>
  );
}
