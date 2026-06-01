import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Loader2, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile photo must be 5MB or smaller.');
      return;
    }

    setError('');
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
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

      const res = await signup(name, email, password, avatar);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background dark:bg-dark-background transition-colors">
      <div className="w-full max-w-md space-y-8 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 p-8 rounded-3xl shadow-xl relative overflow-hidden">
        
        {/* Decorative corner blur */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 rounded-full blur-2xl" />

        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Start Sharing
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-text dark:text-dark-text">
            Create your account
          </h2>
          <p className="text-sm text-mutedText dark:text-dark-mutedText">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 underline">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-secondary bg-secondary/10 dark:bg-secondary/5 dark:text-secondary rounded-xl border border-secondary/30">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-dark" />
              </div>
            </div>

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
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-dark" />
              </div>
            </div>

            {/* Profile Photo */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Profile Photo (optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface px-4 py-3 text-sm text-text dark:text-dark-text hover:border-brand-500 transition-colors">
                  <span className="block font-medium text-sm text-mutedText dark:text-dark-mutedText mb-2">Upload avatar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <span className="text-xs text-mutedText dark:text-dark-mutedText">
                    PNG, JPG, WEBP or GIF up to 5MB.
                  </span>
                </label>
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-border/50 border border-border flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-mutedText dark:text-dark-mutedText text-center px-1">
                      Preview
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-dark" />
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

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-mutedText dark:text-dark-mutedText uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-accent dark:text-dark" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3.5 text-accent dark:text-dark"
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
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Signup;
