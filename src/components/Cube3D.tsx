import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { resolveMobile3DMode } from '@/lib/mobileRenderBudget';
import { isWebGLRuntimeSupported } from '@/lib/webglSupport';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import { useMobileRenderBudget } from '@/hooks/use-mobile-render-budget';

type CubeState = 'intact' | 'cracked' | 'destroyed';

interface CubeMeshProps {
  state: CubeState;
  progress: number;
  maxProgress: number;
  isShaking: boolean;
  seedKey: string;
  anisotropyCap: number;
}

interface CrackLine {
  start: THREE.Vector3;
  end: THREE.Vector3;
}

interface CrackStrip {
  center: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  width: number;
  cavity: number;
}

type ConcreteTextureVariant = 'intact' | 'cracked' | 'destroyed';
type CubeFace = 'px' | 'nx' | 'py' | 'ny' | 'pz' | 'nz';

const texturePaths: [string, string, string] = [
  `${import.meta.env.BASE_URL}textures/concrete/concrete_user_base.jpeg`,
  `${import.meta.env.BASE_URL}textures/concrete/concrete_normal_1k.png`,
  `${import.meta.env.BASE_URL}textures/concrete/concrete_roughness_1k.jpg`,
];
const destroyedModelPath = `${import.meta.env.BASE_URL}models/POCHINENNIIBLOKBETONA.glb`;
const unifiedCubeSize = 1;
const destroyedFootprintScaleBoost = 1.75;

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const getImageDimension = (source: unknown, axis: 'width' | 'height'): number | null => {
  if (!source || typeof source !== 'object') return null;
  const dimension = Reflect.get(source, axis);
  if (typeof dimension !== 'number' || !Number.isFinite(dimension) || dimension <= 0) return null;
  return dimension;
};

const createSquareConcreteSource = (sourceImage?: CanvasImageSource): HTMLCanvasElement => {
  const sourceWidth = Math.round(getImageDimension(sourceImage, 'width') ?? 1024);
  const sourceHeight = Math.round(getImageDimension(sourceImage, 'height') ?? 1024);
  const cropSize = Math.max(1, Math.min(sourceWidth, sourceHeight));
  const offsetX = Math.max(0, Math.floor((sourceWidth - cropSize) / 2));
  const offsetY = Math.max(0, Math.floor((sourceHeight - cropSize) / 2));
  const canvas = document.createElement('canvas');
  canvas.width = cropSize;
  canvas.height = cropSize;
  const context = canvas.getContext('2d');

  if (!context) {
    return canvas;
  }

  if (sourceImage) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(sourceImage, offsetX, offsetY, cropSize, cropSize, 0, 0, cropSize, cropSize);
    return canvas;
  }

  context.fillStyle = '#b7bcc0';
  context.fillRect(0, 0, cropSize, cropSize);
  return canvas;
};

interface CachedConcreteVariantMaps {
  sourceKey: string;
  intactMap: THREE.Texture;
  crackedMap: THREE.Texture;
  destroyedMap: THREE.Texture;
}

let concreteVariantCache: CachedConcreteVariantMaps | null = null;

const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createSeededRandom = (seedValue: string) => {
  let seed = hashString(seedValue) || 1;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const drawDestroyedPits = (context: CanvasRenderingContext2D, width: number, height: number) => {
  const random = createSeededRandom('concrete:destroyed:pits');
  const pitCount = 220;

  context.save();
  for (let i = 0; i < pitCount; i += 1) {
    const radius = 0.4 + random() * 2.2;
    const x = random() * width;
    const y = random() * height;
    const darkAlpha = 0.03 + random() * 0.07;
    const lightAlpha = 0.015 + random() * 0.03;

    context.fillStyle = `rgba(24, 28, 32, ${darkAlpha})`;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = `rgba(240, 242, 244, ${lightAlpha})`;
    context.beginPath();
    context.arc(x - radius * 0.35, y - radius * 0.35, radius * 0.55, 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
};

const drawFractureVeins = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  variant: Extract<ConcreteTextureVariant, 'cracked' | 'destroyed'>,
) => {
  const random = createSeededRandom(`concrete:${variant}:veins`);
  const veinCount = variant === 'destroyed' ? 52 : 28;

  context.save();
  context.globalCompositeOperation = 'multiply';

  for (let i = 0; i < veinCount; i += 1) {
    let x = random() * width;
    let y = random() * height;
    const segments = 3 + Math.floor(random() * 8);
    const baseThickness = (variant === 'destroyed' ? 1.2 : 0.8) + random() * 1.1;
    const alpha = variant === 'destroyed' ? 0.26 + random() * 0.17 : 0.18 + random() * 0.12;

    context.strokeStyle = `rgba(18, 20, 24, ${alpha})`;
    context.lineWidth = baseThickness;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(x, y);

    for (let segment = 0; segment < segments; segment += 1) {
      const angle = random() * Math.PI * 2;
      const length = width * (0.02 + random() * 0.07);
      x = clamp(x + Math.cos(angle) * length, 0, width);
      y = clamp(y + Math.sin(angle) * length, 0, height);
      context.lineTo(x, y);
    }

    context.stroke();
  }

  context.restore();
};

const faceList: CubeFace[] = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
const projectFacePoint = (face: CubeFace, u: number, v: number): THREE.Vector3 => {
  const surface = 0.503;
  switch (face) {
    case 'px':
      return new THREE.Vector3(surface, u, v);
    case 'nx':
      return new THREE.Vector3(-surface, u, v);
    case 'py':
      return new THREE.Vector3(u, surface, v);
    case 'ny':
      return new THREE.Vector3(u, -surface, v);
    case 'pz':
      return new THREE.Vector3(u, v, surface);
    case 'nz':
      return new THREE.Vector3(u, v, -surface);
  }
};

const getSurfaceNormal = (point: THREE.Vector3): THREE.Vector3 => {
  const absX = Math.abs(point.x);
  const absY = Math.abs(point.y);
  const absZ = Math.abs(point.z);

  if (absX >= absY && absX >= absZ) {
    return new THREE.Vector3(Math.sign(point.x) || 1, 0, 0);
  }
  if (absY >= absX && absY >= absZ) {
    return new THREE.Vector3(0, Math.sign(point.y) || 1, 0);
  }
  return new THREE.Vector3(0, 0, Math.sign(point.z) || 1);
};

const createConcreteVariantTexture = (sourceTexture: THREE.Texture, variant: ConcreteTextureVariant): THREE.Texture => {
  const sourceImage = sourceTexture.image as CanvasImageSource | undefined;
  const squareSource = createSquareConcreteSource(sourceImage);
  const width = squareSource.width;
  const height = squareSource.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    return sourceTexture.clone();
  }

  context.drawImage(squareSource, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const tone =
    variant === 'intact'
      ? { contrast: 0.97, offset: 42, noise: 1.2 }
      : variant === 'cracked'
        ? { contrast: 0.98, offset: 36, noise: 1.6 }
        : { contrast: 1, offset: 24, noise: 2.4 };

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;
    const grainSeed = Math.sin((index / 4) * 0.067 + 1.13) * 43758.5453;
    const grain = (grainSeed - Math.floor(grainSeed) - 0.5) * tone.noise;
    const contrasted = (luminance - 128) * tone.contrast + 128;
    const value = clamp(Math.round(contrasted + tone.offset + grain), 44, 240);

    pixels[index] = value;
    pixels[index + 1] = value;
    pixels[index + 2] = value;
  }

  context.putImageData(imageData, 0, 0);

  if (variant === 'cracked' || variant === 'destroyed') {
    drawFractureVeins(context, width, height, variant);
  }

  if (variant === 'destroyed') {
    drawDestroyedPits(context, width, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

const getTextureSourceKey = (texture: THREE.Texture) => {
  const image = texture.image as { currentSrc?: string; src?: string } | undefined;
  return image?.currentSrc ?? image?.src ?? texture.uuid;
};

const getOrCreateCachedVariants = (map: THREE.Texture): CachedConcreteVariantMaps => {
  const sourceKey = getTextureSourceKey(map);
  if (concreteVariantCache?.sourceKey === sourceKey) {
    return concreteVariantCache;
  }

  concreteVariantCache = {
    sourceKey,
    intactMap: createConcreteVariantTexture(map, 'intact'),
    crackedMap: createConcreteVariantTexture(map, 'cracked'),
    destroyedMap: createConcreteVariantTexture(map, 'destroyed'),
  };

  return concreteVariantCache;
};

function useConcreteTextures(anisotropyCap: number) {
  const [map, normalMap, roughnessMap] = useTexture([...texturePaths]) as THREE.Texture[];
  const { gl } = useThree();
  const variantMaps = useMemo(() => getOrCreateCachedVariants(map), [map]);

  useEffect(() => {
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), anisotropyCap);
    const texturedMaterials = [variantMaps.intactMap, variantMaps.crackedMap, variantMaps.destroyedMap];

    texturedMaterials.forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(1, 1);
      texture.anisotropy = maxAnisotropy;
      texture.needsUpdate = true;
    });

    normalMap.wrapS = normalMap.wrapT = THREE.ClampToEdgeWrapping;
    roughnessMap.wrapS = roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
    normalMap.repeat.set(1, 1);
    roughnessMap.repeat.set(1, 1);
    normalMap.anisotropy = maxAnisotropy;
    roughnessMap.anisotropy = maxAnisotropy;
  }, [anisotropyCap, gl, normalMap, roughnessMap, variantMaps]);

  return {
    intactMap: variantMaps.intactMap,
    crackedMap: variantMaps.crackedMap,
    destroyedMap: variantMaps.destroyedMap,
    normalMap,
    roughnessMap,
  };
}

useGLTF.preload(destroyedModelPath);

const tuneDestroyedMaterial = (material: THREE.Material): THREE.Material => {
  const adjusted = material.clone();

  if (adjusted instanceof THREE.MeshStandardMaterial || adjusted instanceof THREE.MeshPhysicalMaterial) {
    adjusted.roughness = clamp(Math.max(adjusted.roughness, 0.86), 0, 1);
    adjusted.metalness = Math.min(adjusted.metalness, 0.08);
    adjusted.envMapIntensity = 0.3;
    adjusted.color = adjusted.color.clone().lerp(new THREE.Color('#d6dbe0'), 0.12);
  }

  return adjusted;
};

function DestroyedConcreteModel() {
  const { scene } = useGLTF(destroyedModelPath) as { scene: THREE.Group };
  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;

      if (Array.isArray(node.material)) {
        node.material = node.material.map((material) => tuneDestroyedMaterial(material));
        return;
      }

      node.material = tuneDestroyedMaterial(node.material);
    });

    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const footprintSize = Math.max(size.x, size.z, 0.001);
    const uniformScale = (unifiedCubeSize * destroyedFootprintScaleBoost) / footprintSize;
    // Normalize by footprint so the destroyed model matches the intact cube footprint.
    clone.scale.setScalar(uniformScale);

    const scaledBounds = new THREE.Box3().setFromObject(clone);
    const center = scaledBounds.getCenter(new THREE.Vector3());
    clone.position.set(-center.x, -center.y, -center.z);

    const groundedBounds = new THREE.Box3().setFromObject(clone);
    clone.position.y += -0.5 - groundedBounds.min.y;

    return clone;
  }, [scene]);

  return <primitive object={model} />;
}

function CubeMesh({ state, progress, maxProgress, isShaking, seedKey, anisotropyCap }: CubeMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const crackProgress = clamp(progress / maxProgress, 0, 1);
  const textures = useConcreteTextures(anisotropyCap);

  const crackLines = useMemo(() => {
    const random = createSeededRandom(`${seedKey}:realistic-cracks`);
    const lines: CrackLine[] = [];
    const count = 24;

    for (let i = 0; i < count; i += 1) {
      const face = faceList[Math.floor(random() * faceList.length)];
      const segmentCount = 4 + Math.floor(random() * 6);
      let u = (random() - 0.5) * 0.68;
      let v = (random() - 0.5) * 0.68;
      let angle = random() * Math.PI * 2;

      for (let j = 0; j < segmentCount; j += 1) {
        const prevU = u;
        const prevV = v;
        angle += (random() - 0.5) * 1.18;
        const step = 0.08 + random() * 0.18;
        u = clamp(u + Math.cos(angle) * step, -0.49, 0.49);
        v = clamp(v + Math.sin(angle) * step, -0.49, 0.49);
        lines.push({
          start: projectFacePoint(face, prevU, prevV),
          end: projectFacePoint(face, u, v),
        });

        if (random() > 0.72) {
          const branchAngle = angle + (random() > 0.5 ? 1 : -1) * (0.38 + random() * 0.92);
          const branchStep = step * (0.35 + random() * 0.45);
          const branchU = clamp(prevU + Math.cos(branchAngle) * branchStep, -0.49, 0.49);
          const branchV = clamp(prevV + Math.sin(branchAngle) * branchStep, -0.49, 0.49);
          lines.push({
            start: projectFacePoint(face, prevU, prevV),
            end: projectFacePoint(face, branchU, branchV),
          });
        }
      }
    }

    return lines;
  }, [seedKey]);

  useFrame((renderState, delta) => {
    if (!meshRef.current) return;
    const elapsed = renderState.clock.elapsedTime;

    if (isShaking && state !== 'destroyed') {
      meshRef.current.position.x = Math.sin(elapsed * 36) * 0.011 * crackProgress;
      meshRef.current.position.y = Math.cos(elapsed * 42) * 0.006 * crackProgress;
    } else {
      meshRef.current.position.x = THREE.MathUtils.damp(meshRef.current.position.x, 0, 12, delta);
      meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, 0, 12, delta);
    }

    if (state === 'destroyed') {
      meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, 0, 5, delta);
      meshRef.current.rotation.y = THREE.MathUtils.damp(meshRef.current.rotation.y, 0.18, 5, delta);
      meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, 0, 5, delta);
      return;
    }

    meshRef.current.rotation.x = THREE.MathUtils.damp(meshRef.current.rotation.x, 0, 8, delta);
    meshRef.current.rotation.z = THREE.MathUtils.damp(meshRef.current.rotation.z, 0, 8, delta);
    meshRef.current.rotation.y += delta * (state === 'cracked' ? 0.11 : 0.06);
  });

  const visibleCracksCount =
    state === 'intact'
      ? 0
      : state === 'destroyed'
        ? crackLines.length
        : Math.max(3, Math.round(crackLines.length * clamp((crackProgress - 0.62) / 0.32, 0, 1)));
  const visibleCracks = crackLines.slice(0, visibleCracksCount);
  const crackStrips = useMemo(() => {
    const strips: CrackStrip[] = [];
    const random = createSeededRandom(`${seedKey}:crack-widths`);

    visibleCracks.forEach((line) => {
      const direction = new THREE.Vector3().subVectors(line.end, line.start);
      const length = direction.length();
      if (length < 0.01) return;

      const tangent = direction.normalize();
      const normal = getSurfaceNormal(line.start);
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize();
      const adjustedTangent = new THREE.Vector3().crossVectors(bitangent, normal).normalize();

      const rotationMatrix = new THREE.Matrix4().makeBasis(adjustedTangent, bitangent, normal);
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);
      const center = new THREE.Vector3()
        .addVectors(line.start, line.end)
        .multiplyScalar(0.5)
        .addScaledVector(normal, 0.0025);

      const width = (0.006 + random() * 0.006) * (0.5 + crackProgress * 0.8);
      const cavity = 0.001 + random() * 0.0015;

      strips.push({ center, quaternion, length, width, cavity });
    });

    return strips;
  }, [crackProgress, seedKey, visibleCracks]);

  return (
    <group ref={meshRef}>
      {state !== 'destroyed' ? (
        <>
          <mesh>
            <boxGeometry args={[unifiedCubeSize, unifiedCubeSize, unifiedCubeSize]} />
            <meshStandardMaterial
              map={state === 'cracked' ? textures.crackedMap : textures.intactMap}
              normalMap={textures.normalMap}
              roughnessMap={textures.roughnessMap}
              normalScale={new THREE.Vector2(0.8, 0.8)}
              metalness={0.02}
              roughness={state === 'cracked' ? 0.96 : 0.9}
              color={state === 'cracked' ? '#e9eef2' : '#f0f4f7'}
            />
          </mesh>

          {crackStrips.map((strip, index) => (
            <mesh
              key={index}
              position={strip.center}
              quaternion={strip.quaternion}
              scale={[strip.length, strip.width + strip.cavity, 1]}
            >
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial
                color="#111317"
                transparent
                opacity={0.34 + crackProgress * 0.58}
                depthWrite={false}
              />
            </mesh>
          ))}
        </>
      ) : (
        <>
          <Suspense fallback={null}>
            <DestroyedConcreteModel />
          </Suspense>
        </>
      )}
    </group>
  );
}

interface Cube3DProps {
  state: CubeState;
  progress: number;
  maxProgress: number;
  isShaking: boolean;
  seedKey: string;
  compact?: boolean;
}

const getCubeHeightClass = (compact: boolean) =>
  compact ? 'h-[clamp(220px,34vh,320px)]' : 'h-[clamp(300px,46vh,520px)]';

const createGroundGridTexture = (): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;

  const size = 1024;
  const cell = 112;
  const majorCell = cell * 4;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.clearRect(0, 0, size, size);

  for (let offset = 0; offset <= size; offset += cell) {
    const isMajorLine = offset % majorCell === 0;
    context.strokeStyle = isMajorLine ? 'rgba(236, 244, 252, 0.62)' : 'rgba(236, 244, 252, 0.42)';
    context.lineWidth = isMajorLine ? 2.8 : 1.8;

    context.beginPath();
    context.moveTo(offset + 0.5, 0);
    context.lineTo(offset + 0.5, size);
    context.stroke();

    context.beginPath();
    context.moveTo(0, offset + 0.5);
    context.lineTo(size, offset + 0.5);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
  return texture;
};

function FallbackCube({
  state,
  progress,
  maxProgress,
  compact = false,
}: Pick<Cube3DProps, 'state' | 'progress' | 'maxProgress' | 'compact'>) {
  const percent = clamp((progress / maxProgress) * 100, 0, 100);
  const heightClass = getCubeHeightClass(compact);

  return (
    <div className={`relative ${heightClass} w-full overflow-hidden rounded-2xl bg-gradient-to-b from-secondary/60 to-secondary/34`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[12%] bottom-[6%] h-[42%]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(236 244 252 / 0.36) 1.8px, transparent 1.8px), linear-gradient(to bottom, rgb(236 244 252 / 0.36) 1.8px, transparent 1.8px)',
          backgroundSize: '38px 38px',
        }}
      />
      <div className="absolute inset-x-4 top-4 rounded-2xl bg-white/86 p-4 backdrop-blur-md sm:inset-x-8 sm:top-8 sm:p-6">
        <div className="mb-4 text-center text-sm font-medium text-muted-foreground">Упрощенный режим визуализации</div>
        <div className="mx-auto mb-4 h-24 w-24 rounded-2xl border border-border bg-gradient-to-br from-zinc-100 to-zinc-300 sm:h-28 sm:w-28" />
        <div className="h-3 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full transition-all duration-300 ${
              state === 'intact' ? 'bg-success' : state === 'cracked' ? 'bg-amber-500' : 'bg-danger'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
        <div
          className={`
            rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-md sm:px-4
            ${state === 'intact' ? 'border-success/20 bg-success/10 text-success' : ''}
            ${state === 'cracked' ? 'border-amber-500/20 bg-amber-500/10 text-amber-600' : ''}
            ${state === 'destroyed' ? 'border-danger/20 bg-danger/10 text-danger' : ''}
          `}
        >
          {state === 'intact' && 'Целый образец'}
          {state === 'cracked' && 'Появились трещины'}
          {state === 'destroyed' && 'Образец разрушен'}
        </div>
        <div className="rounded-lg border border-border/70 bg-white/86 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
          2D-режим
        </div>
      </div>
    </div>
  );
}

export function Cube3D({ state, progress, maxProgress, isShaking, seedKey, compact = false }: Cube3DProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { budget, deviceHints, isMobile } = useMobileRenderBudget(reducedMotion);
  const [webglSupported, setWebglSupported] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  );
  const heightClass = getCubeHeightClass(compact);
  const mode = resolveMobile3DMode({
    webglSupported,
    prefersReducedMotion: reducedMotion,
    isMobile,
    deviceHints,
  });
  const isLowDprBudget = budget.canvasDprMax <= 1.12;
  const frameLoopMode = !isDocumentVisible ? 'never' : reducedMotion ? 'demand' : 'always';
  const antialiasEnabled = !isMobile || !isLowDprBudget;
  const powerPreference = isMobile && isLowDprBudget ? 'low-power' : 'high-performance';
  const groundGridTexture = useMemo(() => createGroundGridTexture(), []);

  useEffect(() => {
    setWebglSupported(isWebGLRuntimeSupported());
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState !== 'hidden');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!groundGridTexture) return;
    groundGridTexture.anisotropy = Math.min(4, budget.anisotropyCap);
    groundGridTexture.needsUpdate = true;

    return () => {
      groundGridTexture.dispose();
    };
  }, [budget.anisotropyCap, groundGridTexture]);

  if (mode === 'fallback2d') {
    return <FallbackCube state={state} progress={progress} maxProgress={maxProgress} compact={compact} />;
  }

  return (
    <div
      className={`relative ${heightClass} w-full overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_0%,#eef2f6_0%,#d7dee6_45%,#bcc6d1_100%)]`}
    >
      <Canvas
        dpr={[1, budget.canvasDprMax]}
        frameloop={frameLoopMode}
        gl={{
          powerPreference,
          antialias: antialiasEnabled,
          alpha: true,
          depth: true,
          stencil: false,
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerspectiveCamera makeDefault position={[2.25, 1.55, 2.1]} fov={38} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={!reducedMotion}
          dampingFactor={0.08}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />

        <ambientLight intensity={0.48} />
        <hemisphereLight intensity={0.62} color="#f3f7fb" groundColor="#9ca6b1" />
        <directionalLight
          position={[3.8, 4.6, 2.8]}
          intensity={1.05}
        />
        <directionalLight position={[-3, 2.6, -2.2]} intensity={0.36} color="#9da7b1" />
        <pointLight position={[0, 2.2, 0]} intensity={0.13} color="#d4dde6" />

        {groundGridTexture ? (
          <mesh position={[0, -0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.6, 3.6]} />
            <meshBasicMaterial
              map={groundGridTexture}
              transparent
              depthWrite={false}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ) : null}

        <CubeMesh
          state={state}
          progress={progress}
          maxProgress={maxProgress}
          isShaking={isShaking}
          seedKey={seedKey}
          anisotropyCap={budget.anisotropyCap}
        />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
        <div
          className={`
            rounded-xl border px-3 py-2 text-xs font-semibold backdrop-blur-md sm:px-4
            ${state === 'intact' ? 'border-success/20 bg-success/10 text-success' : ''}
            ${state === 'cracked' ? 'border-amber-500/20 bg-amber-500/10 text-amber-600' : ''}
            ${state === 'destroyed' ? 'border-danger/20 bg-danger/10 text-danger' : ''}
          `}
        >
          {state === 'intact' && 'Целый образец'}
          {state === 'cracked' && 'Появились трещины'}
          {state === 'destroyed' && 'Образец разрушен'}
        </div>
        <div className="rounded-lg border border-border/70 bg-white/86 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
          3D-визуализация
        </div>
      </div>
    </div>
  );
}
