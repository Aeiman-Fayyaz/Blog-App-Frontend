import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Heart, ArrowRight, Mail } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer id="footer" className="relative bg-surface dark:bg-dark-surface border-t border-border/80 dark:border-dark-border/80 transition-colors duration-200 overflow-hidden">
      
      {/* Background gradients and textures */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 noise-bg pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Info (Col span 4) */}
          <div className="col-span-1 md:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center space-x-2 text-2xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                Narrato
                <Sparkles className="w-5 h-5 ml-1 text-accent animate-pulse" />
              </span>
            </Link>
            <p className="text-sm text-mutedText dark:text-dark-mutedText leading-relaxed">
              Explore stories, ideas, and expertise from writers across the globe. Write markdown articles, build your professional audience, and participate in thoughtful discussions.
            </p>
            <div className="flex space-x-3.5 pt-2">
              <a href="#" className="p-2 rounded-full border border-border dark:border-dark-border hover:border-primary/50 text-text/70 dark:text-dark-text/70 hover:text-primary transition-all bg-surface/50 dark:bg-dark-surface/50" aria-label="Twitter">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="p-2 rounded-full border border-border dark:border-dark-border hover:border-primary/50 text-text/70 dark:text-dark-text/70 hover:text-primary transition-all bg-surface/50 dark:bg-dark-surface/50" aria-label="GitHub">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </a>
              <a href="#" className="p-2 rounded-full border border-border dark:border-dark-border hover:border-primary/50 text-text/70 dark:text-dark-text/70 hover:text-primary transition-all bg-surface/50 dark:bg-dark-surface/50" aria-label="Website">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories Columns (Col span 2) */}
          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-4">
            <h3 className="text-text dark:text-dark-text text-xs font-bold uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/blogs?category=technology" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Technology</Link>
              </li>
              <li>
                <Link to="/blogs?category=programming" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Programming</Link>
              </li>
              <li>
                <Link to="/blogs?category=ai" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Artificial Intelligence</Link>
              </li>
              <li>
                <Link to="/blogs?category=design" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Design & UX</Link>
              </li>
              <li>
                <Link to="/blogs?category=startups" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Startups</Link>
              </li>
            </ul>
          </div>

          {/* Resources Column (Col span 2) */}
          <div className="col-span-1 sm:col-span-3 md:col-span-2 space-y-4">
            <h3 className="text-text dark:text-dark-text text-xs font-bold uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/blogs" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">All Articles</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Author Studio</Link>
              </li>
              <li>
                <a href="#" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Markdown Guide</a>
              </li>
              <li>
                <a href="#" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-mutedText hover:text-primary transition-colors text-xs sm:text-sm">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Newsletter Form (Col span 4) */}
          <div className="col-span-1 sm:col-span-6 md:col-span-4 space-y-4">
            <h3 className="text-text dark:text-dark-text text-xs font-bold uppercase tracking-wider">Subscribe to Newsletter</h3>
            <p className="text-sm text-mutedText dark:text-dark-mutedText leading-relaxed">
              Join our mailing list to receive handpicked stories, technical write-ups, and product updates in your inbox weekly.
            </p>
            
            <form onSubmit={handleSubscribe} className="relative flex items-center mt-2 w-full">
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 text-xs rounded-xl border border-border dark:border-dark-border bg-surface/50 dark:bg-dark-surface/50 text-text dark:text-dark-text placeholder-mutedText focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-mutedText" />
              </div>
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-2 bg-primary hover:bg-secondary text-white rounded-lg transition-all"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-primary font-semibold animate-pulse mt-2">
                Successfully subscribed! Check your inbox soon.
              </p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/80 dark:border-dark-border/80 my-10" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0 text-mutedText">
          <p>© {new Date().getFullYear()} Narrato. All rights reserved.</p>
          <p className="flex items-center">
            Developed by AEIMAN FAYYAZ  <Heart className="w-3.5 h-3.5 mx-1 text-secondary fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
