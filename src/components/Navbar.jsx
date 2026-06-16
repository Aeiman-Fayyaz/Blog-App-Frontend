import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Search, 
  LogOut, 
  User, 
  PlusSquare, 
  LayoutDashboard, 
  BookMarked,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    if (result.success) {
      toast.success(result.message || 'Signed out successfully.');
      navigate('/');
    } else {
      toast.error(result.message || 'Unable to sign out right now.');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-border/80 dark:border-dark-border/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                Narrato
                <Sparkles className="w-5 h-5 ml-1 text-accent animate-pulse" />
              </span>
            </Link>
          </div>

          {/* Search bar Desktop */}
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search blogs, tags, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-border dark:border-dark-border bg-surface dark:bg-dark-surface/80 text-text dark:text-dark-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-muted dark:text-dark-muted" />
            </form>
          </div>

          {/* Navigation Links Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-brand-600 dark:text-brand-400' : 'text-text dark:text-dark-text hover:text-brand-600 dark:hover:text-brand-400'}`}
            >
              Home
            </Link>
            <Link 
              to="/blogs" 
              className={`text-sm font-medium transition-colors ${isActive('/blogs') ? 'text-brand-600 dark:text-brand-400' : 'text-text dark:text-dark-text hover:text-brand-600 dark:hover:text-brand-400'}`}
            >
              Blogs
            </Link>
            
            {user && (
              <Link 
                to="/dashboard" 
                className="text-text dark:text-dark-text hover:text-brand-600 dark:hover:text-brand-400 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </div>

          {/* Action buttons Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:text-accent hover:bg-surface  dark:hover:text-dark-accent dark:hover:bg-dark-surface transition-all focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
              <div className="relative">
                {/* User avatar profile button */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-full"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border border-border dark:border-dark-border"
                  />
                </button>

                {profileDropdownOpen && (
                  <>
                    {/* Backdrop cover for clicking out */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-lg py-2 z-20 transition-all transform origin-top-right">
                      <div className="px-4 py-2 border-b border-border dark:border-dark-border">
                        <p className="text-sm font-semibold text-text dark:text-dark-text">{user.name}</p>
                        <p className="text-xs  dark:text-accent truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                          {user.role}
                        </span>
                      </div>
                      
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-text dark:text-muted hover:bg-surface dark:hover:bg-dark-surface/50"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2 dark:text-muted" />
                        Dashboard
                      </Link>

                      <Link
                        to="/dashboard?tab=bookmarks"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-text dark:text-muted hover:bg-surface dark:hover:bg-dark-surface/50"
                      >
                        <BookMarked className="w-4 h-4 mr-2  dark:text-muted" />
                        Bookmarks
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-surface dark:hover:bg-dark-surface/50 text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-secondary" />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-text dark:text-dark-text hover:text-primary dark:hover:text-dark-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium px-4 py-2 rounded-full text-white bg-gradient-to-r from-brand-600 to-violet-600 hover:from-brand-500 hover:to-violet-500 shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-accent hover:text-primary dark:text-dark-accent transition-all focus:outline-none"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-accent dark:text-dark-accent focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border dark:border-dark-border bg-surface dark:bg-dark-surface transition-all">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full px-2 mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
              <Search className="absolute left-5 top-2.5 w-4 h-4 text-muted dark:text-dark-muted" />
            </form>

            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-primary/10 text-primary dark:bg-dark-background dark:text-dark-primary' : 'text-text dark:text-dark-text hover:bg-surface dark:hover:bg-dark-surface'}`}
            >
              Home
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/blogs') ? 'bg-primary/10 text-primary dark:bg-dark-background dark:text-dark-primary' : 'text-text dark:text-dark-text hover:bg-surface dark:hover:bg-dark-surface'}`}
            >
              Blogs
            </Link>

            {user ? (
              <>
                <div className="border-t border-border dark:border-dark-border my-2 pt-2">
                  <div className="flex items-center px-3 mb-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="ml-3">
                      <p className="text-sm font-semibold text-text dark:text-dark-text leading-none">{user.name}</p>
                      <p className="text-xs text-text dark:text-muted mt-1">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-text dark:text-dark-text hover:bg-surface dark:hover:bg-dark-surface"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard?tab=bookmarks"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-text dark:text-dark-text hover:bg-surface dark:hover:bg-dark-surface"
                  >
                    Bookmarks
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-surface dark:hover:bg-dark-surface"
                  >
                    Log Out
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 border border-border dark:border-dark-border rounded-md text-sm font-medium text-text dark:text-dark-text hover:bg-surface dark:hover:bg-dark-surface"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-secondary shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
