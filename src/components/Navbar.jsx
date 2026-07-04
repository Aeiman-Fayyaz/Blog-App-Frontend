import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  ChevronDown,
  TrendingUp,
  Grid
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
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

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-surface/85 dark:bg-dark-surface/90 backdrop-blur-xl border-b border-border/80 dark:border-dark-border/80 shadow-md py-3' 
        : 'bg-surface/40 dark:bg-dark-background/40 backdrop-blur-md border-b border-border/30 dark:border-dark-border/10 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center hover:opacity-95 transition-opacity">
                Narrato
                <Sparkles className="w-5 h-5 ml-1 text-accent animate-pulse" />
              </span>
            </Link>
          </div>

          {/* Navigation Links Center (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8 bg-muted/30 dark:bg-dark-surface/30 px-6 py-1.5 rounded-full border border-border/30 dark:border-dark-border/20">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors duration-250 relative ${
                isActive('/') ? 'text-primary dark:text-dark-primary' : 'text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary'
              }`}
            >
              Home
              {location.pathname === '/' && (
                <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            <Link 
              to="/blogs" 
              className={`text-sm font-medium transition-colors duration-250 relative ${
                isActive('/blogs') && !location.search.includes('category') && !location.search.includes('sort')
                  ? 'text-primary dark:text-dark-primary' 
                  : 'text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary'
              }`}
            >
              Blogs
              {isActive('/blogs') && !location.search.includes('category') && !location.search.includes('sort') && (
                <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            
            {/* Direct Category link to show AI category */}
            <Link 
              to="/blogs?category=ai" 
              className={`text-sm font-medium transition-colors duration-250 relative ${
                location.search.includes('category=ai') ? 'text-primary dark:text-dark-primary' : 'text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary'
              }`}
            >
              Categories
              {location.search.includes('category=ai') && (
                <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            <Link 
              to="/blogs?sort=trending" 
              className={`text-sm font-medium transition-colors duration-250 relative ${
                location.search.includes('sort=trending') ? 'text-primary dark:text-dark-primary' : 'text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary'
              }`}
            >
              Trending
              {location.search.includes('sort=trending') && (
                <motion.div layoutId="nav-indicator" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            <a 
              href="#footer"
              className="text-sm font-medium text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary transition-colors"
            >
              About
            </a>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Bar Desktop */}
            <form onSubmit={handleSearchSubmit} className="relative w-48 lg:w-64">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-border/60 dark:border-dark-border/40 bg-surface/50 dark:bg-dark-surface/50 text-text dark:text-dark-text placeholder-mutedText focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
              />
              <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-mutedText" />
            </form>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted dark:hover:bg-dark-surface/60 transition-colors text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <div className="relative">
                {/* User profile dropdown button */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none rounded-full p-1 border border-border/40 dark:border-dark-border/30 hover:border-primary/50 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-mutedText" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border shadow-xl py-2.5 z-20"
                      >
                        <div className="px-4 py-2 border-b border-border dark:border-dark-border mb-1.5">
                          <p className="text-sm font-bold text-text dark:text-dark-text leading-tight">{user.name}</p>
                          <p className="text-xs text-mutedText truncate mt-0.5">{user.email}</p>
                          <span className="inline-block mt-2 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                            {user.role}
                          </span>
                        </div>
                        
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50 hover:text-primary transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2.5" />
                          Dashboard
                        </Link>

                        <Link
                          to="/dashboard?tab=bookmarks"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50 hover:text-primary transition-colors"
                        >
                          <BookMarked className="w-4 h-4 mr-2.5" />
                          Bookmarks
                        </Link>

                        <div className="border-t border-border dark:border-dark-border my-1.5" />

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-secondary hover:bg-muted dark:hover:bg-dark-background/50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 mr-2.5" />
                          Log Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-bold px-4 py-2 rounded-full text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 shadow-md hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button controls */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-text/80 dark:text-dark-text/80 hover:text-primary dark:hover:text-dark-primary transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text/80 dark:text-dark-text/80 hover:text-primary focus:outline-none transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border/50 dark:border-dark-border/50 bg-surface dark:bg-dark-surface overflow-hidden mt-3"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border/80 dark:border-dark-border/50 bg-surface dark:bg-dark-surface text-text dark:text-dark-text placeholder-mutedText focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-mutedText" />
              </form>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50'}`}
              >
                Home
              </Link>
              <Link
                to="/blogs"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/blogs') && !location.search.includes('category') ? 'bg-primary/10 text-primary' : 'text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50'}`}
              >
                Blogs
              </Link>
              <Link
                to="/blogs?category=ai"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold ${location.search.includes('category=ai') ? 'bg-primary/10 text-primary' : 'text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50'}`}
              >
                Categories
              </Link>
              <Link
                to="/blogs?sort=trending"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-semibold ${location.search.includes('sort=trending') ? 'bg-primary/10 text-primary' : 'text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50'}`}
              >
                Trending
              </Link>
              <a
                href="#footer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50"
              >
                About
              </a>

              {user ? (
                <>
                  <div className="border-t border-border/60 dark:border-dark-border/40 my-3 pt-3">
                    <div className="flex items-center px-3 mb-3">
                      <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                      <div className="ml-3">
                        <p className="text-sm font-bold text-text dark:text-dark-text leading-tight">{user.name}</p>
                        <p className="text-xs text-mutedText truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard?tab=bookmarks"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-2 rounded-xl text-sm font-semibold text-text/80 dark:text-dark-text/80 hover:bg-muted dark:hover:bg-dark-background/50"
                    >
                      <BookMarked className="w-4 h-4 mr-2" />
                      Bookmarks
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-3 py-2 rounded-xl text-sm font-semibold text-secondary hover:bg-muted dark:hover:bg-dark-background/50 text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-3 px-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2 border border-border/80 dark:border-dark-border/50 rounded-full text-xs font-semibold text-text dark:text-dark-text hover:bg-muted"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2 bg-primary rounded-full text-xs font-bold text-white hover:bg-secondary shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
