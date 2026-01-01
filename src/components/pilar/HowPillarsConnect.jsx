import React from 'react';

export default function HowPillarsConnect({ mode }) {
  return (
    <div className="rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 bg-white/5 backdrop-blur-sm mb-6 md:mb-8">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-3 md:mb-4">
        How the {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Pillars Connect
      </h2>
      <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
        {mode === 'hierarchical' ? (
          <>The five HCP pillars model formal hierarchical structures. <strong className="text-white">Normative Expression</strong> (defending status quo), 
          <strong className="text-white"> Direct Reciprocity</strong> (conditional assistance), <strong className="text-white"> Status</strong> (formal power), 
          <strong className="text-white"> Own Prospects</strong> (personal goals), and <strong className="text-white"> Incoming Respect</strong> (perceived competence).</>
        ) : (
          <>The five ECP pillars model egalitarian collaboration. <strong className="text-white">Diverse Expression</strong> (psychological safety), 
          <strong className="text-white"> Indirect Reciprocity</strong> (unconditional help), <strong className="text-white"> Popularity</strong> (informal influence), 
          <strong className="text-white"> Group Prospects</strong> (collective goals), and <strong className="text-white"> Outgoing Respect</strong> (trust in others).</>
        )}
      </p>
    </div>
  );
}