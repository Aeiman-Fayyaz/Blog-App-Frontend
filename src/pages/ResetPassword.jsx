import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { 
  Lock, 
  Eye,
  EyeOff,
  Loader2, 
  AlertCircle, 
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const { data } = await API.put(`/auth/resetpassword/${token}`, { password });
      if (data.success) {
        setSuccess('Your password has been reset successfully. Redirecting you to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background dark:bg-dark-background transition-colors">
      <div className="w-full max-w-md space-y-8 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl" />

        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Security Recovery
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-text dark:text-dark-text">
            Set New Password
          </h2>
          <p className="text-sm text-mutedText dark:text-dark-mutedText">
            Please enter a strong new password for your account.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 dark:bg-secondary/5 dark:text-secondary rounded-xl border border-secondary/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-primary bg-primary/10 dark:bg-primary/5 dark:text-primary rounded-xl border border-primary/30">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-primary" />
            <p>{success}</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              
              {/* New Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted dark:text-dark-muted" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3.5 text-muted dark:text-dark-muted"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted dark:text-dark-muted" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3.5 text-muted dark:text-dark-muted"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  Updating Password...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {success && (
          <Link to="/login" className="inline-block text-xs font-bold text-brand-600 hover:underline">
            Proceed to Login immediately
          </Link>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
