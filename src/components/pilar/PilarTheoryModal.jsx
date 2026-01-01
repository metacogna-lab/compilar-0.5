import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';

export default function PilarTheoryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Sparkles Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <SparklesCore
            id="theory-modal-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#8B5CF6"
            speed={0.4}
          />
        </div>
        
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-zinc-900/95 to-black/95 rounded-3xl border border-white/10 p-8 max-w-4xl w-full backdrop-blur-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">The PILAR Theory Framework</h2>
              <p className="text-zinc-400">Understanding Authority Impact in Leadership Modes</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Core Framework */}
          <div className="space-y-8">
            {/* Introduction */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">What is PILAR?</h3>
              <p className="text-zinc-300 leading-relaxed mb-3">
                The PILAR framework identifies five interconnected pillars of human capability that form the foundation for personal and professional growth:
              </p>
              <div className="grid grid-cols-5 gap-4 mt-4">
                {[
                  { icon: Compass, color: '#8B5CF6', label: 'Purpose' },
                  { icon: Heart, color: '#EC4899', label: 'Interpersonal' },
                  { icon: BookOpen, color: '#4F46E5', label: 'Learning' },
                  { icon: Zap, color: '#10B981', label: 'Action' },
                  { icon: Shield, color: '#F59E0B', label: 'Resilience' }
                ].map((pillar) => {
                  const Icon = pillar.icon;
                  return (
                    <div key={pillar.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5">
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: `${pillar.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: pillar.color }} />
                      </div>
                      <span className="text-xs text-zinc-300 text-center">{pillar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Leadership Modes */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Two Leadership Modes</h3>
              
              {/* Egalitarian Mode */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30">
                <h4 className="text-lg font-semibold text-indigo-300 mb-3">🤝 Egalitarian Mode</h4>
                <p className="text-zinc-300 leading-relaxed mb-3">
                  In egalitarian mode, all pillars are treated as equally important contributors to success. Leadership emphasizes:
                </p>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong className="text-white">Collaboration:</strong> Decisions emerge from dialogue and consensus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong className="text-white">Mutual Support:</strong> Each pillar strengthens the others equally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong className="text-white">Shared Leadership:</strong> Authority is distributed across the team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong className="text-white">Balanced Development:</strong> All capabilities develop in harmony</span>
                  </li>
                </ul>
              </div>

              {/* Hierarchical Mode */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
                <h4 className="text-lg font-semibold text-amber-300 mb-3">📋 Hierarchical Mode</h4>
                <p className="text-zinc-300 leading-relaxed mb-3">
                  In hierarchical mode, Purpose sits at the top as the guiding force, with clear authority structures flowing downward. This mode emphasizes:
                </p>
                <ul className="space-y-2 text-zinc-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">Clear Direction:</strong> Purpose provides the overarching "why"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">Structured Processes:</strong> Well-defined roles and responsibilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">Top-Down Flow:</strong> Authority cascades from Purpose → Action/Resilience → Learning/Interpersonal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong className="text-white">Directive Leadership:</strong> Clear commands and expectations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Authority Impact */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/40">
              <h3 className="text-xl font-semibold text-amber-300 mb-4">⚡ Understanding Authority Impact</h3>
              <p className="text-zinc-300 leading-relaxed mb-4">
                The <strong className="text-white">Authority Impact</strong> slider represents the strength and significance of hierarchical authority within your organization or scenario. It acts as a force multiplier for connections in hierarchical mode:
              </p>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-black/30">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Minimal Authority (0)</h4>
                  <p className="text-zinc-400 text-sm">Authority exists but has limited influence. Teams retain autonomy and connections remain balanced.</p>
                </div>
                
                <div className="p-4 rounded-xl bg-black/30">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Low Authority (0.25)</h4>
                  <p className="text-zinc-400 text-sm">Light guidance from leadership. Purpose influences decisions but doesn't dominate.</p>
                </div>
                
                <div className="p-4 rounded-xl bg-black/30">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Moderate Authority (0.5)</h4>
                  <p className="text-zinc-400 text-sm">Balanced leadership. Clear direction from Purpose while maintaining team input.</p>
                </div>
                
                <div className="p-4 rounded-xl bg-black/30">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">High Authority (0.75)</h4>
                  <p className="text-zinc-400 text-sm">Strong hierarchical structure. Purpose-driven decisions cascade powerfully through the organization.</p>
                </div>
                
                <div className="p-4 rounded-xl bg-black/30">
                  <h4 className="text-sm font-semibold text-amber-300 mb-2">Maximum Authority (1.0)</h4>
                  <p className="text-zinc-400 text-sm">Highly directive leadership. All pillars operate under strong top-down control and alignment.</p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  💡 <strong className="text-white">Visual Impact:</strong> As you increase authority, watch how connections in the hierarchical view become stronger and more pronounced, especially those flowing from Purpose to other pillars. The Authority Triangle above the structure pulses with increasing intensity.
                </p>
              </div>
            </div>

            {/* When to Use Each Mode */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">When to Use Each Mode</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-indigo-400 font-semibold mb-2">Use Egalitarian When:</h4>
                  <ul className="space-y-1 text-zinc-300 text-sm">
                    <li>• Innovation and creativity are priorities</li>
                    <li>• Team expertise is distributed equally</li>
                    <li>• Building consensus matters</li>
                    <li>• Flexibility and adaptation are key</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-amber-400 font-semibold mb-2">Use Hierarchical When:</h4>
                  <ul className="space-y-1 text-zinc-300 text-sm">
                    <li>• Quick decisions are critical</li>
                    <li>• Clear accountability is needed</li>
                    <li>• Scaling operations efficiently</li>
                    <li>• Crisis management is required</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Insight */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30">
              <h3 className="text-xl font-semibold text-violet-300 mb-3">🎯 Key Insight</h3>
              <p className="text-zinc-300 leading-relaxed">
                The PILAR framework isn't about choosing one mode over another—it's about understanding which mode fits your current context and being able to transition between them as circumstances change. High-performing teams develop <strong className="text-white">mode agility</strong>: the capacity to operate effectively in both egalitarian and hierarchical structures.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-xl"
            >
              Got it, thanks!
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}