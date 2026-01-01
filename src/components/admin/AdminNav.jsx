import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, FileText, Users, BarChart3, Settings, Home, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminNav({ currentPage, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Admin & Docs', icon: Shield, link: 'Admin' },
    { id: 'users', label: 'Users', icon: Users, link: 'AdminUsers' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, link: 'AdminAnalytics' },
    { id: 'settings', label: 'Settings', icon: Settings, link: 'AdminSettings' }
  ];

  const handleSearch = (value) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="bg-[#0F0F12] border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-400" />
            <span className="text-white font-semibold">Admin</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link key={item.id} to={createPageUrl(item.link)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`${isActive ? 'bg-violet-500/20 text-violet-300' : 'text-zinc-400 hover:text-white'}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
        
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <Home className="w-4 h-4 mr-2" />
            Exit Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}