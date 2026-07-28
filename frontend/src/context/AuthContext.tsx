import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword as fbCreateUser, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';

export interface UserProfile {
  firebaseId: string;
  email: string;
  displayName: string;
  role: 'farmer' | 'admin';
  state: string;
  district: string;
  language: string;
  theme: string;
  phoneNumber: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, role?: 'farmer' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updatedFields: Partial<UserProfile>) => Promise<void>;
  sendOtp: (email: string) => Promise<any>;
  verifyOtp: (email: string, otp: string, displayName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user with backend database
  const syncUserProfile = async (firebaseUser: { uid: string; email: string; displayName?: string }, extraData: Partial<UserProfile> = {}) => {
    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || extraData.displayName || firebaseUser.email.split('@')[0],
          role: firebaseUser.email.toLowerCase() === 'admin@krishimitra.com' ? 'admin' : (extraData.role || 'farmer'),
          state: extraData.state || '',
          district: extraData.district || '',
          phoneNumber: extraData.phoneNumber || '',
          language: extraData.language || 'en',
          theme: extraData.theme || 'light'
        })
      });
      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      } else {
        // Fallback to local memory representation if backend route fails
        setUser({
          firebaseId: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: firebaseUser.email.toLowerCase() === 'admin@krishimitra.com' ? 'admin' : 'farmer',
          state: '',
          district: '',
          phoneNumber: '',
          language: 'en',
          theme: 'light'
        });
      }
    } catch (err) {
      console.warn('Backend sync failed, using default client profile:', err);
      setUser({
        firebaseId: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        role: firebaseUser.email.toLowerCase() === 'admin@krishimitra.com' ? 'admin' : 'farmer',
        state: '',
        district: '',
        phoneNumber: '',
        language: 'en',
        theme: 'light'
      });
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          await syncUserProfile({
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || undefined
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // --- SIMULATED MOCK AUTH LOADING ---
      const activeUserJson = localStorage.getItem('km-mock-currentUser');
      if (activeUserJson) {
        setUser(JSON.parse(activeUserJson));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const credentials = await signInWithEmailAndPassword(auth, email, pass);
        if (credentials.user) {
          await syncUserProfile({
            uid: credentials.user.uid,
            email: credentials.user.email || ''
          });
        }
      } else {
        // Mock Login
        const mockUsers = JSON.parse(localStorage.getItem('km-mock-users') || '[]');
        const existing = mockUsers.find((u: any) => u.email === email);
        
        if (existing) {
          localStorage.setItem('km-mock-currentUser', JSON.stringify(existing));
          setUser(existing);
        } else {
          // Auto create user in mock mode for simplicity and fast onboarding
          const newUser: UserProfile = {
            firebaseId: Math.random().toString(36).substring(2, 11),
            email,
            displayName: email.split('@')[0],
            role: email.toLowerCase() === 'admin@krishimitra.com' ? 'admin' : 'farmer',
            state: 'Punjab',
            district: 'Ludhiana',
            phoneNumber: '+91 98765 43210',
            language: 'en',
            theme: 'light'
          };
          mockUsers.push(newUser);
          localStorage.setItem('km-mock-users', JSON.stringify(mockUsers));
          localStorage.setItem('km-mock-currentUser', JSON.stringify(newUser));
          setUser(newUser);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, role: 'farmer' | 'admin' = 'farmer') => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const credentials = await fbCreateUser(auth, email, pass);
        if (credentials.user) {
          await syncUserProfile({
            uid: credentials.user.uid,
            email: credentials.user.email || '',
            displayName: name
          }, { role });
        }
      } else {
        // Mock Register
        const mockUsers = JSON.parse(localStorage.getItem('km-mock-users') || '[]');
        if (mockUsers.some((u: any) => u.email === email)) {
          throw new Error('User already exists in simulated database');
        }

        const newUser: UserProfile = {
          firebaseId: Math.random().toString(36).substring(2, 11),
          email,
          displayName: name,
          role: email.toLowerCase() === 'admin@krishimitra.com' ? 'admin' : role,
          state: 'Punjab',
          district: 'Ludhiana',
          phoneNumber: '',
          language: 'en',
          theme: 'light'
        };

        mockUsers.push(newUser);
        localStorage.setItem('km-mock-users', JSON.stringify(mockUsers));
        localStorage.setItem('km-mock-currentUser', JSON.stringify(newUser));
        setUser(newUser);

        // Sync with local backend
        await syncUserProfile({ uid: newUser.firebaseId, email: newUser.email, displayName: newUser.displayName }, newUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await fbSignOut(auth);
      } else {
        localStorage.removeItem('km-mock-currentUser');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseId: user.firebaseId,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          state: user.state,
          district: user.district,
          phoneNumber: user.phoneNumber,
          language: user.language,
          theme: user.theme,
          ...updatedFields
        })
      });

      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
        if (!isFirebaseConfigured) {
          localStorage.setItem('km-mock-currentUser', JSON.stringify(profile));
          // also update in mock list
          const mockUsers = JSON.parse(localStorage.getItem('km-mock-users') || '[]');
          const idx = mockUsers.findIndex((u: any) => u.firebaseId === user.firebaseId);
          if (idx !== -1) {
            mockUsers[idx] = profile;
            localStorage.setItem('km-mock-users', JSON.stringify(mockUsers));
          }
        }
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (email: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string, displayName?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, displayName })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('km-mock-currentUser', JSON.stringify(data.user));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, sendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
