"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";

// Sesame seeds generator for top bun
function SesameSeeds({ count = 90 }) {
  const points = useRef([]);

  useEffect(() => {
    const seeds = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * (Math.PI / 3);
      const phi = Math.random() * Math.PI * 2;
      const r = 2.025;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.cos(theta) * 0.65;
      const z = r * Math.sin(theta) * Math.sin(phi);

      seeds.push({
        position: [x, y, z],
        rotation: [theta, phi, Math.random() * 0.5 - 0.25],
      });
    }
    points.current = seeds;
  }, [count]);

  return (
    <group>
      {points.current.map((seed, i) => (
        <mesh key={i} position={seed.position} rotation={seed.rotation}>
          <boxGeometry args={[0.045, 0.15, 0.05]} />
          <meshPhysicalMaterial 
            color="#f3ede2" 
            roughness={0.4} 
            metalness={0.0} 
            clearcoat={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Cinematic Flame Ember Particles
function Embers({ count = 100, burgerStateRef }) {
  const pointsRef = useRef();
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array;
    const intensity = burgerStateRef?.current?.embersIntensity ?? 1.0;

    for (let i = 0; i < count; i++) {
      // Speed up or slow down based on intensity
      pos[i * 3 + 1] += delta * (0.7 + intensity * 1.0);
      pos[i * 3] += Math.sin(state.clock.elapsedTime + i) * delta * 0.35;
      
      if (pos[i * 3 + 1] > 4.5) {
        pos[i * 3 + 1] = -4.5;
        pos[i * 3] = (Math.random() - 0.5) * 10;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Direct material property updates
    if (pointsRef.current.material) {
      pointsRef.current.material.opacity = THREE.MathUtils.lerp(0.15, 0.9, intensity);
      pointsRef.current.material.size = THREE.MathUtils.lerp(0.06, 0.22, intensity);
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#ffa63b"
        size={0.14}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.7}
      />
    </Points>
  );
}

// Patty Smoke Particle System with High-Frequency Heat Distortion
function Smoke({ count = 40, pattyY, burgerStateRef }) {
  const pointsRef = useRef();
  const [data] = useState(() => {
    const arr = [];
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1.5;
      const x = Math.cos(angle) * radius;
      const y = pattyY + (Math.random() * 0.1 - 0.05);
      const z = Math.sin(angle) * radius;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      arr.push({
        vy: Math.random() * 0.22 + 0.18,
        vx: Math.random() * 0.08 - 0.04,
        vz: Math.random() * 0.08 - 0.04,
        life: Math.random(),
        maxLife: Math.random() * 1.4 + 0.7,
      });
    }
    return { positions, arr };
  });

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array;
    const intensity = burgerStateRef?.current?.smokeIntensity ?? 1.0;

    for (let i = 0; i < count; i++) {
      const pData = data.arr[i];
      pData.life += delta;
      
      if (pData.life >= pData.maxLife) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 1.4;
        pos[i * 3] = Math.cos(angle) * radius;
        pos[i * 3 + 1] = pattyY + (Math.random() * 0.1 - 0.05);
        pos[i * 3 + 2] = Math.sin(angle) * radius;
        pData.life = 0;
      } else {
        // Upward float
        pos[i * 3 + 1] += pData.vy * delta * (0.55 + intensity * 0.95);
        
        // Heat distortion: High frequency sine/cosine wiggles
        const waveX = Math.sin(state.clock.elapsedTime * 6 + i) * 0.03 * intensity;
        const waveZ = Math.cos(state.clock.elapsedTime * 6 + i) * 0.03 * intensity;
        
        pos[i * 3] += pData.vx * delta + waveX;
        pos[i * 3 + 2] += pData.vz * delta + waveZ;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    if (pointsRef.current.material) {
      pointsRef.current.material.opacity = THREE.MathUtils.lerp(0.02, 0.22, intensity);
    }
  });

  return (
    <Points ref={pointsRef} positions={data.positions} stride={3}>
      <PointMaterial
        transparent
        color="#c8bcae"
        size={0.68}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.12}
      />
    </Points>
  );
}

// Procedural Patty Bump Texture helper
function createPattyTexture() {
  if (typeof window === "undefined") return null;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  
  // Base meat color
  ctx.fillStyle = "#484848";
  ctx.fillRect(0, 0, size, size);

  // Granular meat texture
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const grey = Math.floor(Math.random() * 70) + 10;
    ctx.fillStyle = `rgb(${grey}, ${grey}, ${grey})`;
    ctx.fillRect(x, y, 2, 2);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Exploded configuration for STAX Layers (specifying 3D starting coordinates for cinematic all-direction fly-in)
const layerConfig = {
  topBun: { 
    normalY: 1.5, 
    explodedY: 3.8, 
    color: "#be7329", 
    labelName: "Sesame Seed Bun",
    scatterX: -2.2,
    scatterY: 2.8,
    scatterZ: -1.8,
    rx: 0.35,
    ry: 0.7,
    rz: -0.3
  },
  lettuce: { 
    normalY: 0.95, 
    explodedY: 2.8, 
    color: "#388336", 
    labelName: "Fresh Iceberg Lettuce",
    scatterX: 2.4,
    scatterY: 2.0,
    scatterZ: 1.6,
    rx: -0.28,
    ry: -0.6,
    rz: 0.35
  },
  tomatoes: { 
    normalY: 0.65, 
    explodedY: 1.9, 
    color: "#ca2222", 
    labelName: "Vine-Ripened Tomatoes",
    scatterX: -2.5,
    scatterY: 1.1,
    scatterZ: 2.0,
    rx: 0.45,
    ry: 0.35,
    rz: -0.4
  },
  onion: { 
    normalY: 0.4, 
    explodedY: 1.1, 
    color: "#f8f0f1", 
    labelName: "Hand Cut Onions",
    scatterX: 2.2,
    scatterY: -0.2,
    scatterZ: -2.2,
    rx: -0.35,
    ry: 0.65,
    rz: 0.3
  },
  pickles: { 
    normalY: 0.28, 
    explodedY: 0.55, 
    color: "#2f4c13", 
    labelName: "Crunchy Dill Pickles",
    scatterX: -2.0,
    scatterY: -1.0,
    scatterZ: -2.0,
    rx: 0.4,
    ry: -0.4,
    rz: -0.45
  },
  cheese: { 
    normalY: 0.18, 
    explodedY: 0.15, 
    color: "#ffbb00", 
    labelName: "Melted Cheddar Cheese",
    scatterX: 1.8,
    scatterY: -1.5,
    scatterZ: 1.6,
    rx: -0.2,
    ry: 0.45,
    rz: 0.25
  },
  patty: { 
    normalY: -0.15, 
    explodedY: -0.6, 
    color: "#2c170d", 
    labelName: "Flame Grilled Patty",
    scatterX: -2.8,
    scatterY: -2.0,
    scatterZ: 2.4,
    rx: 0.5,
    ry: -0.7,
    rz: -0.35
  },
  sauce: { 
    normalY: -0.4, 
    explodedY: -1.3, 
    color: "#85160b", 
    labelName: "Creamy Signature Sauce",
    scatterX: 2.1,
    scatterY: -2.7,
    scatterZ: -1.6,
    rx: -0.38,
    ry: 0.5,
    rz: 0.38
  },
  bottomBun: { 
    normalY: -0.65, 
    explodedY: -2.1, 
    color: "#be7329", 
    labelName: "Toasted Sesame Bun Heel",
    scatterX: -1.5,
    scatterY: -3.5,
    scatterZ: -2.4,
    rx: 0.3,
    ry: 0.65,
    rz: -0.3
  },
};

// Pre-allocated colors to avoid Garbage Collection allocations inside useFrame loop
const emissiveColors = {
  topBun: new THREE.Color(layerConfig.topBun.color).multiplyScalar(0.2),
  lettuce: new THREE.Color(layerConfig.lettuce.color).multiplyScalar(0.2),
  tomatoes: new THREE.Color(layerConfig.tomatoes.color).multiplyScalar(0.2),
  onion: new THREE.Color(layerConfig.onion.color).multiplyScalar(0.2),
  pickles: new THREE.Color(layerConfig.pickles.color).multiplyScalar(0.2),
  cheese: new THREE.Color(layerConfig.cheese.color).multiplyScalar(0.2),
  patty: new THREE.Color(layerConfig.patty.color).multiplyScalar(0.2),
  sauce: new THREE.Color(layerConfig.sauce.color).multiplyScalar(0.2),
  bottomBun: new THREE.Color(layerConfig.bottomBun.color).multiplyScalar(0.2),
  black: new THREE.Color("#000000"),
};

// Premium HTML HUD Label with SVG animated connecting line
function HUDLabel({ labelName, isLeft, show, index }) {
  if (!show) return null;

  const animationDelayLine = `${index * 0.1}s`;
  const animationDelayBadge = `${index * 0.1 + 0.18}s`;
  const badgeClass = isLeft ? "hud-badge-left animate-fade-in-left" : "hud-badge-right animate-fade-in-right";

  return (
    <Html position={[0, 0, 0]} center distanceFactor={8}>
      <div 
        className="relative pointer-events-none select-none"
        style={{
          width: "320px",
          height: "80px",
          transform: "translateX(-160px) translateY(-40px)",
        }}
      >
        {/* Origin dot at center of layer */}
        <div 
          className="absolute w-2 h-2 rounded-full bg-[#FF7A00] shadow-[0_0_10px_#FF7A00]"
          style={{
            left: "160px",
            top: "40px",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* SVG Drawing Connector Line */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" style={{ zIndex: 0 }}>
          <path
            d={isLeft ? "M 160 40 L 95 20 L 25 20" : "M 160 40 L 225 20 L 295 20"}
            fill="none"
            stroke="#FF7A00"
            strokeWidth="1.2"
            strokeOpacity="0.7"
            className="hud-line"
            style={{
              animation: `drawLine 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
              animationDelay: animationDelayLine,
            }}
          />
        </svg>

        {/* Info Badge */}
        <div
          className={`absolute border border-white/8 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-2xl ${badgeClass}`}
          style={{
            left: isLeft ? "25px" : "295px",
            top: "20px",
            transform: isLeft ? "translate(-100%, -50%)" : "translate(0%, -50%)",
            animation: `${isLeft ? 'fadeInBadgeLeft' : 'fadeInBadgeRight'} 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
            animationDelay: animationDelayBadge,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            background: "rgba(10, 10, 10, 0.65)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] shadow-[0_0_6px_#FF7A00]" />
          <div className="flex flex-col text-left min-w-[110px]">
            <span className="text-[6.5px] text-white/40 font-bold uppercase tracking-wider leading-none mb-0.5">Ingredient</span>
            <span className="text-[9.5px] text-white font-heading font-black uppercase tracking-wider leading-none">{labelName}</span>
          </div>
        </div>
      </div>
    </Html>
  );
}

function StackGroup({ burgerStateRef, activeCustomizer, activeShowcase, activeIngredients, hoveredIngredient, isMobile }) {
  const groupRef = useRef();
  const cachedChildrenRef = useRef({}); // O(1) object lookup cache for frame animations
  const pattyBump = useRef();
  const [showLabels, setShowLabels] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverExplodeFactor = useRef(0);

  // References for geometry deforms to enhance realism
  const lettuceGeoRef = useRef();
  const cheeseGeoRef = useRef();
  const pattyGeoRef = useRef();

  const BurgerMaterial = ({ color, roughness, metalness, clearcoat, transmission, thickness, ...props }) => {
    if (isMobile) {
      return (
        <meshStandardMaterial
          color={color}
          roughness={roughness}
          metalness={metalness || 0}
          {...props}
        />
      );
    }
    return (
      <meshPhysicalMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        clearcoat={clearcoat}
        transmission={transmission}
        thickness={thickness}
        {...props}
      />
    );
  };

  // Individual layer visual animation states tracked for Customizer interactions
  const layerVisualsRef = useRef({
    topBun: { scale: 1, offsetY: 0, opacity: 1 },
    lettuce: { scale: 1, offsetY: 0, opacity: 1 },
    tomatoes: { scale: 1, offsetY: 0, opacity: 1 },
    onion: { scale: 1, offsetY: 0, opacity: 1 },
    pickles: { scale: 1, offsetY: 0, opacity: 1 },
    cheese: { scale: 1, offsetY: 0, opacity: 1 },
    patty: { scale: 1, offsetY: 0, opacity: 1 },
    sauce: { scale: 1, offsetY: 0, opacity: 1 },
    bottomBun: { scale: 1, offsetY: 0, opacity: 1 },
  });

  const customizerTransitionRef = useRef(0);
  const lastCustomizerRef = useRef(null);

  useEffect(() => {
    pattyBump.current = createPattyTexture();
  }, []);

  // Sync customizer quantity changes with individual layer animations
  useEffect(() => {
    if (!activeCustomizer) {
      // Smoothly restore default layout when Customizer is not active
      Object.keys(layerConfig).forEach((key) => {
        gsap.to(layerVisualsRef.current[key], {
          scale: 1,
          offsetY: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto"
        });
      });
      lastCustomizerRef.current = null;
      return;
    }

    // First-time entry: initialize visual parameters instantly to match starting quantities
    if (!lastCustomizerRef.current) {
      Object.keys(layerConfig).forEach((key) => {
        const currentQty = activeCustomizer[key] !== undefined ? activeCustomizer[key] : 1;
        if (currentQty === 0) {
          layerVisualsRef.current[key].scale = 0.0;
          layerVisualsRef.current[key].opacity = 0.0;
          layerVisualsRef.current[key].offsetY = 2.0; // pre-position high up
        } else {
          layerVisualsRef.current[key].scale = 1.0 + (currentQty - 1) * 0.25;
          layerVisualsRef.current[key].opacity = 1.0;
          layerVisualsRef.current[key].offsetY = 0.0;
        }
      });
      lastCustomizerRef.current = { ...activeCustomizer };
      return;
    }

    const prev = lastCustomizerRef.current;
    
    Object.keys(layerConfig).forEach((key) => {
      const currentQty = activeCustomizer[key] !== undefined ? activeCustomizer[key] : 1;
      const prevQty = prev[key] !== undefined ? prev[key] : 0;

      if (currentQty !== prevQty) {
        if (currentQty === 0) {
          // FLY OUT: animate ingredient rising upwards and fading out
          gsap.to(layerVisualsRef.current[key], {
            scale: 0.0,
            offsetY: 2.2,
            opacity: 0.0,
            duration: 0.55,
            ease: "power2.in",
            overwrite: "auto"
          });
        } else {
          // Ingredient added or stack size adjusted
          const targetScale = 1.0 + (currentQty - 1) * 0.25;
          
          if (prevQty === 0) {
            // FLY IN: set start state high above the burger, transparent, and small
            layerVisualsRef.current[key].offsetY = 3.2;
            layerVisualsRef.current[key].scale = 0.15;
            layerVisualsRef.current[key].opacity = 0.0;

            // Animate dropping onto the burger with a springy bounce on impact
            gsap.to(layerVisualsRef.current[key], {
              scale: targetScale,
              offsetY: 0.0,
              opacity: 1.0,
              duration: 0.8,
              ease: "back.out(1.6)",
              overwrite: "auto"
            });
          } else {
            // Stack thickness change (e.g. going 1 -> 2 patties): scale smoothly
            gsap.to(layerVisualsRef.current[key], {
              scale: targetScale,
              offsetY: 0.0,
              opacity: 1.0,
              duration: 0.45,
              ease: "back.out(2.2)",
              overwrite: "auto"
            });
          }
        }
      }
    });

    lastCustomizerRef.current = { ...activeCustomizer };
  }, [activeCustomizer]);

  // Lettuce ripple deform
  useEffect(() => {
    if (lettuceGeoRef.current) {
      const pos = lettuceGeoRef.current.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const angle = Math.atan2(z, x);
        const r = Math.sqrt(x*x + z*z);
        if (r > 0.5) {
          const wave = Math.sin(angle * 8) * 0.16 + Math.cos(angle * 3.2) * 0.05;
          pos.setY(i, pos.getY(i) + wave);
        }
      }
      lettuceGeoRef.current.computeVertexNormals();
      lettuceGeoRef.current.attributes.position.needsUpdate = true;
    }
  }, []);

  // Cheese melting sags deform
  useEffect(() => {
    if (cheeseGeoRef.current) {
      const pos = cheeseGeoRef.current.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const dist = Math.sqrt(x*x + z*z);
        if (dist > 1.2) {
          const sag = -0.18 * Math.pow(dist - 1.2, 1.8);
          pos.setY(i, pos.getY(i) + sag);
        }
      }
      cheeseGeoRef.current.computeVertexNormals();
      cheeseGeoRef.current.attributes.position.needsUpdate = true;
    }
  }, []);

  // Patty edge organic roughness deform
  useEffect(() => {
    if (pattyGeoRef.current) {
      const pos = pattyGeoRef.current.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const angle = Math.atan2(z, x);
        // Organic edge bumps
        const noise = (Math.sin(angle * 12) * 0.045 + Math.cos(angle * 7) * 0.02) * (1.0 - Math.abs(y) * 2.0);
        pos.setX(i, x + Math.cos(angle) * noise);
        pos.setZ(i, z + Math.sin(angle) * noise);
      }
      pattyGeoRef.current.computeVertexNormals();
      pattyGeoRef.current.attributes.position.needsUpdate = true;
    }
  }, []);

  // Sync isHovered cursor
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.cursor = isHovered ? "pointer" : "default";
    }
  }, [isHovered]);

  // Spring animation on pointer hover explode factor
  useEffect(() => {
    gsap.to(hoverExplodeFactor, {
      current: isHovered ? 1.0 : 0.0,
      duration: 0.85,
      ease: isHovered ? "back.out(2)" : "power3.out", // spring back effect
      overwrite: "auto",
    });
  }, [isHovered]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    const burgerState = burgerStateRef ? burgerStateRef.current : {
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      rotateX: 0,
      rotateY: t * 0.08,
      rotateZ: 0,
      explodeFactor: 0,
      opacity: 1,
      showLabels: 0,
    };

    const targetShow = burgerState.showLabels > 0.5;
    if (showLabels !== targetShow) {
      setShowLabels(targetShow);
    }

    // Smooth transition between scroll campaign state and customizer focus layout
    const customizerActive = !!activeCustomizer;
    const targetTrans = customizerActive ? 1.0 : 0.0;
    customizerTransitionRef.current += (targetTrans - customizerTransitionRef.current) * 0.08;
    const cT = customizerTransitionRef.current;

    // Viewport responsive coordinate configuration: center on mobile, left on desktop
    const isMobile = state.viewport.width < 5.8;
    const customizerX = isMobile ? 0.0 : -1.75;
    const customizerY = isMobile ? 0.95 : -0.2;
    const customizerScale = isMobile ? 0.45 : 0.85; // larger scale on desktop for aggressive showcase
    const customizerOpacity = 1.0;
    const customizerExplode = 0.0; // compact (no gaps) just like original burger designed

    // Blend scroll values with customizer layout values
    const effectiveExplode = Math.max(burgerState.explodeFactor, hoverExplodeFactor.current);
    
    const currentX = THREE.MathUtils.lerp(burgerState.x, customizerX, cT);
    const currentY = THREE.MathUtils.lerp(burgerState.y, customizerY, cT);
    const currentScale = THREE.MathUtils.lerp(burgerState.scale, customizerScale, cT);
    const currentOpacity = THREE.MathUtils.lerp(burgerState.opacity, customizerOpacity, cT);
    const currentExplode = THREE.MathUtils.lerp(effectiveExplode, customizerExplode, cT);

    const assemblyProgress = 1.0 - currentExplode;

    // Subtle float offset only when fully assembled to keep coordinates stable
    const floatOffset = Math.sin(t * 1.5) * 0.05 * (1.0 - currentExplode);
    
    groupRef.current.position.x = currentX;
    groupRef.current.position.y = currentY + floatOffset;
    groupRef.current.position.z = burgerState.z;
    groupRef.current.scale.setScalar(currentScale);

    // Apply rotation (automatically rotate slowly in customizer mode)
    groupRef.current.rotation.x = burgerState.rotateX;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      burgerState.rotateY + (effectiveExplode === 0 && !activeCustomizer ? t * 0.035 : 0), 
      t * 0.22, 
      cT
    );
    groupRef.current.rotation.z = burgerState.rotateZ;

    const activeHighlight = hoveredIngredient || (activeIngredients !== "all" ? activeIngredients : null);

    // Assembly timeline intervals for staggered timing
    const intervals = {
      bottomBun: { start: 0.0, end: 0.28 },
      sauce: { start: 0.1, end: 0.38 },
      patty: { start: 0.2, end: 0.52 },
      cheese: { start: 0.3, end: 0.62 },
      pickles: { start: 0.4, end: 0.72 },
      onion: { start: 0.5, end: 0.82 },
      tomatoes: { start: 0.6, end: 0.9 },
      lettuce: { start: 0.7, end: 0.96 },
      topBun: { start: 0.8, end: 1.0 },
    };

    const itemsKeys = Object.keys(layerConfig);

    itemsKeys.forEach((key, index) => {
      let child = cachedChildrenRef.current[key];
      if (!child) {
        child = groupRef.current.getObjectByName(key);
        if (child) {
          cachedChildrenRef.current[key] = child;
        }
      }
      if (!child) return;

      const conf = layerConfig[key];
      const interval = intervals[key];
      const visual = layerVisualsRef.current[key];

      // Calculate staggered layer progress
      let layerAssembly = 0.0;
      if (assemblyProgress > interval.end) {
        layerAssembly = 1.0;
      } else if (assemblyProgress < interval.start) {
        layerAssembly = 0.0;
      } else {
        layerAssembly = (assemblyProgress - interval.start) / (interval.end - interval.start);
      }

      const layerExplode = 1.0 - layerAssembly;

      // Position interpolation (plus individual layer fly-in/fly-out offset)
      const targetY = THREE.MathUtils.lerp(conf.normalY, conf.explodedY, layerExplode) + visual.offsetY;
      const targetX = THREE.MathUtils.lerp(0.0, conf.scatterX, layerExplode);
      const targetZ = THREE.MathUtils.lerp(0.0, conf.scatterZ, layerExplode);

      child.position.set(targetX, targetY, targetZ);

      // Rotations wiggles & spins
      if (layerExplode > 0) {
        let rx = THREE.MathUtils.lerp(0.0, conf.rx, layerExplode) + Math.sin(t * 1.5 + index) * 0.05 * layerExplode;
        let rz = THREE.MathUtils.lerp(0.0, conf.rz, layerExplode) + Math.cos(t * 1.2 + index) * 0.04 * layerExplode;
        let ry = THREE.MathUtils.lerp(key === "cheese" ? Math.PI / 4 : 0.0, conf.ry, layerExplode) + (t * 0.07) * layerExplode;

        // Custom wiggles requested by user (e.g. patty rotation, onion spins, tomato rotation)
        if (key === "patty") {
          ry += layerExplode * Math.PI * 0.5;
        } else if (key === "onion") {
          ry += layerExplode * Math.PI * 1.5;
        } else if (key === "tomatoes") {
          ry += layerExplode * Math.PI * 1.2;
        } else if (key === "lettuce") {
          ry += Math.sin(t * 2) * 0.06 * layerExplode;
          rx += Math.cos(t * 2.5) * 0.04 * layerExplode;
        }

        child.rotation.x = rx;
        child.rotation.y = ry;
        child.rotation.z = rz;
      } else {
        child.rotation.x = 0;
        child.rotation.z = 0;
        child.rotation.y = key === "cheese" ? Math.PI / 4 : 0;
      }

      // Handle customizer and highlights opacity
      let baseOpacity = currentOpacity;
      let isHighlighted = false;

      if (activeHighlight) {
        if (activeHighlight === key) {
          isHighlighted = true;
        } else if (!activeCustomizer) {
          baseOpacity = 0.22 * currentOpacity;
        }
      }

      // Apply animated layer opacity & scale
      child.scale.set(visual.scale, visual.scale, visual.scale);
      child.visible = visual.opacity > 0.01;

      child.traverse((node) => {
        if (node.isMesh && node.material && node.material.emissive) {
          if (isHighlighted) {
            node.material.emissive.copy(emissiveColors[key]);
          } else {
            node.material.emissive.copy(emissiveColors.black);
          }

          const layerOpacity = baseOpacity * visual.opacity;
          const needsTrans = layerOpacity < 0.98 || (activeHighlight && !isHighlighted && !activeCustomizer);
          node.material.transparent = needsTrans;
          node.material.opacity = layerOpacity;
          node.material.depthWrite = !needsTrans || isHighlighted;
        }
      });
    });
  });

  return (
    <group 
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (burgerStateRef.current.explodeFactor < 0.15) {
          setIsHovered(true);
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setIsHovered(false);
      }}
    >
      {/* 1. TOP BUN */}
      <group name="topBun">
        <mesh castShadow receiveShadow scale={[1, 0.65, 1]}>
          <sphereGeometry args={[2, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={layerConfig.topBun.color}
            roughness={0.45}
            metalness={0.0}
            clearcoat={0.15}
            clearcoatRoughness={0.4}
          />
        </mesh>
        <SesameSeeds />
      </group>

      {/* 1. TOP BUN */}
      <group name="topBun">
        <mesh castShadow={!isMobile} receiveShadow={!isMobile} scale={[1, 0.65, 1]}>
          <sphereGeometry args={isMobile ? [2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2] : [2, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <BurgerMaterial
            color={layerConfig.topBun.color}
            roughness={0.45}
            metalness={0.0}
            clearcoat={0.15}
            clearcoatRoughness={0.4}
          />
        </mesh>
        <SesameSeeds count={isMobile ? 15 : 90} />
      </group>

      {/* 2. CRISP WAVY LETTUCE */}
      <group name="lettuce">
        <mesh castShadow={!isMobile} receiveShadow={!isMobile}>
          <cylinderGeometry ref={lettuceGeoRef} args={isMobile ? [2.05, 2.05, 0.08, 16, 1] : [2.05, 2.05, 0.08, 64, 4]} />
          <BurgerMaterial
            color={layerConfig.lettuce.color}
            roughness={0.65}
            clearcoat={0.25}
            transmission={0.32} // lettuce light translucency
            thickness={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* 3. SHINY SLICED TOMATOES */}
      <group name="tomatoes">
        <mesh position={[-0.65, 0, 0.25]} rotation={[0.05, 0, 0.08]} castShadow={!isMobile} receiveShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [0.85, 0.85, 0.15, 10] : [0.85, 0.85, 0.15, 24]} />
          <BurgerMaterial
            color={layerConfig.tomatoes.color}
            roughness={0.12} // glossy wet surface
            clearcoat={0.7}
            clearcoatRoughness={0.1}
            metalness={0.05}
          />
        </mesh>
        <mesh position={[0.65, 0, -0.25]} rotation={[-0.05, 0, -0.08]} castShadow={!isMobile} receiveShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [0.85, 0.85, 0.15, 10] : [0.85, 0.85, 0.15, 24]} />
          <BurgerMaterial
            color={layerConfig.tomatoes.color}
            roughness={0.12}
            clearcoat={0.7}
            clearcoatRoughness={0.1}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* 4. ONIONS */}
      <group name="onion">
        <mesh position={[-0.55, 0, 0.35]} rotation={[Math.PI / 2 + 0.1, 0.25, 0]} scale={[1, 1, 0.35]} castShadow={!isMobile}>
          <torusGeometry args={isMobile ? [0.85, 0.08, 4, 10] : [0.85, 0.08, 8, 24]} />
          <BurgerMaterial 
            color={layerConfig.onion.color} 
            roughness={0.3} 
            transmission={0.25} // translucent onion slices
            thickness={0.2}
          />
        </mesh>
        <mesh position={[0.45, 0, -0.35]} rotation={[Math.PI / 2 - 0.1, -0.2, 0.45]} scale={[0.9, 0.9, 0.35]} castShadow={!isMobile}>
          <torusGeometry args={isMobile ? [0.85, 0.08, 4, 10] : [0.85, 0.08, 8, 24]} />
          <BurgerMaterial 
            color={layerConfig.onion.color} 
            roughness={0.3} 
            transmission={0.25}
            thickness={0.2}
          />
        </mesh>
      </group>

      {/* 5. PICKLES */}
      <group name="pickles">
        <mesh position={[-0.6, 0, -0.4]} rotation={[0.15, 0.3, -0.1]} scale={[1.1, 1, 1.0]} castShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [0.35, 0.35, 0.06, 8] : [0.35, 0.35, 0.06, 16]} />
          <BurgerMaterial color={layerConfig.pickles.color} roughness={0.45} clearcoat={0.15} />
        </mesh>
        <mesh position={[0.5, 0, 0.5]} rotation={[-0.1, -0.25, 0.15]} scale={[1.0, 1, 1.0]} castShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [0.35, 0.35, 0.06, 8] : [0.35, 0.35, 0.06, 16]} />
          <BurgerMaterial color={layerConfig.pickles.color} roughness={0.45} clearcoat={0.15} />
        </mesh>
        <mesh position={[0.1, 0, -0.6]} rotation={[0, 0.9, -0.1]} scale={[1.0, 1, 0.9]} castShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [0.35, 0.35, 0.06, 8] : [0.35, 0.35, 0.06, 16]} />
          <BurgerMaterial color={layerConfig.pickles.color} roughness={0.45} clearcoat={0.15} />
        </mesh>
      </group>

      {/* 6. MELTING CHEDDAR CHEESE */}
      <group name="cheese">
        <mesh rotation={[0, Math.PI / 4, 0]} castShadow={!isMobile} receiveShadow={!isMobile}>
          <boxGeometry ref={cheeseGeoRef} args={isMobile ? [3.3, 0.03, 3.3, 2, 1, 2] : [3.3, 0.03, 3.3, 8, 1, 8]} />
          <BurgerMaterial
            color={layerConfig.cheese.color}
            roughness={0.32} // slightly oily melted cheese
            transmission={0.15} // translucent edges
            thickness={0.12}
            metalness={0.02}
          />
        </mesh>
      </group>

      {/* 7. BEEF PATTY */}
      <group name="patty">
        <mesh castShadow={!isMobile} receiveShadow={!isMobile}>
          <cylinderGeometry ref={pattyGeoRef} args={isMobile ? [1.9, 1.95, 0.45, 16, 1] : [1.9, 1.95, 0.45, 32, 4]} />
          <BurgerMaterial
            color={layerConfig.patty.color}
            roughness={0.82}
            bumpMap={pattyBump.current}
            bumpScale={0.06}
            clearcoat={0.25} // seared glisten juice coat
            clearcoatRoughness={0.65}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* 8. GLOSSY KETCHUP SAUCE */}
      <group name="sauce">
        <mesh scale={[1, 0.6, 1]} castShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [1.7, 1.8, 0.1, 16] : [1.7, 1.8, 0.1, 32]} />
          <BurgerMaterial
            color={layerConfig.sauce.color}
            roughness={0.05} // ultra wet glossy
            clearcoat={0.8}
            clearcoatRoughness={0.05}
          />
        </mesh>
      </group>

      {/* 9. BOTTOM BUN */}
      <group name="bottomBun">
        <mesh castShadow={!isMobile} receiveShadow={!isMobile}>
          <cylinderGeometry args={isMobile ? [1.85, 1.9, 0.4, 16] : [1.85, 1.9, 0.4, 32]} />
          <BurgerMaterial
            color={layerConfig.bottomBun.color}
            roughness={0.55}
            metalness={0.02}
            clearcoat={0.06}
            clearcoatRoughness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

// Camera control and mouse parallax coordinator
function CameraCoordinator({ burgerStateRef }) {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) - 0.5;
      mouseRef.current.y = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    const burgerState = burgerStateRef ? burgerStateRef.current : {
      camX: 0,
      camY: 0.5,
      camZ: 7.2,
      camLookAtY: 0.2,
    };

    // Parallax blending
    const targetCamX = burgerState.camX + mouseRef.current.x * 2.5;
    const targetCamY = burgerState.camY - mouseRef.current.y * 2.5;
    const targetCamZ = burgerState.camZ;

    camera.position.x += (targetCamX - camera.position.x) * 0.08;
    camera.position.y += (targetCamY - camera.position.y) * 0.08;
    camera.position.z += (targetCamZ - camera.position.z) * 0.08;

    camera.lookAt(0, burgerState.camLookAtY, 0);
  });

  return null;
}

export default function Burger3D({
  burgerStateRef,
  activeCustomizer,
  activeShowcase,
  activeIngredients,
  hoveredIngredient,
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-full relative outline-none select-none">
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? 1 : [1, 1.5]}
        camera={{ position: [0, 0.5, 8.5], fov: 45 }}
        gl={{ antialias: !isMobile, alpha: true }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 6, 15]} />

        {/* Ambient environmental occlusion lights */}
        <ambientLight intensity={0.6} color="#ffffff" />

        {/* Cinematic volumetric and spotlight arrays */}
        <spotLight
          position={[0, 8, 4]}
          angle={Math.PI / 4.5}
          penumbra={0.9}
          intensity={5.0}
          color="#ff7a00"
          castShadow={!isMobile}
          shadow-mapSize={isMobile ? [256, 256] : [2048, 2048]}
          shadow-bias={-0.0001}
        />
        <spotLight
          position={[-6, 4, -4]}
          angle={Math.PI / 3.5}
          penumbra={0.7}
          intensity={2.8}
          color="#ffb347"
        />
        <directionalLight 
          position={[6, 5, 4]} 
          intensity={2.0} 
          color="#ffffff" 
          castShadow={!isMobile} 
          shadow-mapSize={isMobile ? [256, 256] : [1024, 1024]}
        />
        <pointLight position={[0, -5, 0]} intensity={4.0} color="#ff4500" />

        {/* 3D Ember Particles removed */}

        {/* STAX Model meshes */}
        <StackGroup
          burgerStateRef={burgerStateRef}
          activeCustomizer={activeCustomizer}
          activeShowcase={activeShowcase}
          activeIngredients={activeIngredients}
          hoveredIngredient={hoveredIngredient}
          isMobile={isMobile}
        />

        {/* Camera Coordinator linking R3F render frame loops to GSAP timelines */}
        <CameraCoordinator burgerStateRef={burgerStateRef} />
      </Canvas>
    </div>
  );
}
