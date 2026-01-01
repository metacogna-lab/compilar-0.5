import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scroll, Sparkles, Swords, Shield, Map, Compass, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PILLAR_LORE = {
  purpose: {
    realm: 'The Command Spire',
    guardian: 'The Warlord of Vision',
    element: 'Light',
    color: 'violet',
    narrative: 'You stand before the Command Spire, where ancient war flames illuminate the path of destiny. The Warlord awaits to test your clarity of mission...',
    questIntro: 'The Warlord commands: "Soldier, reveal the fire that drives your campaign..."',
    victory: 'The beacon flares! Your mission burns bright, illuminating the battlefield ahead.',
    icon: Compass,
  },
  interpersonal: {
    realm: 'The Allied Encampment',
    guardian: 'The Marshal of Bonds',
    element: 'Heart',
    color: 'pink',
    narrative: 'The Allied Encampment pulses with the brotherhood of a thousand campaigns. The Marshal tests those who seek unity with their comrades...',
    questIntro: 'The Marshal decrees: "Show me how you forge alliances in the crucible of battle..."',
    victory: 'Battle standards unite! Your bonds with your unit grow unbreakable.',
    icon: Shield,
  },
  learning: {
    realm: 'The War Academy',
    guardian: 'The Tactician of Ages',
    element: 'Mind',
    color: 'indigo',
    narrative: 'Ancient battle plans spiral into the archives. The Tactician guards strategies earned through blood and sacrifice...',
    questIntro: 'The Tactician instructs: "Intelligence wins wars, but wisdom knows when to deploy it..."',
    victory: 'Battle scrolls unfurl before you! New tactical wisdom flows into your arsenal.',
    icon: Scroll,
  },
  action: {
    realm: 'The Siege Forge',
    guardian: 'The General of Momentum',
    element: 'Fire',
    color: 'emerald',
    narrative: 'Sparks fly in the eternal forge where orders become conquests. The General respects only those who advance...',
    questIntro: 'The General bellows: "Orders are nothing without execution! Show me the might of your actions..."',
    victory: 'The forge roars! Your actions thunder across the realm with devastating force.',
    icon: Swords,
  },
  resilience: {
    realm: 'The Unbreached Fortress',
    guardian: 'The Captain of Storms',
    element: 'Stone',
    color: 'amber',
    narrative: 'Siege engines batter walls that have never fallen. The Captain tests those who would hold the line against all odds...',
    questIntro: 'The Captain orders: "The enemy assault is relentless. Show me how you endure..."',
    victory: 'The fortress holds! Your resilience is forged in the fires of siege warfare.',
    icon: Shield,
  },
};

const SCORE_NARRATIVES = {
  low: { // 0-40
    title: 'Recruit',
    message: 'Your campaign in this theatre has just begun. The trials ahead will test your mettle...',
    encouragement: 'Report for duty often, and your rank will rise.',
  },
  medium: { // 41-70
    title: 'Sergeant',
    message: 'You show tactical promise, soldier. Command recognizes your developing prowess...',
    encouragement: 'Continue your drills to unlock greater authority.',
  },
  high: { // 71-90
    title: 'Commander',
    message: 'Your battlefield prowess is formidable! Few officers achieve such distinction...',
    encouragement: 'You stand among the elite. Hone your command.',
  },
  master: { // 91-100
    title: 'Warlord',
    message: 'Legends of your campaigns will echo through military history! You have ascended...',
    encouragement: 'Lead others to victory.',
  },
};

export function getScoreNarrative(score) {
  if (score <= 40) return SCORE_NARRATIVES.low;
  if (score <= 70) return SCORE_NARRATIVES.medium;
  if (score <= 90) return SCORE_NARRATIVES.high;
  return SCORE_NARRATIVES.master;
}

export function getPillarLore(pillarId) {
  return PILLAR_LORE[pillarId] || PILLAR_LORE.purpose;
}

// RAG-enhanced narrative generation for campaigns
async function generateRAGNarrative(pillarId, phase, score, userProfile) {
  try {
    const lore = getPillarLore(pillarId);
    const scores = userProfile?.pillar_scores || {};
    
    const prompt = phase === 'victory'
      ? `Based on Ben Heslop's PILAR framework for ${pillarId}, generate a brief victory message (2 sentences) for someone who scored ${score}%. 
         Their profile: strongest pillar is ${userProfile?.strongest_pillar || 'unknown'}, growth area is ${userProfile?.weakest_pillar || 'unknown'}.
         Use military/leadership metaphors matching the "${lore.realm}" theme. Be encouraging but realistic about their level.`
      : phase === 'quest'
      ? `Based on Ben Heslop's PILAR research on ${pillarId}, create a brief quest introduction (1-2 sentences) that introduces the assessment.
         Use the voice of "${lore.guardian}" from "${lore.realm}". Focus on the key competencies: ${lore.element}.`
      : `Based on Ben Heslop's PILAR framework, create a brief narrative introduction (2 sentences) for the ${pillarId} pillar.
         Use military/leadership metaphors set in "${lore.realm}". Emphasize why this pillar matters for leadership development.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          narrative: { type: "string" },
          insight: { type: "string" }
        }
      }
    });

    return response.narrative || null;
  } catch (error) {
    console.error('RAG narrative generation failed:', error);
    return null;
  }
}

export default function AdventureNarrator({ pillarId, phase = 'intro', score = null, onComplete, userProfile = null }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isLoadingRAG, setIsLoadingRAG] = useState(false);
  const [ragNarrative, setRagNarrative] = useState(null);
  const lore = getPillarLore(pillarId);
  
  // Fetch RAG-enhanced narrative on mount
  useEffect(() => {
    let mounted = true;
    
    async function fetchRAGNarrative() {
      if (phase === 'victory' && userProfile) {
        setIsLoadingRAG(true);
        const narrative = await generateRAGNarrative(pillarId, phase, score, userProfile);
        if (mounted && narrative) {
          setRagNarrative(narrative);
        }
        setIsLoadingRAG(false);
      }
    }
    
    fetchRAGNarrative();
    return () => { mounted = false; };
  }, [pillarId, phase, score, userProfile]);
  
  const getText = () => {
    // Use RAG narrative if available, otherwise fall back to static
    if (ragNarrative) {
      return ragNarrative;
    }
    
    switch (phase) {
      case 'intro':
        return lore.narrative;
      case 'quest':
        return lore.questIntro;
      case 'victory':
        const narrative = getScoreNarrative(score || 0);
        return `${lore.victory}\n\n${narrative.message}`;
      default:
        return lore.narrative;
    }
  };

  const fullText = getText();

  useEffect(() => {
    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
        if (onComplete) setTimeout(onComplete, 500);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [fullText, phase]);

  const handleSkip = () => {
    setDisplayedText(fullText);
    setIsTyping(false);
    if (onComplete) onComplete();
  };

  const Icon = lore.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      {/* Decorative scroll border */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-${lore.color}-500/20 via-${lore.color}-600/10 to-${lore.color}-500/20 rounded-2xl blur-sm`} />
      
      <div className={`relative p-6 rounded-2xl bg-gradient-to-br from-${lore.color}-900/40 via-${lore.color}-950/60 to-stone-900/80 border border-${lore.color}-500/30 backdrop-blur-sm`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl bg-${lore.color}-500/20 border border-${lore.color}-500/30`}>
            <Icon className={`w-5 h-5 text-${lore.color}-400`} />
          </div>
          <div>
            <p className={`text-${lore.color}-400 text-xs font-medium uppercase tracking-wider`}>{lore.realm}</p>
            <p className={`text-${lore.color}-200/70 text-xs`}>{lore.guardian}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Sparkles className={`w-4 h-4 text-${lore.color}-400 animate-pulse`} />
            <span className={`text-${lore.color}-400/70 text-xs`}>{lore.element}</span>
          </div>
        </div>

        {/* Narrative text */}
        <div className="min-h-[80px] relative">
          <p className={`text-${lore.color}-100/90 leading-relaxed italic whitespace-pre-line`} style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            "{displayedText}"
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className={`inline-block w-2 h-4 bg-${lore.color}-400 ml-1`}
              />
            )}
          </p>
        </div>

        {/* Skip button */}
        {isTyping && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            onClick={handleSkip}
            className={`mt-4 text-xs text-${lore.color}-400/50 hover:text-${lore.color}-400 transition-colors`}
          >
            Skip →
          </motion.button>
        )}

        {/* RAG Loading indicator */}
        {isLoadingRAG && (
          <div className={`mt-2 flex items-center gap-2 text-${lore.color}-400/60 text-xs`}>
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Consulting PILAR research...</span>
          </div>
        )}

        {/* Score badge for victory phase */}
        {phase === 'victory' && score !== null && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${lore.color}-500/20 border border-${lore.color}-500/40`}
          >
            <span className={`text-2xl font-bold text-${lore.color}-300`}>{score}%</span>
            <span className={`text-${lore.color}-400 font-medium`}>{getScoreNarrative(score).title}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}