import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Users, Trophy, Target, Zap, Shield, ChevronRight, 
  CheckCircle, ArrowRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const handleGoogleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const handleFacebookLogin = () => {
    base44.auth.redirectToLogin();
  };

  const benefits = [
    { icon: Users, title: 'Stronger Teams', description: 'Build cohesion through shared challenges and mutual understanding' },
    { icon: Target, title: 'Clear Purpose', description: 'Align individual strengths with collective mission objectives' },
    { icon: Shield, title: 'Resilient Units', description: 'Develop mental toughness and adaptive capacity together' },
    { icon: Trophy, title: 'WIN Together', description: 'Achieve measurable outcomes through cooperative excellence' },
  ];

  const pillars = [
    { name: 'Purpose', color: 'violet', desc: 'Direction & meaning' },
    { name: 'Interpersonal', color: 'pink', desc: 'Connection & trust' },
    { name: 'Learning', color: 'indigo', desc: 'Growth & adaptation' },
    { name: 'Action', color: 'emerald', desc: 'Execution & momentum' },
    { name: 'Resilience', color: 'amber', desc: 'Recovery & strength' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 px-6 pt-12 pb-16 max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-zinc-300">Research-Backed Team Development</span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            WIN Through
            <span className="block bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Cooperation
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Transform your team's performance through an engaging, event-driven framework 
            built on proven principles of human capability development.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
        >
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            className="w-full sm:w-auto bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-xl shadow-white/10 flex items-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>
          <Button
            onClick={handleFacebookLogin}
            size="lg"
            className="w-full sm:w-auto bg-[#1877F2] hover:bg-[#166FE5] text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </Button>
        </motion.div>

        {/* The 5 Pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-center text-lg text-zinc-500 uppercase tracking-wider mb-8">
            Five Pillars of Peak Performance
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`px-6 py-4 rounded-2xl bg-gradient-to-br from-${pillar.color}-500/20 to-${pillar.color}-600/10 border border-${pillar.color}-500/30`}
              >
                <p className={`font-semibold text-${pillar.color}-400`}>{pillar.name}</p>
                <p className="text-xs text-zinc-500">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {benefits.map((benefit, i) => (
            <div
              key={benefit.title}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-sm text-zinc-400">{benefit.description}</p>
            </div>
          ))}
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Event-Driven Excellence</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto mb-12">
            Engage your team through collaborative challenges, track progress across key capability areas, 
            and celebrate wins together. Our framework transforms development into an enjoyable journey.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {[
              { step: '1', label: 'Assess', desc: 'Discover strengths' },
              { step: '2', label: 'Engage', desc: 'Complete challenges' },
              { step: '3', label: 'Grow', desc: 'Track progress' },
              { step: '4', label: 'WIN', desc: 'Achieve together' },
            ].map((item, i) => (
              <React.Fragment key={item.step}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="w-6 h-6 text-zinc-600 hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex flex-wrap justify-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Research-validated framework
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Trusted by elite teams
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Measurable outcomes
            </span>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-amber-500/10 border border-white/10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Elevate Your Team?
          </h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Join organizations worldwide using cooperative excellence to achieve peak performance.
          </p>
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            className="bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 text-white px-10 py-6 text-lg rounded-2xl"
          >
            Start Your Journey
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-zinc-600">
          <p>Built on proven principles of integrated capability development</p>
        </div>
      </div>
    </div>
  );
}