import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const defaultFaqs = [
  {
    q: "What is the PILAR framework in 30 seconds?",
    a: "PILAR explains how teams operate in two modes: Egalitarian (distributed power, group focus) and Hierarchical (concentrated authority, individual focus). Teams navigate 5 pillars (Purpose, Interpersonal, Learning, Action, Resilience) using 20 psychological forces. The key is knowing when to use which mode."
  },
  {
    q: "Why do teams need both modes?",
    a: "Different situations require different approaches. Planning and innovation thrive in egalitarian mode. Crisis response and execution benefit from hierarchical mode. The best teams shift fluidly based on context."
  },
  {
    q: "What are the 20 forces?",
    a: "Each of the 5 pillars has 4 forces - 2 for egalitarian mode, 2 for hierarchical mode. These forces describe psychological dynamics like 'Group Prospects vs Own Prospects' or 'Popularity vs Status'."
  },
  {
    q: "How do I know which mode to use?",
    a: "Use egalitarian when: planning, innovating, solving complex problems, building trust. Use hierarchical when: responding to crises, executing under time pressure, coordinating at scale, enforcing safety."
  },
  {
    q: "Can a team be stuck in one mode?",
    a: "Yes, and it's problematic. Teams stuck in egalitarian mode can't make fast decisions. Teams stuck in hierarchical mode suppress innovation and psychological safety. Mission Command Agility is the solution."
  },
  {
    q: "What is Mission Command Agility?",
    a: "The ability to deliberately shift between modes based on context - and to communicate those shifts clearly to your team. It's about making mode transitions explicit and practiced."
  },
  {
    q: "How does the assessment work?",
    a: "Each pillar assessment asks reflective questions about your experiences and behaviors. Your responses are analyzed for sentiment, confidence, and alignment with the pillar's constructs. Scores help identify strengths and growth areas."
  },
  {
    q: "What do my scores mean?",
    a: "Scores represent your current capability in each pillar. 70-100 is strong, 50-69 is developing, below 50 suggests growth opportunity. Balance across pillars matters more than individual high scores."
  },
  {
    q: "Can I retake assessments?",
    a: "Absolutely! Retaking assessments helps track your progress over time. It's recommended to reassess every few months as you develop new practices and gain experience."
  },
  {
    q: "How do I apply this with my team?",
    a: "Start with awareness: identify your team's default mode. Practice deliberate mode shifts for different activities. Make transitions explicit. Use team features to collaborate on mode planning and reflection."
  }
];

export default function FAQ() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [content, setContent] = useState({ title: 'Common Questions', subtitle: 'Everything you need to know about the PILAR framework' });

  useEffect(() => {
    trackPageView('FAQ');
    
    const loadContent = async () => {
      try {
        const response = await base44.functions.invoke('contentManagement', {
          action: 'read',
          contentType: 'pages',
          slug: 'faq'
        });
        
        if (response.data.success && response.data.content) {
          setContent({
            title: response.data.content.title || 'Common Questions',
            subtitle: response.data.content.seoDescription || 'Everything you need to know about the PILAR framework'
          });
          
          // Parse markdown content into FAQ items
          if (response.data.content.content) {
            const parsed = parseFAQContent(response.data.content.content);
            if (parsed.length > 0) setFaqs(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load FAQ content:', error);
      }
    };
    
    loadContent();
  }, []);

  const parseFAQContent = (markdown) => {
    const items = [];
    const lines = markdown.split('\n');
    let currentQ = null;
    let currentA = [];
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        if (currentQ && currentA.length > 0) {
          items.push({ q: currentQ, a: currentA.join('\n').trim() });
        }
        currentQ = line.replace('## ', '').trim();
        currentA = [];
      } else if (currentQ && line.trim()) {
        currentA.push(line);
      }
    }
    
    if (currentQ && currentA.length > 0) {
      items.push({ q: currentQ, a: currentA.join('\n').trim() });
    }
    
    return items.length > 0 ? items : defaultFaqs;
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('TheoryMadeSimple')}>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Theory
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{content.title}</h1>
            <p className="text-zinc-400">{content.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isExpanded = expandedFaq === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/10 bg-white/5"
              >
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : i)}
                  className="w-full p-4 flex items-start justify-between hover:bg-white/5 transition-colors rounded-xl text-left"
                >
                  <p className="text-white font-medium pr-4">{faq.q}</p>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-white/10 pt-4">
                        <div className="text-sm text-zinc-400 leading-relaxed prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown>{faq.a}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 text-center"
        >
          <h3 className="text-white font-semibold mb-2">Still have questions?</h3>
          <p className="text-sm text-zinc-400 mb-4">Explore the interactive theory or chat with our AI guide</p>
          <div className="flex gap-3 justify-center">
            <Link to={createPageUrl('TheoryMadeSimple')}>
              <Button className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
                Explore Theory
              </Button>
            </Link>
            <Link to={createPageUrl('GlobalMap')}>
              <Button className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
                Start Assessments
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}