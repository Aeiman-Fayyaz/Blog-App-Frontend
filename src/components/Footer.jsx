import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ExternalLink, Share2, Globe, Heart } from "lucide-react";

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
    <footer className="bg-surface text-text border-t border-border dark:bg-dark-background dark:text-dark-text dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center">
                Narrato
                <Sparkles className="w-5 h-5 ml-1 text-accent animate-pulse" />
              </span>
            </Link>
            <p className="text-sm max-w-sm">
              Discover stories, thinking, and expertise from writers on any device. Share your ideas, build your audience, and join a global network of authors.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-400 transition-colors" aria-label="Twitter"><Share2 className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-400 transition-colors" aria-label="GitHub"><ExternalLink className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-400 transition-colors" aria-label="Website"><Globe className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-secondary text-sm font-semibold uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/blogs" className="hover:text-white transition-colors">All Articles</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Join Platform</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Author Dashboard</Link></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-3">
            <h3 className="text-secondary text-sm font-semibold uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm">Get the best writing directly delivered to your inbox weekly.</p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded bg-muted border border-border text-text  focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                required
              />
              <button
                type="submit"
                className="w-full px-3 py-2 text-sm rounded bg-primary hover:bg-secondary text-white font-medium shadow-sm transition-all"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-secondary animate-fade-in">Awesome! You have subscribed successfully.</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs space-y-4 sm:space-y-0">
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
