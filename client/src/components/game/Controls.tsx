import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRobotGame } from "@/lib/stores/useRobotGame";

export default function Controls() {
  const restart = useKeyboardControls(state => state.restart);
  const restartGame = useRobotGame(state => state.restart);
  const gamePhase = useRobotGame(state => state.phase);
  
  useEffect(() => {
    // Use type assertion to access the subscribe method
    const controls = useKeyboardControls as any;
    
    const unsubscribeRestart = controls.subscribe(
      (state: { restart: boolean }) => state.restart,
      (pressed: boolean) => {
        if (pressed && gamePhase === 'ended') {
          console.log("Restarting game...");
          restartGame();
        }
      }
    );
    
    return () => {
      unsubscribeRestart();
    };
  }, [gamePhase, restartGame]);
  
  // Optional: Debug logs for controls (comment this out for production)
  // useFrame(() => {
  //   const forward = useKeyboardControls.getState().forward;
  //   const backward = useKeyboardControls.getState().backward;
  //   const leftward = useKeyboardControls.getState().leftward;
  //   const rightward = useKeyboardControls.getState().rightward;
  //   const jump = useKeyboardControls.getState().jump;
  //   
  //   if (forward || backward || leftward || rightward || jump) {
  //     console.log("Controls:", { forward, backward, leftward, rightward, jump });
  //   }
  // });
  
  return null;
}
