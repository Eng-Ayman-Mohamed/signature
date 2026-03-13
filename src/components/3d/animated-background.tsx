'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Number of particles for the background
const PARTICLE_COUNT = 1500;

// Particle field component
function ParticleField({ 
  accentColor, 
  mousePosition 
}: { 
  accentColor: string;
  mousePosition: { x: number; y: number };
}) {
  const ref = useRef<THREE.Points>(null);
  
  // Generate random particle positions
  const positions = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 10;
      pos[i3 + 1] = (Math.random() - 0.5) * 10;
      pos[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  // Convert accent color to Three.js color
  const color = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  // Animate particles
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.02;
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
      
      // Mouse interaction
      ref.current.rotation.x += mousePosition.y * 0.1;
      ref.current.rotation.y += mousePosition.x * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

// Floating geometric shapes - ALL WIREFRAME
function FloatingShapes({ accentColor, isDark }: { accentColor: string; isDark: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const color = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const opacity = isDark ? 0.5 : 0.3;

  return (
    <group ref={groupRef}>
      {/* Sphere - Wireframe */}
      <mesh position={[2, 1, -2]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
      
      {/* Icosahedron - Wireframe */}
      <mesh position={[-2, -1, -1]}>
        <icosahedronGeometry args={[0.6]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
      
      {/* Octahedron - Wireframe */}
      <mesh position={[1.5, -1.5, -3]}>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
      
      {/* Dodecahedron - Wireframe */}
      <mesh position={[-1.5, 1.5, -2]}>
        <dodecahedronGeometry args={[0.4]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
      
      {/* Box - Wireframe */}
      <mesh position={[0, 0.5, -2.5]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
      
      {/* Tetrahedron - Wireframe */}
      <mesh position={[-1, -0.5, -3]}>
        <tetrahedronGeometry args={[0.5]} />
        <meshStandardMaterial color={color} transparent opacity={opacity} wireframe />
      </mesh>
    </group>
  );
}

// Grid floor
function Grid({ accentColor, isDark }: { accentColor: string; isDark: boolean }) {
  const color = useMemo(() => new THREE.Color(accentColor), [accentColor]);
  const gridColor = isDark ? new THREE.Color('#1e293b') : new THREE.Color('#cbd5e1');
  
  return (
    <gridHelper 
      args={[20, 20, color, gridColor]} 
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Mouse tracker component
function MouseTracker({ 
  onMouseMove 
}: { 
  onMouseMove: (pos: { x: number; y: number }) => void;
}) {
  const { viewport } = useThree();
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      onMouseMove({ x: x * 0.1, y: y * 0.1 });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [onMouseMove]);
  
  return null;
}

// Main 3D Scene
function Scene({ 
  accentColor, 
  mousePosition,
  setMousePosition,
  isDark
}: { 
  accentColor: string;
  mousePosition: { x: number; y: number };
  setMousePosition: (pos: { x: number; y: number }) => void;
  isDark: boolean;
}) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.5 : 0.8} />
      <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 1.5} />
      <pointLight position={[-10, -10, -10]} intensity={isDark ? 0.5 : 0.8} color={accentColor} />
      
      <ParticleField accentColor={accentColor} mousePosition={mousePosition} />
      <FloatingShapes accentColor={accentColor} isDark={isDark} />
      <Grid accentColor={accentColor} isDark={isDark} />
      
      <MouseTracker onMouseMove={setMousePosition} />
    </>
  );
}

// Main export component
export function AnimatedBackground({ 
  accentColor = '#10b981',
  className = ''
}: { 
  accentColor?: string;
  className?: string;
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Check theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    // Observe theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={isMobile ? 1 : [1, 2]} // Lower pixel ratio on mobile
        gl={{ 
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <Scene 
          accentColor={accentColor} 
          mousePosition={mousePosition}
          setMousePosition={setMousePosition}
          isDark={isDark}
        />
      </Canvas>
      
      {/* Gradient overlay - different for light/dark */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(to bottom, transparent 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(248, 250, 252, 0.9) 100%)',
        }}
      />
    </div>
  );
}
