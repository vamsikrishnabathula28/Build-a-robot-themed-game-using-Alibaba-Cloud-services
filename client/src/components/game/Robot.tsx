import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import { useRobotGame } from "@/lib/stores/useRobotGame";
import { useAudio } from "@/lib/stores/useAudio";

export default function Robot({ position = [0, 0.5, 0] }) {
  const robotRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const velocity = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  
  // Set a name to the robot for easier identification
  useEffect(() => {
    if (robotRef.current) {
      robotRef.current.name = "robot";
    }
  }, []);
  
  // Game state
  const addScore = useRobotGame(state => state.addScore);
  const endGame = useRobotGame(state => state.end);
  const { playHit } = useAudio();
  
  // Control states
  const forward = useKeyboardControls(state => state.forward);
  const backward = useKeyboardControls(state => state.backward);
  const leftward = useKeyboardControls(state => state.leftward);
  const rightward = useKeyboardControls(state => state.rightward);
  const jump = useKeyboardControls(state => state.jump);

  // Movement parameters
  const speed = 0.1;
  const jumpForce = 0.2;
  const gravity = 0.01;
  const isOnGround = useRef(true);

  useFrame((state, delta) => {
    if (!robotRef.current) return;

    // Apply gravity
    if (robotRef.current.position.y > 0.5) {
      velocity.current.y -= gravity;
      isOnGround.current = false;
    } else {
      robotRef.current.position.y = 0.5;
      velocity.current.y = 0;
      isOnGround.current = true;
    }

    // Handle jump
    if (jump && isOnGround.current) {
      velocity.current.y = jumpForce;
      playHit(); // Play jump sound
    }

    // Handle movement
    const direction = new THREE.Vector3();
    
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (leftward) direction.x -= 1;
    if (rightward) direction.x += 1;

    // Normalize direction vector and apply speed
    if (direction.length() > 0) {
      direction.normalize().multiplyScalar(speed);
      velocity.current.x = direction.x;
      velocity.current.z = direction.z;
      
      // Rotate robot in movement direction
      if (direction.x !== 0 || direction.z !== 0) {
        const angle = Math.atan2(direction.x, direction.z);
        robotRef.current.rotation.y = angle;
      }
    } else {
      // Apply friction
      velocity.current.x *= 0.9;
      velocity.current.z *= 0.9;
    }

    // Update position based on velocity
    robotRef.current.position.x += velocity.current.x;
    robotRef.current.position.y += velocity.current.y;
    robotRef.current.position.z += velocity.current.z;

    // Keep robot within boundaries
    const boundary = 14; // Half the size of our level
    if (Math.abs(robotRef.current.position.x) > boundary) {
      robotRef.current.position.x = Math.sign(robotRef.current.position.x) * boundary;
    }
    if (Math.abs(robotRef.current.position.z) > boundary) {
      robotRef.current.position.z = Math.sign(robotRef.current.position.z) * boundary;
    }

    // Animate the robot body (simple bobbing effect)
    if (bodyRef.current && (forward || backward || leftward || rightward)) {
      bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.05 + 0.6;
    }

    // Update camera to follow the robot
    state.camera.position.x = robotRef.current.position.x;
    state.camera.position.z = robotRef.current.position.z + 10;
    state.camera.lookAt(robotRef.current.position);
  });

  return (
    <group ref={robotRef} position={[position[0], position[1], position[2]]} dispose={null}>
      {/* Robot Body */}
      <mesh ref={bodyRef} position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1, 1.2, 0.8]} />
        <meshStandardMaterial color="#4285F4" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Robot Head */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color="#3367D6" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[0.2, 1.5, 0.36]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.2, 1.5, 0.36]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.05]} />
        <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={0.8} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[0.6, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#A4C2F4" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.6, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#A4C2F4" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshStandardMaterial color="#A4C2F4" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.25]} />
        <meshStandardMaterial color="#A4C2F4" metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
}
