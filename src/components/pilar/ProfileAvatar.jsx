import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Reusable Profile Avatar component showing user initials
 * Links to UserPilarProfile page
 */
export default function ProfileAvatar({ 
  user, 
  size = 'md', 
  showLink = true, 
  className = '',
  onClick = null 
}) {
  const initials = user?.full_name 
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  const avatar = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center font-bold text-white cursor-pointer shadow-lg shadow-violet-500/20 border-2 border-white/20",
        sizeClasses[size],
        className
      )}
      onClick={onClick}
    >
      {initials}
    </motion.div>
  );

  if (showLink && !onClick) {
    return (
      <Link to={createPageUrl('UserPilarProfile')} title="View Profile">
        {avatar}
      </Link>
    );
  }

  return avatar;
}