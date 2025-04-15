import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import Robot from "./Robot";
import Obstacle from "./Obstacle";
import { useRobotGame } from "@/lib/stores/useRobotGame";
import { useKeyboardControls } from "@react-three/drei";
import { useAudio } from "@/lib/stores/useAudio";

// Define types for our obstacles and collectibles
interface ObstacleData {
  position: [number, number, number];
  scale: [number, number, number];
}

interface CollectibleData {
  position: [number, number, number];
  id: number;
}

export default function Level() {
  const groundTexture = useTexture("/textures/asphalt.png");
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set(8, 8);
  
  const restart = useKeyboardControls(state => state.restart);
  const gamePhase = useRobotGame(state => state.phase);
  const restartGame = useRobotGame(state => state.restart);
  const { playSuccess } = useAudio();
  
  // References for collision detection
  const robotRef = useRef<THREE.Group>(null);
  const obstaclesRef = useRef<THREE.Group[]>([]);
  const collectiblesRef = useRef<THREE.Group[]>([]);
  
  // Game timer
  const timer = useRef(0);
  const lastCollectibleSpawn = useRef(0);
  
  // Obstacle positions - predefined to avoid random generation during render
  const obstaclePositions = useMemo<ObstacleData[]>(() => [
    { position: [5, 0.5, -5], scale: [1, 1, 1] },
    { position: [-7, 0.5, 3], scale: [1, 1, 1] },
    { position: [2, 0.5, 7], scale: [1, 1, 1] },
    { position: [-4, 0.5, -8], scale: [1, 1, 1] },
    { position: [8, 0.5, 1], scale: [2, 1, 1] },
    { position: [-1, 0.5, 6], scale: [1, 2, 1] },
    { position: [4, 0.5, 0], scale: [1, 1, 2] },
    { position: [-6, 0.5, -4], scale: [1.5, 1.5, 1.5] },
  ], []);
  
  // Collectible positions initially
  const initialCollectibles = useMemo<CollectibleData[]>(() => [
    { position: [3, 0.5, 3], id: 1 },
    { position: [-3, 0.5, -3], id: 2 },
    { position: [7, 0.5, -2], id: 3 },
    { position: [-6, 0.5, 6], id: 4 },
  ], []);
  
  // State for collectibles
  const [collectibles, setCollectibles] = useState(initialCollectibles);
  
  useFrame((state, delta) => {
    if (gamePhase === 'playing') {
      // Increment timer
      timer.current += delta;
      
      // Check for game restart
      if (restart) {
        restartGame();
        timer.current = 0;
        lastCollectibleSpawn.current = 0;
        setCollectibles(initialCollectibles);
      }
      
      // Spawn new collectible every 10 seconds
      if (timer.current - lastCollectibleSpawn.current > 10) {
        lastCollectibleSpawn.current = timer.current;
        
        // Create new collectible at random position
        const x = (Math.random() - 0.5) * 28;
        const z = (Math.random() - 0.5) * 28;
        
        setCollectibles(prev => [
          ...prev, 
          { 
            position: [x, 0.5, z] as [number, number, number], 
            id: Math.random() 
          } as CollectibleData
        ]);
      }
      
      // Get the robot position
      const robotPosition = state.scene.getObjectByName("robot")?.position;
      
      if (robotPosition) {
        // Check collectible collisions
        collectiblesRef.current = collectiblesRef.current.filter(collectible => {
          if (!collectible) return false;
          
          const collectiblePosition = collectible.position;
          const distance = collectiblePosition.distanceTo(robotPosition);
          
          // If robot collects a collectible
          if (distance < 1) {
            useRobotGame.getState().addScore(100);
            playSuccess();
            
            // Remove the collectible from the scene
            collectible.removeFromParent();
            
            // Remove this collectible from the state array
            setCollectibles(prev => 
              prev.filter(c => 
                !(c.position[0] === collectiblePosition.x && 
                  c.position[2] === collectiblePosition.z)
              )
            );
            
            return false;
          }
          
          return true;
        });
        
        // Check obstacle collisions
        for (const obstacle of obstaclesRef.current) {
          if (!obstacle) continue;
          
          const obstaclePosition = obstacle.position;
          const distance = obstaclePosition.distanceTo(robotPosition);
          
          // Use simple distance-based collision detection
          if (distance < 1.5) {
            useRobotGame.getState().loseLife();
            
            // Move robot away from obstacle to prevent multiple collisions
            const direction = new THREE.Vector3()
              .subVectors(robotPosition, obstaclePosition)
              .normalize()
              .multiplyScalar(1.5);
            
            robotPosition.add(direction);
            break;
          }
        }
      }
    }
  });
  
  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={groundTexture} />
      </mesh>
      
      {/* Player robot */}
      <Robot position={[0, 0.5, 0]} />
      
      {/* Obstacles */}
      {obstaclePositions.map((props, index) => (
        <Obstacle 
          key={`obstacle-${index}`}
          position={props.position}
          scale={props.scale}
          ref={(el) => {
            if (el) obstaclesRef.current[index] = el;
          }}
        />
      ))}
      
      {/* Collectibles (points) */}
      {collectibles.map((collectible) => (
        <group 
          key={`collectible-${collectible.id}`}
          position={collectible.position}
          ref={(el) => {
            if (el) collectiblesRef.current.push(el);
          }}
        >
          <mesh castShadow position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700"
              emissiveIntensity={0.5}
              metalness={1}
              roughness={0.3}
            />
          </mesh>
          <pointLight position={[0, 0.5, 0]} distance={2} intensity={0.5} color="#FFD700" />
        </group>
      ))}
      
      {/* Lighting */}
      <hemisphereLight intensity={0.5} color="#87CEEB" groundColor="#444444" />
      
      {/* Border walls to keep player inside */}
      <group>
        {/* North wall */}
        <mesh position={[0, 1, -15]} castShadow receiveShadow>
          <boxGeometry args={[30, 2, 0.5]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* South wall */}
        <mesh position={[0, 1, 15]} castShadow receiveShadow>
          <boxGeometry args={[30, 2, 0.5]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* East wall */}
        <mesh position={[15, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 2, 30]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
        
        {/* West wall */}
        <mesh position={[-15, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 2, 30]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
    </group>
  );
}
