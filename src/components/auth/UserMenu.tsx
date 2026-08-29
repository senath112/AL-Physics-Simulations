import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, LogOut, FlaskConical, ChevronDown, UserCheck } from 'lucide-react';

interface UserMenuProps {
  onNavigateToLaboratory: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onNavigateToLaboratory }) => {
  const { user, isAuthenticated, loading, openAuthModal, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading && !user) {
    return (
      <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-blue-600 animate-spin" />
    );
  }

  // 1. Guest View
  if (!isAuthenticated || !user) {
    return (
      <button
        onClick={() => openAuthModal()}
        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        title="Sign in with Google"
      >
        <LogIn className="w-3.5 h-3.5 text-blue-400" />
        <span>Sign In</span>
      </button>
    );
  }

  // 2. Authenticated User View
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 bg-white/80 hover:bg-white border border-slate-200 hover:border-blue-200 rounded-full transition-all shadow-xs cursor-pointer group"
      >
        <img
          src={user.picture}
          alt={user.name}
          className="w-7 h-7 rounded-full object-cover border border-blue-200"
          onError={(e) => {
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`;
          }}
        />
        <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate hidden sm:inline">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-scale-in">
          {/* User Details */}
          <div className="px-4 py-3 border-b border-slate-100 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 truncate block">{user.name}</span>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                <UserCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            </div>
            <span className="text-[11px] text-slate-500 truncate block">{user.email}</span>
          </div>

          {/* Navigation Options */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToLaboratory();
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-blue-600" />
              <span>Laboratory Workspace</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="border-t border-slate-100 pt-1">
            <button
              onClick={async () => {
                setIsOpen(false);
                await signOut();
              }}
              className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
