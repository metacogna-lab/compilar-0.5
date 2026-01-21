
import React from 'react';
import { DottedSurface } from '@/components/ui/dotted-surface';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PillarAIInsights from '@/components/pilar/PillarAIInsights';
import { usePageStore } from '@/components/stores/usePageStore';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import KineticOutlet from '@/components/layout/KineticOutlet';

export default function Layout({ children, currentPageName }) {
  const { isAIInsightsOpen, toggleAIInsights } = usePageStore();
  const defaultMode = 'egalitarian';
  const defaultPillarData = pillarsInfo[defaultMode];

  return (
    <div className="min-h-screen bg-[#0F0F12] relative" style={{
      boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.6), inset 0 0 60px rgba(108, 75, 244, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
    }}>
      <DottedSurface className="opacity-40" />
      <Header />
      <style>{`
        :root {
          --color-primary: #6C4BF4;
          --color-secondary: #3FD0C9;
          --color-surface-dark: #0F0F12;
          --color-surface-light: #F6F7FB;
          --color-text-primary: #FFFFFF;
          --color-text-secondary: #A1A1AA;
          --color-pillar-purpose: #8B5CF6;
          --color-pillar-interpersonal: #EC4899;
          --color-pillar-learning: #4F46E5;
          --color-pillar-action: #10B981;
          --color-pillar-resilience: #F59E0B;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--color-surface-dark);
          color: var(--color-text-primary);
        }

        h1, h2, h3, h4, h5, h6, .font-bold, .font-semibold, .font-medium {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: inherit;
        }

        .font-serif, .narrative-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-style: italic;
        }

        p, span, div, button, input, textarea, label {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        ::selection {
          background-color: rgba(108, 75, 244, 0.3);
          color: white;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <div className="flex-1 pt-24">
        <KineticOutlet>
          {children}
        </KineticOutlet>
      </div>
      <Footer />
      {isAIInsightsOpen && (
        <PillarAIInsights
          selectedPillars={defaultPillarData}
          mode={defaultMode}
          connections={[]}
          allForces={[]}
          forceConnections={[]}
          onClose={toggleAIInsights}
        />
      )}
    </div>
  );
}
