import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { base44 } from '@/api/base44Client';
import { 
  X, Send, ZoomIn, ZoomOut, RotateCcw, MessageSquare, 
  Compass, Heart, BookOpen, Zap, Shield, Sparkles, Loader2,
  MousePointer, Move, Info, TrendingUp, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PILLAR_CONFIG = {
  purpose: { 
    color: 0x8B5CF6, 
    label: 'Purpose', 
    icon: Compass,
    description: 'Your sense of direction, values alignment, and ability to extract meaning from experiences.',
    subdomains: ['Sense of Direction', 'Values Alignment', 'Meaning Extraction']
  },
  interpersonal: { 
    color: 0xEC4899, 
    label: 'Interpersonal', 
    icon: Heart,
    description: 'Your capacity for empathy, communication effectiveness, and conflict resolution skills.',
    subdomains: ['Empathy', 'Communication', 'Conflict Resolution']
  },
  learning: { 
    color: 0x6366F1, 
    label: 'Learning', 
    icon: BookOpen,
    description: 'Your curiosity, skill acquisition rate, and reflective practice capabilities.',
    subdomains: ['Curiosity', 'Skill Acquisition', 'Reflection']
  },
  action: { 
    color: 0x10B981, 
    label: 'Action', 
    icon: Zap,
    description: 'Your discipline, momentum building, and execution effectiveness.',
    subdomains: ['Discipline', 'Momentum', 'Execution']
  },
  resilience: { 
    color: 0xF59E0B, 
    label: 'Resilience', 
    icon: Shield,
    description: 'Your stress response, emotional regulation, and recovery capabilities.',
    subdomains: ['Stress Response', 'Emotional Regulation', 'Recovery']
  },
};

const CONNECTIONS = [
  ['purpose', 'action'],
  ['purpose', 'learning'],
  ['interpersonal', 'resilience'],
  ['interpersonal', 'learning'],
  ['learning', 'action'],
  ['action', 'resilience'],
  ['resilience', 'purpose'],
];

export default function ForceGraph3D({ isOpen, onClose, userProfile, assessments = [] }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const nodesRef = useRef({});
  const animationRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Welcome to your Leadership Profile Analysis. I can help you understand your pillar strengths, identify growth opportunities, and recommend focus areas. Click on any pillar node to view detailed insights.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [focusedPillar, setFocusedPillar] = useState(null);
  const [selectedPillarInfo, setSelectedPillarInfo] = useState(null);
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [autoRotate, setAutoRotate] = useState(true);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const labelsRef = useRef({});

  const scores = userProfile?.pillar_scores || {};

  const initScene = useCallback(() => {
    if (!containerRef.current || sceneRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0F0F12);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 8;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Point light
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create nodes (pillars)
    const pillars = Object.keys(PILLAR_CONFIG);
    const angleStep = (2 * Math.PI) / pillars.length;

    pillars.forEach((pillar, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const radius = 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      const score = scores[pillar] || 0;
      const size = 0.3 + (score / 100) * 0.5;

      // Main sphere
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshPhongMaterial({
        color: PILLAR_CONFIG[pillar].color,
        emissive: PILLAR_CONFIG[pillar].color,
        emissiveIntensity: 0.3,
        shininess: 100,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(x, y, 0);
      sphere.userData = { pillar, score };
      scene.add(sphere);

      // Glow ring
      const ringGeometry = new THREE.RingGeometry(size + 0.1, size + 0.2, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: PILLAR_CONFIG[pillar].color,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.position.set(x, y, 0);
      scene.add(ring);

      nodesRef.current[pillar] = { sphere, ring, basePosition: { x, y, z: 0 } };

      // Create HTML label element for each pillar
      labelsRef.current[pillar] = { x, y, label: PILLAR_CONFIG[pillar].label };
    });

    // Create connections with strength-based physics visualization
    CONNECTIONS.forEach(([from, to]) => {
      const fromNode = nodesRef.current[from];
      const toNode = nodesRef.current[to];
      if (fromNode && toNode) {
        const fromScore = scores[from] || 0;
        const toScore = scores[to] || 0;
        const connectionStrength = (fromScore + toScore) / 200; // 0-1 based on combined scores
        
        const points = [
          new THREE.Vector3(fromNode.basePosition.x, fromNode.basePosition.y, 0),
          new THREE.Vector3(toNode.basePosition.x, toNode.basePosition.y, 0),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Stronger connections = more visible, colored lines
        const lineColor = connectionStrength > 0.6 ? 0x8B5CF6 : connectionStrength > 0.3 ? 0x6366F1 : 0x4B5563;
        const lineOpacity = 0.2 + connectionStrength * 0.6;
        const lineWidth = connectionStrength > 0.5 ? 2 : 1;
        
        const lineMaterial = new THREE.LineBasicMaterial({
          color: lineColor,
          transparent: true,
          opacity: lineOpacity,
          linewidth: lineWidth,
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = { from, to, strength: connectionStrength };
        scene.add(line);
      }
    });

    // Center node
    const centerGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x6C4BF4,
      emissive: 0x6C4BF4,
      emissiveIntensity: 0.5,
    });
    const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
    scene.add(centerSphere);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      // Gentle rotation
      Object.values(nodesRef.current).forEach(node => {
        node.ring.rotation.z += 0.005;
        // Pulse effect for focused pillar
        if (node.sphere.userData.pillar === focusedPillar) {
          const pulseScale = 1 + Math.sin(Date.now() * 0.005) * 0.15;
          node.sphere.scale.set(pulseScale, pulseScale, pulseScale);
        }
      });

      // Auto rotate scene gently
      if (autoRotate && !isDragging.current) {
        scene.rotation.y += 0.002;
      }

      // Pulse center
      const scale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
      centerSphere.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };
    animate();

    // Mouse interaction
    const onMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      // Handle hover detection
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const spheres = Object.values(nodesRef.current).map(n => n.sphere);
      const intersects = raycasterRef.current.intersectObjects(spheres);

      if (intersects.length > 0) {
        const hoveredPillarId = intersects[0].object.userData.pillar;
        setHoveredPillar(hoveredPillarId);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredPillar(null);
        renderer.domElement.style.cursor = isDragging.current ? 'grabbing' : 'grab';
      }

      // Handle dragging
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      scene.rotation.y += deltaX * 0.005;
      scene.rotation.x += deltaY * 0.005;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e) => {
      if (!isDragging.current) return;
      const dragDistance = Math.abs(e.clientX - previousMousePosition.current.x) + Math.abs(e.clientY - previousMousePosition.current.y);
      isDragging.current = false;
      
      // Only trigger click if minimal drag
      if (dragDistance < 5) {
        handleNodeClick(e);
      }
    };

    const handleNodeClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const spheres = Object.values(nodesRef.current).map(n => n.sphere);
      const intersects = raycasterRef.current.intersectObjects(spheres);

      if (intersects.length > 0) {
        const clickedPillar = intersects[0].object.userData.pillar;
        setFocusedPillar(clickedPillar);
        setSelectedPillarInfo(clickedPillar);
        setAutoRotate(false);
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const newZoom = camera.position.z + (e.deltaY * 0.01);
      camera.position.z = Math.max(3, Math.min(15, newZoom));
      setZoomLevel(camera.position.z);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', () => { isDragging.current = false; });
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Cleanup stored
    renderer.domElement._cleanup = () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mouseleave', () => { isDragging.current = false; });
      renderer.domElement.removeEventListener('wheel', onWheel);
    };
  }, [scores, focusedPillar, autoRotate]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(initScene, 100);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.domElement._cleanup?.();
        rendererRef.current.dispose();
        if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      sceneRef.current = null;
      rendererRef.current = null;
      nodesRef.current = {};
    };
  }, [isOpen, initScene]);

  const handleZoom = (direction) => {
    if (cameraRef.current) {
      const newZoom = cameraRef.current.position.z + direction * 1.5;
      cameraRef.current.position.z = Math.max(3, Math.min(15, newZoom));
      setZoomLevel(cameraRef.current.position.z);
    }
  };

  const handleReset = () => {
    if (cameraRef.current && sceneRef.current) {
      cameraRef.current.position.z = 8;
      sceneRef.current.rotation.x = 0;
      sceneRef.current.rotation.y = 0;
      setZoomLevel(8);
    }
    setFocusedPillar(null);
    setSelectedPillarInfo(null);
    setAutoRotate(true);
  };

  const focusOnPillar = (pillar) => {
    setFocusedPillar(pillar);
    setSelectedPillarInfo(pillar);
    setAutoRotate(false);
    if (cameraRef.current && sceneRef.current) {
      cameraRef.current.position.z = 5;
      setZoomLevel(5);
    }
  };

  const getScoreLevel = (score) => {
    if (!score) return { label: 'Not Assessed', color: 'zinc' };
    if (score >= 80) return { label: 'Excellent', color: 'emerald' };
    if (score >= 60) return { label: 'Proficient', color: 'blue' };
    if (score >= 40) return { label: 'Developing', color: 'amber' };
    return { label: 'Foundational', color: 'red' };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAnalyzing) return;

    const userMessage = inputValue.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      // Build comprehensive profile context including PILAR research
      const profileContext = `
=== USER PROFILE ANALYSIS ===
Pillar Scores:
- Purpose: ${scores.purpose || 'Not assessed'}%
- Interpersonal: ${scores.interpersonal || 'Not assessed'}%
- Learning: ${scores.learning || 'Not assessed'}%
- Action: ${scores.action || 'Not assessed'}%
- Resilience: ${scores.resilience || 'Not assessed'}%

Profile Insights:
- Strongest Pillar: ${userProfile?.strongest_pillar || 'Unknown'}
- Area for Development: ${userProfile?.weakest_pillar || 'Unknown'}
- Journey Stage: ${userProfile?.journey_stage || 'newcomer'}
- Total Assessments: ${assessments.length}
- Confidence Score: ${userProfile?.confidence_score || 'Unknown'}%

=== BEN HESLOP'S PILAR FRAMEWORK ===
The PILAR framework identifies five interconnected leadership dimensions:

PURPOSE (${scores.purpose || 0}%): Sense of direction, values alignment, meaning extraction
- Connects strongly to ACTION (execution of purpose) and LEARNING (continuous growth toward goals)
- Low scores suggest need for vision clarification and values exploration
- High scores indicate clear direction that can anchor other pillars

INTERPERSONAL (${scores.interpersonal || 0}%): Empathy, communication, conflict resolution
- Connects to RESILIENCE (emotional support networks) and LEARNING (social learning)
- Foundation for team cohesion and collaborative growth
- Affects how purpose is communicated and action is coordinated

LEARNING (${scores.learning || 0}%): Curiosity, skill acquisition, reflection
- Central hub connecting all pillars through growth mindset
- Accelerates development in weaker areas
- Combines with ACTION for deliberate practice

ACTION (${scores.action || 0}%): Discipline, momentum, execution
- Transforms purpose into results
- Requires RESILIENCE for sustained effort
- Benefits from LEARNING for optimization

RESILIENCE (${scores.resilience || 0}%): Stress response, emotional regulation, recovery
- Sustains all other pillars under pressure
- Connected to PURPOSE for meaning-based coping
- Supports INTERPERSONAL through emotional stability

=== RECOMMENDED FLOW ===
Based on scores, suggested development path:
${Object.entries(scores).filter(([,s]) => s > 0).sort(([,a], [,b]) => a - b).map(([p, s], i) => `${i + 1}. ${p} (${s}%) - ${s < 50 ? 'Priority focus' : s < 70 ? 'Building' : 'Strength to leverage'}`).join('\n') || 'Complete assessments to get personalized path'}
      `;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a concise leadership coach using PILAR framework. Be direct and actionable.

${profileContext}

User: "${userMessage}"

RESPOND IN 2-3 SENTENCES MAX. Include:
1. Direct answer to their question
2. One specific next action they can take
3. Which pillar to explore next (and why in 5 words or less)

Be encouraging but brief. No filler words.`,
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            suggested_focus: { type: "string", enum: ["purpose", "interpersonal", "learning", "action", "resilience", "none"] },
            next_action: { type: "string" },
            go_to_page: { type: "string", enum: ["Pillar", "LearningPathways", "Groups", "Profile", "GamificationHub", "none"] }
          }
        }
      });

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.response,
        next_action: response.next_action,
        go_to_page: response.go_to_page,
        suggested_focus: response.suggested_focus
      }]);

      if (response.suggested_focus && response.suggested_focus !== 'none') {
        focusOnPillar(response.suggested_focus);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.' 
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
      >
        <div className="h-full flex flex-col lg:flex-row">
          {/* 3D Graph Panel */}
          <div className="flex-1 relative">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Interactive Profile Graph
                </h2>
                <p className="text-sm text-zinc-400">Drag to rotate • Scroll to zoom</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* 3D Container */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Pillar Labels Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {Object.entries(labelsRef.current).map(([pillar, pos]) => {
                const config = PILLAR_CONFIG[pillar];
                const score = scores[pillar];
                const isHovered = hoveredPillar === pillar;
                const isFocused = focusedPillar === pillar;
                
                // Calculate screen position (approximate for pentagon layout)
                const pillars = Object.keys(PILLAR_CONFIG);
                const index = pillars.indexOf(pillar);
                const angleStep = (2 * Math.PI) / pillars.length;
                const angle = index * angleStep - Math.PI / 2;
                const radius = 32; // percentage from center
                const screenX = 50 + Math.cos(angle) * radius;
                const screenY = 50 + Math.sin(angle) * radius;
                
                return (
                  <div
                    key={pillar}
                    className="absolute transform -translate-x-1/2 transition-all duration-200"
                    style={{ 
                      left: `${screenX}%`, 
                      top: `${screenY}%`,
                      zIndex: isHovered || isFocused ? 20 : 10
                    }}
                  >
                    {/* Label - always visible */}
                    <div className={cn(
                      "text-center transition-all duration-200",
                      isHovered || isFocused ? "opacity-100 scale-110" : "opacity-70 scale-100"
                    )}>
                      <span 
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ 
                          color: `#${config.color.toString(16).padStart(6, '0')}`,
                          backgroundColor: isHovered || isFocused ? `#${config.color.toString(16).padStart(6, '0')}20` : 'transparent',
                          fontFamily: 'Inter, sans-serif'
                        }}
                      >
                        {config.label}
                      </span>
                    </div>

                    {/* Hover tooltip - user profile info */}
                    <AnimatePresence>
                      {isHovered && !selectedPillarInfo && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-black/90 backdrop-blur-sm rounded-xl border border-white/20 p-3 shadow-xl"
                          style={{ borderColor: `#${config.color.toString(16).padStart(6, '0')}40` }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {React.createElement(config.icon, { 
                              className: "w-4 h-4",
                              style: { color: `#${config.color.toString(16).padStart(6, '0')}` }
                            })}
                            <span className="text-sm font-medium text-white">{config.label}</span>
                          </div>
                          
                          {/* Score */}
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-zinc-400">Score</span>
                              <span className="font-bold text-white">{score || '—'}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${score || 0}%`,
                                  backgroundColor: `#${config.color.toString(16).padStart(6, '0')}`
                                }}
                              />
                            </div>
                          </div>

                          {/* Status */}
                          <div className="text-xs text-zinc-400">
                            {score >= 70 ? (
                              <span className="text-emerald-400">✓ Strength</span>
                            ) : score >= 50 ? (
                              <span className="text-blue-400">◉ Developing</span>
                            ) : score > 0 ? (
                              <span className="text-amber-400">○ Growth area</span>
                            ) : (
                              <span className="text-zinc-500">Not assessed</span>
                            )}
                          </div>

                          {/* Subdomains preview */}
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Focus Areas</p>
                            <div className="flex flex-wrap gap-1">
                              {config.subdomains.slice(0, 2).map((sub, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </div>

                          <p className="text-[10px] text-zinc-500 mt-2 text-center">Click to view details</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom(-1)}
                  className="border-white/20 bg-black/50 text-zinc-300 hover:bg-white/10 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleZoom(1)}
                  className="border-white/20 bg-black/50 text-zinc-300 hover:bg-white/10 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="border-white/20 bg-black/50 text-zinc-300 hover:bg-white/10 hover:text-white"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={cn(
                    "border-white/20 bg-black/50 text-zinc-300 hover:bg-white/10 hover:text-white",
                    autoRotate && "bg-violet-500/30 border-violet-500/50 text-violet-300"
                  )}
                  title="Toggle Auto-Rotate"
                >
                  <Move className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
                <p className="text-xs text-zinc-400 flex items-center gap-2">
                  <MousePointer className="w-3 h-3" />
                  Click pillar to view details • Drag to rotate • Scroll to zoom
                </p>
              </div>
            </div>

            {/* Selected Pillar Info Panel */}
            <AnimatePresence>
              {selectedPillarInfo && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-20 left-4 w-72 bg-black/80 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                >
                  {(() => {
                    const config = PILLAR_CONFIG[selectedPillarInfo];
                    const score = scores[selectedPillarInfo];
                    const level = getScoreLevel(score);
                    const Icon = config.icon;
                    
                    return (
                      <>
                        <div className="p-4 border-b border-white/10" style={{ backgroundColor: `#${config.color.toString(16).padStart(6, '0')}20` }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="w-5 h-5" style={{ color: `#${config.color.toString(16).padStart(6, '0')}` }} />
                              <h3 className="font-semibold text-white">{config.label}</h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedPillarInfo(null); setFocusedPillar(null); setAutoRotate(true); }}
                              className="h-6 w-6 text-zinc-400 hover:text-white"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Score */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-zinc-400">Current Score</span>
                              <span className={`text-sm font-medium text-${level.color}-400`}>{level.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={score || 0} className="flex-1 h-2" />
                              <span className="text-lg font-bold text-white">{score || '—'}%</span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-zinc-400 leading-relaxed">{config.description}</p>

                          {/* Subdomains */}
                          <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Competency Areas</p>
                            <div className="space-y-1">
                              {config.subdomains.map((sub, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `#${config.color.toString(16).padStart(6, '0')}` }} />
                                  <span className="text-zinc-300">{sub}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Insights */}
                          {score && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-zinc-400 uppercase tracking-wider">Recommendation</span>
                              </div>
                              <p className="text-sm text-zinc-300">
                                {score >= 70 
                                  ? 'Continue reinforcing this strength through advanced practice.'
                                  : score >= 50
                                  ? 'Focus on deliberate practice to elevate this competency.'
                                  : 'Prioritize foundational development in this area.'}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pillar Legend */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-wider">Pillars</p>
              <div className="space-y-1">
                {Object.entries(PILLAR_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const score = scores[key];
                  return (
                    <button
                      key={key}
                      onClick={() => focusOnPillar(key)}
                      className={cn(
                        "flex items-center gap-2 w-full p-1.5 rounded-lg transition-all text-left",
                        focusedPillar === key ? "bg-white/20" : "hover:bg-white/10"
                      )}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `#${config.color.toString(16).padStart(6, '0')}` }} 
                      />
                      <span className="text-xs text-white flex-1">{config.label}</span>
                      <span className="text-xs text-zinc-400">{score || '—'}%</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="w-full lg:w-96 bg-[#0F0F12] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-[40vh] lg:h-full">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                <MessageSquare className="w-4 h-4 text-violet-400" />
                Profile Analysis Assistant
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Ask questions about your leadership profile</p>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-3 rounded-xl text-sm",
                      msg.role === 'user'
                        ? "bg-violet-500/20 text-violet-100 ml-8"
                        : "bg-white/5 text-zinc-300 mr-8"
                    )}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {msg.content}
                    {/* Action buttons for navigation */}
                    {msg.role === 'assistant' && (msg.next_action || msg.go_to_page || msg.suggested_focus) && (
                      <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                        {msg.suggested_focus && msg.suggested_focus !== 'none' && (
                          <Link to={createPageUrl(`Pillar?pillar=${msg.suggested_focus}`)}>
                            <button className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 flex items-center gap-1.5 transition-colors">
                              <Target className="w-3 h-3" />
                              {PILLAR_CONFIG[msg.suggested_focus]?.label || msg.suggested_focus}
                            </button>
                          </Link>
                        )}
                        {msg.go_to_page && msg.go_to_page !== 'none' && msg.go_to_page !== 'Pillar' && (
                          <Link to={createPageUrl(msg.go_to_page)}>
                            <button className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1.5 transition-colors">
                              <TrendingUp className="w-3 h-3" />
                              Go to {msg.go_to_page.replace(/([A-Z])/g, ' $1').trim()}
                            </button>
                          </Link>
                        )}
                        {msg.next_action && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {msg.next_action}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your profile..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isAnalyzing}
                  className="bg-violet-500 hover:bg-violet-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {['What should I focus on?', 'Analyze my strengths', 'Growth opportunities'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInputValue(q)}
                    className="text-xs px-2 py-1 rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}