import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CompilarAdminLogin() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in as admin user
    base44.auth.me().then(user => {
      if (user?.role === 'admin') {
        navigate(createPageUrl('Admin'));
      }
    }).catch(() => {
      // Not authenticated, stay on login page
    });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error('Please enter a password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await base44.functions.invoke('authenticateCompilarAdmin', { password });

      if (response.data.success) {
        // Store admin session token
        localStorage.setItem('compilar_admin_session', response.data.sessionToken);
        toast.success('Login successful - Admin access granted');
        
        // Navigate to Admin dashboard
        navigate(createPageUrl('Admin'));
      } else {
        toast.error(response.data.error || 'Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-violet-400" />
              <h1 className="text-3xl font-bold text-white">Compilar</h1>
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-zinc-400" />
              <h2 className="text-xl font-semibold text-white">Admin Access</h2>
            </div>
            <p className="text-sm text-zinc-400">Enter your admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="bg-zinc-900/50 border-zinc-700 text-white placeholder-zinc-500"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(createPageUrl('Home'))}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}