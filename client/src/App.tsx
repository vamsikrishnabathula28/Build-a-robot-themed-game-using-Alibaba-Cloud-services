import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import Menu from "./components/game/Menu";
import Level from "./components/game/Level";
import GameUI from "./components/game/GameUI";
import SoundManager from "./components/game/SoundManager";
import GameOver from "./components/game/GameOver";
import { useRobotGame } from "./lib/stores/useRobotGame";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "jump", keys: ["Space"] },
  { name: "restart", keys: ["KeyR"] },
];

// Main App component
function App() {
  const gamePhase = useRobotGame(state => state.phase);
  const [showCanvas, setShowCanvas] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Preload audio assets
  useEffect(() => {
    // Load audio assets
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hit = new Audio("/sounds/hit.mp3");
    setHitSound(hit);

    const success = new Audio("/sounds/success.mp3");
    setSuccessSound(success);

    // Show the canvas once everything is loaded
    setShowCanvas(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      {showCanvas && (
        <KeyboardControls map={controls}>
          {gamePhase === 'ready' && <Menu />}

          {(gamePhase === 'playing' || gamePhase === 'ended') && (
            <>
              <Canvas
                shadows
                camera={{
                  position: [0, 5, 10],
                  fov: 75,
                  near: 0.1,
                  far: 1000
                }}
                gl={{
                  antialias: true,
                  powerPreference: "default"
                }}
              >
                <color attach="background" args={["#87CEEB"]} />
                <fog attach="fog" args={["#87CEEB", 10, 50]} />

                {/* Scene lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight 
                  position={[10, 10, 5]} 
                  intensity={1} 
                  castShadow 
                  shadow-mapSize-width={2048}
                  shadow-mapSize-height={2048}
                  shadow-camera-far={50}
                  shadow-camera-left={-10}
                  shadow-camera-right={10}
                  shadow-camera-top={10}
                  shadow-camera-bottom={-10}
                />

                <Suspense fallback={null}>
                  <Level />
                </Suspense>
              </Canvas>
              
              <GameUI />
              
              {gamePhase === 'ended' && <GameOver />}
            </>
          )}

          <SoundManager />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
