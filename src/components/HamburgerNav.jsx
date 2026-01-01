import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const navigationItems = [
  { label: 'Home', page: 'Home' },
  { label: 'About', page: 'About' },
  { label: 'What is Compilar', page: 'WhatIsCompilar' },
  { label: 'Compilar', page: 'PilarInfo' },
  { label: 'Definitions', page: 'PilarDefinitions' },
];

export default function HamburgerNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-zinc-400 hover:text-white hover:bg-white/10 scale-[1.2]"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[268px] bg-zinc-900/95 backdrop-blur-xl border-white/10">
        {navigationItems.map((item) => (
          <DropdownMenuItem key={item.page} asChild>
            <Link 
              to={createPageUrl(item.page)}
              className="cursor-pointer text-zinc-300 hover:text-white focus:text-white"
            >
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}