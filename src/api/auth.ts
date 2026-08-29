import { User, getGoogleClientId } from '../types/auth';

/**
 * Helper to generate internal user ID for new users (usr_...)
 */
function generateInternalId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'usr_';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Verify Google ID token and establish authenticated session
 */
export async function verifyGoogleTokenAndLogin(idToken: string): Promise<User> {
  try {
    // 1. Attempt primary backend serverless function call
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include HttpOnly cookies
      body: JSON.stringify({ idToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        return data.user;
      }
    }
  } catch (_e) {
    // Backend endpoint unavailable (e.g., local standalone Vite server)
  }

  // 2. Direct cryptographic token verification against Google's official OAuth Tokeninfo API
  // (Provides verification in local dev environments without exposing secrets)
  const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const verifyRes = await fetch(googleVerifyUrl);

  if (!verifyRes.ok) {
    throw new Error('Google ID token verification failed or token has expired.');
  }

  const payload = await verifyRes.json();

  // Validate issuer and audience
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error('Invalid token issuer.');
  }

  const expectedClientId = getGoogleClientId();
  if (expectedClientId && payload.aud !== expectedClientId) {
    throw new Error('Token audience does not match configured Google Client ID.');
  }

  const googleSub = payload.sub;
  const email = payload.email || '';
  const name = payload.name || 'Physics Student';
  const picture = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

  // Retrieve existing internal ID or create new one
  const usersStoreKey = 'physics_users_directory';
  const existingUsers: Record<string, User> = JSON.parse(localStorage.getItem(usersStoreKey) || '{}');
  
  let user = existingUsers[googleSub];
  const now = new Date().toISOString();

  if (user) {
    user.name = name;
    user.picture = picture;
    user.lastLoginAt = now;
  } else {
    user = {
      id: generateInternalId(),
      google_sub: googleSub,
      email,
      name,
      picture,
      createdAt: now,
      lastLoginAt: now,
      savedPracticalsCount: 0,
    };
  }

  existingUsers[googleSub] = user;
  localStorage.setItem(usersStoreKey, JSON.stringify(existingUsers));
  sessionStorage.setItem('physics_active_user_id', user.id);

  return user;
}

/**
 * Fetch current authenticated user session
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.authenticated && data.user) {
        return data.user;
      }
    }
  } catch (_e) {
    // Fall through to dev session
  }

  // Check active dev session
  const activeUserId = sessionStorage.getItem('physics_active_user_id');
  if (activeUserId) {
    const usersStoreKey = 'physics_users_directory';
    const existingUsers: Record<string, User> = JSON.parse(localStorage.getItem(usersStoreKey) || '{}');
    const user = Object.values(existingUsers).find(u => u.id === activeUserId);
    if (user) return user;
  }

  return null;
}

/**
 * Terminate authenticated session
 */
export async function logoutCurrentUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (_e) {
    // Ignore network errors on logout
  }

  sessionStorage.removeItem('physics_active_user_id');
}
