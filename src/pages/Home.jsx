import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../utils/api';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/SkeletonLoader';
import { 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Compass, 
  Grid,
  ChevronRight,
  Send,
  Zap,
  Award
} from 'lucide-react';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Get published blogs (limit 6)
        const blogRes = await API.get('/blogs?limit=6');
        if (blogRes.data.success) {
          setBlogs(blogRes.data.blogs);
        }

        // Get trending blogs (limit 3, popular sorting)
        const trendingRes = await API.get('/blogs?sort=trending&limit=3');
        if (trendingRes.data.success) {
          setTrendingBlogs(trendingRes.data.blogs);
        }

        // Get categories
        const catRes = await API.get('/categories');
        if (catRes.data.success) {
          setCategories(catRes.data.categories);
        }
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent opacity-60" />
        <div className="hero-dots pointer-events-none absolute inset-0" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 border border-secondary/25 text-primary text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              The Future of Blogging is Here
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight"
            >
              <span className="block text-white">Share Your Story</span>
              <span className="block text-accent">With The Entire World</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-surface max-w-xl"
            >
              Write beautiful markdown articles, manage them from professional dashboards, and interact with authors through structured threaded comments.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/blogs"
                className="px-6 py-3 rounded-full bg-surface text-text font-semibold flex items-center gap-2 hover:bg-muted shadow-md hover:shadow-lg transition-all"
              >
                Explore Blogs
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-full bg-primary hover:bg-secondary text-white font-semibold flex items-center gap-2 shadow-md transition-all border border-secondary"
              >
                Write an Article
              </Link>
            </motion.div>
          </div>

          {/* Hero Right Visuals */}
          <div className="hidden lg:col-span-5 lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative mx-auto w-full max-w-sm rounded-3xl overflow-hidden glass-card bg-dark-background/70 p-6 border border-secondary/15 shadow-2xl"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold">Narrato</p>
                    <h3 className="text-xl font-bold text-text dark:text-dark-text">Editorial Spotlight</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-surface dark:bg-dark-surface p-4 shadow-sm border border-border dark:border-dark-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-semibold text-primary">Editor’s Pick</span>
                      <span className="text-[10px] text-muted">2 min read</span>
                    </div>
                    <h4 className="text-lg font-bold text-text dark:text-dark-text">Launch your first blog with confidence</h4>
                    <p className="text-sm text-accent dark:text-secondary mt-2">Publish markdown posts, track analytics, and grow your audience.</p>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-3xl bg-surface dark:bg-dark-surface p-4 shadow-sm border border-border dark:border-dark-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase font-semibold text-secondary">Trending</span>
                        <span className="text-[10px] text-muted">Nov 12</span>
                      </div>
                      <p className="text-sm font-bold text-text dark:text-dark-text">Write posts that readers will bookmark.</p>
                    </div>
                    <div className="rounded-3xl bg-primary/10 p-4 text-center">
                      <p className="text-[11px] uppercase font-semibold tracking-wide text-primary mb-3">Narrato Studio</p>
                      <p className="text-lg font-bold text-text dark:text-dark-text">Create. Publish. Share.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left md:flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2 justify-center md:justify-start">
              <Compass className="w-6 h-6 text-secondary dark:text-dark-secondary" />
              Explore Topics
            </h2>
            <p className="text-sm text-accent dark:text-accent mt-1">Browse posts by category interest</p>
          </div>
          <Link to="/blogs" className="hidden md:flex items-center text-sm font-semibold text-primary dark:text-dark-primary hover:text-secondary">
            View All Categories
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-2xl" />
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full py-6 text-center text-muted">No categories created yet.</div>
          ) : (
            categories.slice(0, 6).map((cat) => (
              <Link
                key={cat._id}
                to={`/blogs?category=${cat.slug}`}
                className="group flex flex-col items-center justify-center p-6 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 rounded-2xl hover:border-secondary dark:hover:border-dark-secondary hover:shadow-md transition-all text-center"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden mb-3 bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm font-bold text-text dark:text-dark-text truncate max-w-full">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-muted font-semibold mt-1">
                  {cat.count || 0} posts
                </span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Trending / Featured Blogs section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-secondary dark:text-dark-secondary" />
            Trending Stories
          </h2>
          <p className="text-sm text-accent dark:text-accent mt-1">Most popular articles on the platform</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : trendingBlogs.length === 0 ? (
          <div className="p-8 text-center text-muted bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl">
            No trending articles found yet. Write the first popular story!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      {/* Latest Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-secondary dark:text-dark-secondary" />
              Latest Articles
            </h2>
            <p className="text-sm text-secondary dark:text-accent mt-1">Explore our newly published insights</p>
          </div>
          <Link
            to="/blogs"
            className="flex items-center text-sm font-semibold text-primary dark:text-dark-primary hover:text-secondary"
          >
            See All Blogs
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-8 text-center text-muted bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl">
            No articles found. Check back later or create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      {/* Call to Action write section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
          
          <div className="space-y-3 relative z-10 text-left">
            <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold">
              <Award className="w-4.5 h-4.5 text-dark-primary" />
              Write for Narrato
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to Share Your Knowledge?
            </h2>
            <p className="text-surface max-w-md text-sm leading-relaxed">
              Create a free account, type with formatting support in our rich markdown editor, publish immediately, and watch your views scale.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-full bg-surface text-primary hover:bg-muted font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Start Writing Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
