import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextType, getGoogleClientId } from '../types/auth';
import { verifyGoogleTokenAndLogin, fetchCurrentUser, logoutCurrentUser } from '../api/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, any>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, any>) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [modalPromptReason, setModalPromptReason] = useState<string | null>(null);

  const clientId = getGoogleClientId();

  // 1. Check existing session on initial load
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        setLoading(true);
        const currentUser = await fetchCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to restore session');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Handle token returned by Google Identity Services
  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      setLoading(true);
      setError(null);

      if (!response.credential) {
        throw new Error('No credential returned by Google Identity Services.');
      }

      // Backend verification & User record creation
      const authenticatedUser = await verifyGoogleTokenAndLogin(response.credential);
      setUser(authenticatedUser);
      setIsAuthModalOpen(false);
      setModalPromptReason(null);
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Load and Initialize Google Identity Services Web Script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already present
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript && window.google?.accounts?.id) {
      if (clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };
    script.onerror = () => {
      setError('Could not load Google Identity Services library. Please check your network connection.');
    };

    document.head.appendChild(script);
  }, [clientId, handleCredentialResponse]);

  // Render official Google button inside target container element
  const renderGoogleButton = useCallback(
    (element: HTMLElement, options: Record<string, any> = {}) => {
      if (!window.google?.accounts?.id) {
        return;
      }

      const defaultOptions = {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 280,
      };

      try {
        window.google.accounts.id.renderButton(element, {
          ...defaultOptions,
          ...options,
        });
      } catch (err) {
        console.warn('GIS button render error:', err);
      }
    },
    []
  );

  const openAuthModal = useCallback((promptReason?: string) => {
    setError(null);
    if (promptReason) {
      setModalPromptReason(promptReason);
    } else {
      setModalPromptReason(null);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setModalPromptReason(null);
    setError(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await logoutCurrentUser();
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      setUser(null);
    } catch (err: any) {
      setError(err?.message || 'Error signing out.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    signOut,
    clearError,
    renderGoogleButton,
    modalPromptReason,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
