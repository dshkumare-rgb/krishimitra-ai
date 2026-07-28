import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface RegisterProps {
  onToggleAuth: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onToggleAuth }) => {
  const { register, loading } = useAuth();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name, role);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl green-glow">
        
        {/* Brand */}
        <div className="text-center mb-8">
          <span className="text-5xl block mb-2">🌱</span>
          <h1 className="text-3xl font-extrabold text-primary-700 dark:text-primary-400">{t('appName')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('tagline')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400 text-xs rounded-xl font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none text-sm text-gray-800 dark:text-gray-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none text-sm text-gray-800 dark:text-gray-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none text-sm text-gray-800 dark:text-gray-100 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-3 px-4 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  role === 'farmer' 
                    ? 'bg-primary-600 border-primary-650 text-white shadow-sm' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                🚜 Farmer
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`py-3 px-4 border rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  role === 'admin' 
                    ? 'bg-primary-600 border-primary-650 text-white shadow-sm' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                🔑 Admin
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/20 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : t('register')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={onToggleAuth}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            Already have an account? Login here
          </button>
        </div>

      </div>
    </div>
  );
};

export default Register;
