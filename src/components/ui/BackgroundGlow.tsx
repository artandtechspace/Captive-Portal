'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BackgroundGlowProps {
  className?: string;
}

export const BackgroundGlow = React.memo(({ className }: BackgroundGlowProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none z-0 min-h-screen w-full",
        className
      )}
    >
      {/* Glow Blob 1: Top Left */}
      <div 
        className="absolute -top-[15%] -left-[15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/15 blur-[80px] md:blur-[120px] animate-blob-1" 
      />
      {/* Glow Blob 2: Bottom Right */}
      <div 
        className="absolute -bottom-[15%] -right-[15%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-indigo-500/10 blur-[80px] md:blur-[120px] animate-blob-2" 
      />
      {/* Glow Blob 3: Middle Right */}
      <div 
        className="absolute top-[25%] -right-[10%] w-[50vw] h-[50vw] max-w-[450px] max-h-[450px] rounded-full bg-purple-500/10 blur-[80px] md:blur-[120px] animate-blob-3" 
      />
    </div>
  );
});

BackgroundGlow.displayName = 'BackgroundGlow';
