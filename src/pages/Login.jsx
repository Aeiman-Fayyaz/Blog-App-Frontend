import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Loader2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password Recovery States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const res = await login(email, password);
      if (res.success) {
        toast.success(res.message || 'Logged in successfully!');
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } else {
        setError(res.message);
        toast.error(res.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      const message = 'An unexpected error occurred during login.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address.');
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError('');
      setForgotSuccess('');
      setResetUrl('');

      const { data } = await API.post('/auth/forgotpassword', { email: forgotEmail.trim() });
      if (data.success) {
        setForgotSuccess(data.message);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl); // Displaying reset link for testing simplicity
        }
      }
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to generate reset token.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background dark:bg-dark-background transition-colors">
      <div className="w-full max-w-md space-y-8 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        
        {/* Background glow micro-effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl" />

        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Welcome Back
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {showForgot ? 'Recover Password' : 'Sign in to BlogVerse'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {showForgot 
              ? 'Enter email to receive password reset link' 
              : "Don't have an account? "}
            {!showForgot && (
              <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-500 underline">
                Sign up free
              </Link>
            )}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 dark:bg-secondary/5 dark:text-secondary rounded-xl border border-secondary/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!showForgot ? (
          /* Normal Sign In Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              
              {/* Email */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-accent" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-semibold text-primary hover:text-secondary"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-accent" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3.5 text-accent dark:text-dark"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Forgot Password form */
          <form onSubmit={handleForgotPassword} className="space-y-6">
            
            {forgotError && (
              <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 dark:bg-secondary/5 dark:text-secondary rounded-xl border border-secondary/30">
                <AlertCircle className="w-4 h-4" />
                <p>{forgotError}</p>
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 text-sm text-primary bg-primary/10 dark:bg-primary/5 dark:text-primary rounded-xl border border-primary/30 space-y-2">
                <p>{forgotSuccess}</p>
                {resetUrl && (
                  <div className="pt-2 border-t border-primary/20">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Sandbox Reset Link:</p>
                    <a href={resetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary dark:text-primary font-semibold underline block break-all mt-1">
                      {resetUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter registered email..."
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text  text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-accent" />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="w-1/3 py-2.5 rounded-xl border border-border dark:border-dark-border hover:bg-surface dark:hover:bg-dark-surface text-xs font-bold text-text dark:text-dark-text transition-colors"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={forgotLoading}
                className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Request Reset Link'
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default Login;
