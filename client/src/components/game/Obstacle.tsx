import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { forwardRef } from "react";

interface ObstacleProps {
  position: [number, number, number];
  scale?: [number, number, number];
}

const Obstacle = forwardRef<THREE.Group, ObstacleProps>(({ position, scale = [1, 1, 1] }, ref) => {
  const texture = useTexture("/textures/wood.jpg");
  
  return (
    <group position={position} scale={scale} ref={ref}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
});

Obstacle.displayName = "Obstacle";

export default Obstacle;
