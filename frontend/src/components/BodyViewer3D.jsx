import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useState } from 'react';

// ─── Organ geometry definitions ──────────────────────────────
// Each organ: { position, scale, shape, label }
const ORGAN_MAP = {
  brain:   { position: [0, 3.6, 0],    scale: [0.55, 0.5, 0.5],  label: 'Brain' },
  heart:   { position: [-0.25, 1.3, 0.2], scale: [0.35, 0.35, 0.3], label: 'Heart' },
  lungs:   { position: [0, 1.5, 0],    scale: [0.95, 0.7, 0.55],  label: 'Lungs' },
  liver:   { position: [0.4, 0.5, 0.15], scale: [0.55, 0.35, 0.35], label: 'Liver' },
  stomach: { position: [-0.3, 0.4, 0.2], scale: [0.4, 0.35, 0.3],  label: 'Stomach' },
  kidneys: { position: [0, 0.1, -0.1],  scale: [0.7, 0.3, 0.3],   label: 'Kidneys' },
  spine:   { position: [0, 1.0, -0.35], scale: [0.15, 2.2, 0.15], label: 'Spine' },
};

// ─── Pulsing Organ Mesh ──────────────────────────────────────
function OrganMesh({ organId, position, scale, isHighlighted, onHover, onUnhover, isHovered }) {
  const meshRef = useRef();
  const glowRef = useRef();

  // Pulsing animation for highlighted organs
  useFrame(({ clock }) => {
    if (meshRef.current && isHighlighted) {
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.08 + 1;
      meshRef.current.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    }
    if (glowRef.current && isHighlighted) {
      const opacity = Math.sin(clock.elapsedTime * 2) * 0.15 + 0.35;
      glowRef.current.material.opacity = opacity;
    }
  });

  const normalColor = isHovered ? '#3b9eff' : '#1a6b8a';
  const highlightColor = '#ff3b3b';
  const color = isHighlighted ? highlightColor : normalColor;

  // Determine shape — spine is a cylinder, others are spheres
  const isSpine = organId === 'spine';

  return (
    <group position={position}>
      {/* Main organ mesh */}
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); onHover(organId); }}
        onPointerOut={(e) => { e.stopPropagation(); onUnhover(); }}
      >
        {isSpine ? (
          <cylinderGeometry args={[1, 1, 1, 12]} />
        ) : (
          <sphereGeometry args={[1, 24, 24]} />
        )}
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={isHighlighted ? 0.85 : isHovered ? 0.6 : 0.35}
          roughness={0.3}
          metalness={0.1}
          emissive={isHighlighted ? '#ff2200' : isHovered ? '#1a5a8a' : '#0a2a3a'}
          emissiveIntensity={isHighlighted ? 1.2 : isHovered ? 0.5 : 0.15}
        />
      </mesh>

      {/* Glow effect for highlighted organs */}
      {isHighlighted && (
        <mesh ref={glowRef} scale={[scale[0] * 1.4, scale[1] * 1.4, scale[2] * 1.4]}>
          {isSpine ? (
            <cylinderGeometry args={[1, 1, 1, 12]} />
          ) : (
            <sphereGeometry args={[1, 16, 16]} />
          )}
          <meshBasicMaterial
            color="#ff4444"
            transparent
            opacity={0.25}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Label on hover */}
      {isHovered && (
        <Html position={[0, scale[1] + 0.3, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            color: isHighlighted ? '#ff6b6b' : '#67e8f9',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
            border: `1px solid ${isHighlighted ? 'rgba(255,50,50,0.4)' : 'rgba(103,232,249,0.3)'}`,
            pointerEvents: 'none',
          }}>
            {ORGAN_MAP[organId].label}
            {isHighlighted && ' ⚠ Affected'}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Body Silhouette ─────────────────────────────────────────
function BodySilhouette() {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 3.6, 0]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.12} roughness={0.5} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.4, 12]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.1} roughness={0.5} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.5, 0]}>
        <capsuleGeometry args={[0.7, 1.8, 8, 16]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.08} roughness={0.5} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-1.1, 1.6, 0]} rotation={[0, 0, 0.25]}>
        <capsuleGeometry args={[0.15, 1.6, 6, 12]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.08} roughness={0.5} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[1.1, 1.6, 0]} rotation={[0, 0, -0.25]}>
        <capsuleGeometry args={[0.15, 1.6, 6, 12]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.08} roughness={0.5} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.35, -1.3, 0]}>
        <capsuleGeometry args={[0.2, 2.0, 6, 12]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.08} roughness={0.5} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.35, -1.3, 0]}>
        <capsuleGeometry args={[0.2, 2.0, 6, 12]} />
        <meshPhysicalMaterial color="#1a2744" transparent opacity={0.08} roughness={0.5} />
      </mesh>
    </group>
  );
}

// ─── Auto-Rotating Scene ─────────────────────────────────────
function Scene({ highlightedOrgans = [] }) {
  const [hoveredOrgan, setHoveredOrgan] = useState(null);
  const groupRef = useRef();

  const highlightSet = useMemo(() => new Set(highlightedOrgans), [highlightedOrgans]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#67e8f9" />
      <pointLight position={[-5, 3, -5]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[0, -3, 5]} intensity={0.3} color="#3b82f6" />

      {/* Highlighted organs get a red spotlight */}
      {highlightedOrgans.length > 0 && (
        <pointLight position={[0, 2, 3]} intensity={0.6} color="#ff4444" />
      )}

      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
        <group ref={groupRef} position={[0, -0.5, 0]}>
          <BodySilhouette />

          {Object.entries(ORGAN_MAP).map(([organId, config]) => (
            <OrganMesh
              key={organId}
              organId={organId}
              position={config.position}
              scale={config.scale}
              isHighlighted={highlightSet.has(organId)}
              isHovered={hoveredOrgan === organId}
              onHover={setHoveredOrgan}
              onUnhover={() => setHoveredOrgan(null)}
            />
          ))}
        </group>
      </Float>

      <OrbitControls
        enablePan={false}
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function BodyViewer3D({ highlightedOrgans = [] }) {
  return (
    <div className="body-viewer-container">
      <Canvas
        camera={{ position: [0, 1, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene highlightedOrgans={highlightedOrgans} />
      </Canvas>

      {/* Legend */}
      <div className="body-viewer-legend">
        <div className="legend-item">
          <span className="legend-dot normal"></span>
          <span>Normal</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot affected"></span>
          <span>Affected</span>
        </div>
      </div>

      {highlightedOrgans.length > 0 && (
        <div className="body-viewer-affected-list">
          {highlightedOrgans.map(organ => (
            <span key={organ} className="organ-tag affected">
              {ORGAN_MAP[organ]?.label || organ}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
