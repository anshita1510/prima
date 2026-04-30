"use client"
import React, { useEffect, useState } from 'react';
import { authService } from '@/app/services/authService';
import { formatRole } from '@/app/utils/roleFormatter';

const App: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setIsLoaded(true);
    const currentUser = authService.getStoredUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="w-full px-6 pt-6 pb-2" style={{ backgroundColor: 'var(--bg-color)' }}>
      <div className="relative w-full max-w-6xl h-[160px] md:h-[200px] overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 50%, #7c3aed 100%)', boxShadow: 'var(--shadow-md)' }}>

        {/* Subtle overlay shimmer */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 60%)' }} />

        {/* Content */}
        <div className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
          <div className="w-8 h-1 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.5)' }} />
          <h1 className="text-white font-bold tracking-tight text-2xl sm:text-3xl md:text-4xl mb-1">
            Welcome, {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-white/70 text-sm md:text-base font-medium max-w-md">
            Manage your team and operations from here.
          </p>
          {user && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', backdropFilter: 'blur(4px)' }}>
                {formatRole(user.role)}
              </span>
              <span className="text-white/50 text-xs">·</span>
              <span className="text-white/70 text-xs">{user.designation || 'Administrator'}</span>
            </div>
          )}
        </div>

        {/* Decorative dots */}
        <div className="absolute top-4 right-6 flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </div>
  );
};

export default App;