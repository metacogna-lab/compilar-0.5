import React from 'react';
import { ExternalLink, Box, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IntegrationPanel({ team, teamId }) {
  const integrations = [
    {
      name: 'Miro',
      description: 'Collaborative whiteboarding for visual mode planning',
      icon: '🎨',
      connected: !!team.integrations?.miro_board_id,
      action: 'Connect Miro'
    },
    {
      name: 'Asana',
      description: 'Project management and task tracking',
      icon: '✓',
      connected: !!team.integrations?.asana_project_id,
      action: 'Connect Asana'
    },
    {
      name: 'GitHub',
      description: 'Code repository integration',
      icon: '⚡',
      connected: !!team.integrations?.github_repo,
      action: 'Connect GitHub'
    }
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4">Team Integrations</h3>
      <p className="text-zinc-400 mb-6">
        Connect your team's tools to enhance collaboration and workflow
      </p>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.name}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                  {integration.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">{integration.name}</h4>
                  <p className="text-sm text-zinc-400">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <Button size="sm" variant="outline" className="border-white/20 text-white">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
                    {integration.action}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-medium mb-1">OAuth Setup Required</h4>
            <p className="text-sm text-zinc-400">
              Integration features require OAuth authorization. Contact your team owner to enable these connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}