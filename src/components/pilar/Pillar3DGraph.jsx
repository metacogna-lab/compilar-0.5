import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Move3d, X, Play, Pause, Rewind, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pillarsInfo } from './pillarsData';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield,
  normexp: Compass,
  dirrecip: Heart,
  status: Shield,
  ownprosp: Zap,
  incresp: BookOpen,
  divsexp: Compass,
  indrecip: Heart,
  popularity: Shield,
  grpprosp: Zap,
  outresp: BookOpen
};

const pillarColors = {
  purpose: '#8B5CF6',
  interpersonal: '#EC4899',
  learning: '#4F46E5',
  action: '#10B981',
  resilience: '#F59E0B',
  normexp: '#8B5CF6',
  dirrecip: '#EC4899',
  status: '#4F46E5',
  ownprosp: '#10B981',
  incresp: '#F59E0B',
  divsexp: '#8B5CF6',
  indrecip: '#EC4899',
  popularity: '#4F46E5',
  grpprosp: '#10B981',
  outresp: '#F59E0B'
};

const pillarPositions = {
  normexp: { x: 0, y: 4, z: 0 },
  dirrecip: { x: 3.5, y: 1, z: 2 },
  status: { x: 2, y: -2, z: -3 },
  ownprosp: { x: -2, y: -2, z: -3 },
  incresp: { x: -3.5, y: 1, z: 2 },
  divsexp: { x: 0, y: 4, z: 0 },
  indrecip: { x: 3.5, y: 1, z: 2 },
  popularity: { x: 2, y: -2, z: -3 },
  grpprosp: { x: -2, y: -2, z: -3 },
  outresp: { x: -3.5, y: 1, z: 2 }
};

const networkPositions = {
  normexp: { x: 0, y: 0, z: 4 },
  dirrecip: { x: 3.5, y: 0, z: 2 },
  status: { x: 2, y: 0, z: -3 },
  ownprosp: { x: -2, y: 0, z: -3 },
  incresp: { x: -3.5, y: 0, z: 2 },
  divsexp: { x: 0, y: 0, z: 4 },
  indrecip: { x: 3.5, y: 0, z: 2 },
  popularity: { x: 2, y: 0, z: -3 },
  grpprosp: { x: -2, y: 0, z: -3 },
  outresp: { x: -3.5, y: 0, z: 2 }
};

export const connections = [
  { from: 'divsexp', to: 'indrecip', label: 'Growth Mindset', detail: 'My voicing a future version of the group indicates to others a growth mindset and thus willingness to help or be helped.', strength: 0.85, modes: ['egalitarian'], color: '#8B5CF6' },
  { from: 'divsexp', to: 'grpprosp', label: 'Font of Wisdom', detail: 'When I have input, since I think my ideas are valuable, group success seems likelier.', strength: 0.80, modes: ['egalitarian'], color: '#8B5CF6' },
  { from: 'divsexp', to: 'outresp', label: 'Safe to Challenge', detail: 'When psychological safety is high, I can better assess colleagues\' true competence through open dialogue and constructive disagreement.', strength: 0.78, modes: ['egalitarian'], color: '#8B5CF6' },
  { from: 'indrecip', to: 'popularity', label: 'Spread the Love', detail: 'I feel liked when others want to help me.', strength: 0.88, modes: ['egalitarian'], color: '#EC4899' },
  { from: 'indrecip', to: 'grpprosp', label: 'Mucking in Together', detail: 'My receiving help suggests that everyone who needs help will get it, which increases the chance of group success.', strength: 0.90, modes: ['egalitarian'], color: '#EC4899' },
  { from: 'popularity', to: 'divsexp', label: 'Making Fetch Happen', detail: 'I\'m popular and so believe that my suggestions for change will be listened to.', strength: 0.82, modes: ['egalitarian'], color: '#4F46E5' },
  { from: 'popularity', to: 'grpprosp', label: 'Knowing What\'s Best', detail: 'I\'m popular and so can influence the group, which (in my view) will improve its success.', strength: 0.75, modes: ['egalitarian'], color: '#4F46E5' },
  { from: 'grpprosp', to: 'outresp', label: 'Scapegoating', detail: 'Impending group success increases your confidence in colleagues\' competence and trustworthiness.', strength: 0.85, modes: ['egalitarian'], color: '#10B981' },
  { from: 'outresp', to: 'grpprosp', label: 'Quality Street', detail: 'When I think colleagues are competent and trustworthy, I\'m more likely to believe the group will succeed.', strength: 0.92, modes: ['egalitarian'], color: '#F59E0B' },
  { from: 'outresp', to: 'indrecip', label: 'I\'ll Just Do It Myself', detail: 'When I think colleagues are competent and trustworthy, I am more likely to want to help, and be helped by them.', strength: 0.87, modes: ['egalitarian'], color: '#F59E0B' },
  { from: 'normexp', to: 'dirrecip', label: 'Predictability Preferred', detail: 'When I support the status quo, I seem reliable and stable, which increases the likelihood of others partnering with me.', strength: 0.85, modes: ['hierarchical'], color: '#8B5CF6' },
  { from: 'normexp', to: 'ownprosp', label: 'Rewards of Conformity', detail: 'When I sacrifice my individuality to support the status quo, I expect to be repaid in some way by power holders (loyal soldier).', strength: 0.80, modes: ['hierarchical'], color: '#8B5CF6' },
  { from: 'dirrecip', to: 'status', label: 'Pick and Stick', detail: 'Receiving help makes me feel higher status, because it implies that others want me to be in their debt.', strength: 0.75, modes: ['hierarchical'], color: '#EC4899' },
  { from: 'status', to: 'ownprosp', label: 'Built-in Advantage', detail: 'Due to my higher status, I can control and extract more of the group\'s output, which makes my success likely.', strength: 0.90, modes: ['hierarchical'], color: '#4F46E5' },
  { from: 'incresp', to: 'ownprosp', label: 'External Locus of Control', detail: 'When I feel respected for my competence and trustworthiness, I am more confident in my ability to achieve success.', strength: 0.88, modes: ['hierarchical'], color: '#F59E0B' }
];

export default function Pillar3DGraph({ mode, authorityLevel = 0.5, onPillarClick, onConnectionClick, selectedPillars: externalSelectedPillars, onSelectedPillarsChange, visualizationMode = '3d', compareMode = false, searchQuery = '', showFlowParticles = false }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const spheresRef = useRef({});
  const linesRef = useRef([]);
  const particlesRef = useRef(null);
  const authorityTriangleRef = useRef(null);
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [selectedPillars, setSelectedPillars] = useState(externalSelectedPillars || []);
  const [clickedPillar, setClickedPillar] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const animationFrameRef = useRef(null);
  const arrowsRef = useRef([]);
  const [strengthFilter, setStrengthFilter] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const flowParticlesRef = useRef([]);

  useEffect(() => {
    if (externalSelectedPillars) {
      setSelectedPillars(externalSelectedPillars);
    }
  }, [externalSelectedPillars]);

  const currentPillarsData = pillarsInfo[mode] || [];

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setAnimationProgress(prev => {
        const next = prev + (delta * playbackSpeed * 0.5);
        return next >= 1 ? 0 : next;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 12, 25);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    if (visualizationMode === 'network') {
      camera.position.set(0, 8, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(0, 0.5, 9);
      camera.lookAt(0, 0, 0);
    }
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const composer = new EffectComposer(renderer);
    composerRef.current = composer;
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.3, 0.88);
    composer.addPass(bloomPass);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0x8B5CF6, 1, 15);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0xEC4899, 1, 15);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    const createIconTexture = (pillarId) => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 380;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 300, 380);
      
      const pillarData = currentPillarsData.find(p => p.id === pillarId);
      const IconComponent = pillarData?.icon || Compass;
      
      let svgPath = '';
      if (IconComponent === Compass) svgPath = 'M128,32 L128,224 M32,128 L224,128 M128,48 L168,88 M128,208 L88,168 M48,128 L88,168 M208,128 L168,88';
      else if (IconComponent === Heart) svgPath = 'M128,216 C64,168 32,136 32,96 C32,64 56,40 88,40 C104,40 120,48 128,64 C136,48 152,40 168,40 C200,40 224,64 224,96 C224,136 192,168 128,216 Z';
      else if (IconComponent === BookOpen) svgPath = 'M64,48 L64,208 L128,192 L192,208 L192,48 L128,64 Z M128,64 L128,192';
      else if (IconComponent === Zap) svgPath = 'M140,32 L80,128 L120,128 L100,224 L180,128 L140,128 Z';
      else if (IconComponent === Shield) svgPath = 'M128,32 L64,64 L64,128 C64,176 88,208 128,224 C168,208 192,176 192,128 L192,64 Z';
      
      const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150);
      gradient.addColorStop(0, pillarColors[pillarId] + '40');
      gradient.addColorStop(1, pillarColors[pillarId] + '00');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 300);
      
      ctx.strokeStyle = pillarColors[pillarId];
      ctx.fillStyle = pillarColors[pillarId];
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      const path = new Path2D(svgPath);
      if (IconComponent === Heart) ctx.fill(path);
      else ctx.stroke(path);
      
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const text = pillarData?.title || pillarId;
      let fontSize = 36;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      let textWidth = ctx.measureText(text).width;
      while (textWidth > 260 && fontSize > 20) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        textWidth = ctx.measureText(text).width;
      }
      ctx.fillText(text, 150, 290);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    const positions = visualizationMode === 'network' ? networkPositions : pillarPositions;
    
    currentPillarsData.forEach((pillarData) => {
      const pillarId = pillarData.id;
      const pos = positions[pillarId];
      if (!pos) return;

      const texture = createIconTexture(pillarId);
      const geometry = new THREE.SphereGeometry(0.7, 32, 32);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.95 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(pos.x, pos.y, pos.z);
      mesh.userData = { pillarId, baseScale: 1.0 };
      scene.add(mesh);
      spheresRef.current[pillarId] = mesh;

      const glowGeometry = new THREE.SphereGeometry(0.9, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(pillarColors[pillarId]), transparent: true, opacity: 0.25 });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(mesh.position);
      scene.add(glow);
      mesh.userData.glow = glow;
    });

    connections.forEach((conn) => {
      if (!conn.modes.includes(mode)) return;
      
      const fromPillar = currentPillarsData.find(p => p.id === conn.from);
      const toPillar = currentPillarsData.find(p => p.id === conn.to);
      if (!fromPillar || !toPillar) return;

      const fromPos = positions[fromPillar.id];
      const toPos = positions[toPillar.id];
      if (!fromPos || !toPos) return;

      const start = new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z);
      const end = new THREE.Vector3(toPos.x, toPos.y, toPos.z);
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const midZ = (start.z + end.z) / 2;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dz = end.z - start.z;
      const control = new THREE.Vector3(midX - dy * 0.1, midY + dx * 0.1, midZ + dz * 0.1);
      const curve = new THREE.QuadraticBezierCurve3(start, control, end);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      
      const colors = [];
      const fromColor = new THREE.Color(pillarColors[conn.from]);
      const toColor = new THREE.Color(pillarColors[conn.to]);
      for (let i = 0; i < points.length; i++) {
        const t = i / (points.length - 1);
        const color = new THREE.Color().lerpColors(fromColor, toColor, t);
        colors.push(color.r, color.g, color.b);
      }
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      const material = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.3, linewidth: 0.7 });
      const line = new THREE.Line(geometry, material);
      line.userData = { connection: conn, isActive: true, curve, points, fromColor, toColor, baseColor: new THREE.Color(0x888888), highlightColors: { from: fromColor, to: toColor } };
      scene.add(line);
      linesRef.current.push(line);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (event) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        if (visualizationMode === '3d') {
          scene.rotation.y += deltaX * 0.005;
          scene.rotation.x += deltaY * 0.005;
          scene.rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, scene.rotation.x));
        } else {
          camera.position.x -= deltaX * 0.01;
          camera.position.y += deltaY * 0.01;
        }
        previousMousePosition = { x: event.clientX, y: event.clientY };
        mountRef.current.style.cursor = 'grabbing';
      } else {
        raycaster.setFromCamera(mouse, camera);
        const spheres = Object.values(spheresRef.current);
        const intersects = raycaster.intersectObjects(spheres);
        if (intersects.length > 0) {
          setHoveredPillar(intersects[0].object.userData.pillarId);
          mountRef.current.style.cursor = 'pointer';
        } else {
          setHoveredPillar(null);
          mountRef.current.style.cursor = 'grab';
        }
      }
    };

    const onWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();
      camera.position.z += event.deltaY * 0.005;
      camera.position.z = Math.max(5, Math.min(15, camera.position.z));
    };

    const onClick = (event) => {
      if (Math.abs(event.clientX - previousMousePosition.x) < 5 && Math.abs(event.clientY - previousMousePosition.y) < 5) {
        const rect = mountRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const spheres = Object.values(spheresRef.current);
        const intersects = raycaster.intersectObjects(spheres);
        if (intersects.length > 0) {
          const pillarId = intersects[0].object.userData.pillarId;
          if (event.ctrlKey || event.metaKey) {
            const newSelectedPillars = selectedPillars.includes(pillarId) 
              ? selectedPillars.filter(id => id !== pillarId)
              : [...selectedPillars, pillarId];
            setSelectedPillars(newSelectedPillars);
            onSelectedPillarsChange?.(newSelectedPillars);
          } else {
            setClickedPillar(pillarId);
            setSelectedPillar(pillarId);
            setSelectedPillars([]);
            onSelectedPillarsChange?.([]);
            onPillarClick?.(pillarId);
          }
        } else {
          raycaster.params.Line.threshold = 0.1;
          const lineIntersects = raycaster.intersectObjects(linesRef.current);
          if (lineIntersects.length > 0 && lineIntersects[0].object.userData.isActive) {
            onConnectionClick?.(lineIntersects[0].object.userData.connection);
          }
        }
      }
    };

    const container = mountRef.current;
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.style.cursor = 'grab';

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Safety check - ensure scene and camera still exist
      if (!sceneRef.current || !cameraRef.current || !composerRef.current) return;
      
      if (!isDragging && autoRotate && visualizationMode === '3d') scene.rotation.y += 0.0008;

      Object.entries(spheresRef.current).forEach(([pillarId, mesh]) => {
        if (!mesh || !mesh.position || !cameraRef.current) return; // Safety check
        const pulse = 1 + Math.sin(Date.now() * 0.002) * 0.05;
        mesh.scale.setScalar(hoveredPillar === pillarId ? 1.2 * pulse : pulse);
        if (mesh.userData.glow && mesh.userData.glow.position) {
          const glowPulse = 1.05 + Math.sin(Date.now() * 0.001 + pillarId.length) * 0.15;
          mesh.userData.glow.scale.setScalar(glowPulse);
        }
      });

      composerRef.current.render();
    };
    animate();

    return () => {
      // Stop animation immediately
      if (animationId) cancelAnimationFrame(animationId);

      // Clear refs to prevent further access
      sceneRef.current = null;
      cameraRef.current = null;
      composerRef.current = null;

      // Remove event listeners
      if (container) {
        container.removeEventListener('mousedown', onMouseDown);
        container.removeEventListener('mouseup', onMouseUp);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('click', onClick);
        container.removeEventListener('wheel', onWheel);
        container.style.cursor = '';
      }
      
      // Dispose Three.js objects
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
        if (obj.dispose) obj.dispose();
      });
      
      // Remove renderer from DOM and dispose
      if (mountRef.current && renderer.domElement && mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      
      // Clear object refs
      spheresRef.current = {};
      linesRef.current = [];
      particlesRef.current = null;
      authorityTriangleRef.current = null;
      arrowsRef.current = [];
      flowParticlesRef.current = [];
    };
  }, [mode, visualizationMode, hoveredPillar, autoRotate, currentPillarsData, selectedPillar, selectedPillars]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const results = connections.filter(conn => {
      const fromMatch = conn.from.toLowerCase().includes(query);
      const toMatch = conn.to.toLowerCase().includes(query);
      const labelMatch = conn.label.toLowerCase().includes(query);
      return (fromMatch || toMatch || labelMatch) && conn.modes.includes(mode);
    });
    setSearchResults(results);
  }, [searchQuery, mode]);

  useEffect(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current || !composerRef.current) return;
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current || !composerRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      composerRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}