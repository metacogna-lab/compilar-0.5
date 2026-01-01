import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { AlertCircle } from 'lucide-react';

export default function AdminRoute({ children }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Check for Compilar admin session first
      const compilarSession = localStorage.getItem('compilar_admin_session');
      if (compilarSession) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // Fallback to user-based admin check
      const userData = await base44.auth.me();
      if (userData && userData.role === 'admin') {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    // Redirect to compilar admin login
    navigate(createPageUrl('CompilarAdminLogin'));
    return null;
  }

  return children;
}