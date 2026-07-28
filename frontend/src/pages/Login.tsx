import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiMail, FiShield, FiUser, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

interface LoginProps {
  onToggleAuth: () => void;
}

export const Login: React.FC<LoginProps> = ({ onToggleAuth }) => {
  const { sendOtp, verifyOtp, login, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // Navigation states
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mailLink, setMailLink] = useState('');
  
  // Timer for resending OTP
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setMailLink('');

    try {
      const data = await sendOtp(email);
      setStep('otp');
      setResendTimer(30); // 30 seconds wait
      setSuccessMessage('A 6-digit OTP verification code has been dispatched.');
      if (data.mailViewerUrl) {
        setMailLink(data.mailViewerUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await verifyOtp(email, otp, displayName || undefined);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccessMessage('');
    try {
      const data = await sendOtp(email);
      setResendTimer(30);
      setSuccessMessage('OTP code has been resent.');
      if (data.mailViewerUrl) {
        setMailLink(data.mailViewerUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    }
  };

  // Quick bypass logins for local testing
  const handleQuickLogin = async (role: 'farmer' | 'admin') => {
    setError('');
    const targetEmail = role === 'admin' ? 'admin@krishimitra.com' : 'farmer@krishimitra.com';
    try {
      await login(targetEmail, 'password123');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl green-glow">
        
        {/* Brand Header */}
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

        {successMessage && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400 text-xs rounded-xl font-medium">
            ✅ {successMessage}
          </div>
        )}

        {/* Dynamic Ethereal link link box */}
        {mailLink && (
          <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-400 text-xs rounded-xl font-semibold leading-relaxed">
            📨 <strong>[Ethereal Sandbox Mailbox]</strong>
            <br />
            No setup required! View the sent email here:
            <a 
              href={mailLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block mt-1 text-primary-600 dark:text-primary-400 underline break-all"
            >
              Open Ethereal Mail Inbox ➜
            </a>
          </div>
        )}

        {step === 'email' ? (
          /* STEP 1: ENTER EMAIL FORM */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FiMail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. farmer@krishimitra.com"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none text-sm text-gray-800 dark:text-gray-100 transition"
              />
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? 'Sending...' : 'Get Verification Code'}
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP FORM */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            
            <button 
              type="button"
              onClick={() => setStep('email')}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2 font-semibold transition"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Back to Email
            </button>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FiShield className="w-3.5 h-3.5" /> Enter 6-Digit OTP Code
              </label>
              <input 
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none text-center text-lg font-black tracking-widest text-gray-800 dark:text-gray-100 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <FiUser className="w-3.5 h-3.5" /> Name (Optional for first sign in)
              </label>
              <input 
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-xl focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 focus:border-transparent outline-none text-sm text-gray-800 dark:text-gray-100 transition"
              />
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/20 transition disabled:opacity-50"
            >
              {authLoading ? 'Verifying OTP...' : 'Verify Code & Sign In'}
            </button>

            {/* Resend OTP details */}
            <div className="text-center pt-2">
              {resendTimer > 0 ? (
                <span className="text-xs text-gray-400 font-semibold">
                  Resend code in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1.5 mx-auto"
                >
                  <FiRefreshCw className="w-3.5 h-3.5" /> Resend Verification Code
                </button>
              )}
            </div>
          </form>
        )}

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-800"></div></div>
          <span className="relative bg-white dark:bg-gray-900 px-3 text-xs text-gray-450 font-semibold uppercase tracking-wider">Quick Testing Demo</span>
        </div>

        {/* Testing Quick Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => handleQuickLogin('farmer')}
            className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900 rounded-xl text-xs font-bold transition"
          >
            🚜 Farmer Mode
          </button>
          <button 
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900 rounded-xl text-xs font-bold transition"
          >
            🔑 Admin Mode
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
