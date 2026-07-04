import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import API from '../utils/api';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/SkeletonLoader';
import { 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Compass, 
  Zap, 
  Award,
  ChevronRight,
  Laptop,
  Code,
  Brain,
  Lock,
  Rocket,
  Palette,
  HelpCircle,
  Clock,
  Eye,
  Heart,
  Calendar
} from 'lucide-react';

const Home = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingBlogs, setTrendingBlogs] = useState([]);
  
  const navigate = useNavigate();
  const heroRef = useRef(null);

  // Scroll parallax / scaling animations for hero background
  const { scrollY } = useScroll();
  const heroScaleVal = useTransform(scrollY, [0, 400], [1, 0.92]);
  const heroScale = useSpring(heroScaleVal, { stiffness: 90, damping: 25 });
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.35]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Get published blogs (limit 7: 1 for featured, 6 for bento grid)
        const blogRes = await API.get('/blogs?limit=7');
        if (blogRes.data.success) {
          setBlogs(blogRes.data.blogs);
        }

        // Get trending blogs (limit 6, popular sorting)
        const trendingRes = await API.get('/blogs?sort=trending&limit=6');
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

  const marqueeKeywords = [
    'TECHNOLOGY', 'PROGRAMMING', 'WEB DEVELOPMENT', 'AI', 'REACT', 
    'JAVASCRIPT', 'NODEJS', 'DESIGN', 'STARTUPS', 'PRODUCTIVITY', 
    'SECURITY', 'CLOUD', 'DATABASES', 'OPEN SOURCE', 'DEVOPS', 'SOFTWARE ENGINEERING'
  ];

  // Category mapping helper
  const getCategoryStyles = (slug) => {
    const cleanSlug = slug.toLowerCase();
    const styles = {
      technology: { icon: Laptop, gradient: 'from-blue-600/10 to-cyan-500/10 hover:border-blue-500/30 text-blue-500' },
      programming: { icon: Code, gradient: 'from-violet-600/10 to-purple-500/10 hover:border-violet-500/30 text-violet-500' },
      ai: { icon: Brain, gradient: 'from-pink-600/10 to-rose-500/10 hover:border-pink-500/30 text-pink-500' },
      security: { icon: Lock, gradient: 'from-red-600/10 to-amber-500/10 hover:border-red-500/30 text-red-500' },
      startups: { icon: Rocket, gradient: 'from-emerald-600/10 to-teal-500/10 hover:border-emerald-500/30 text-emerald-500' },
      design: { icon: Palette, gradient: 'from-fuchsia-600/10 to-pink-500/10 hover:border-fuchsia-500/30 text-fuchsia-500' },
      productivity: { icon: Zap, gradient: 'from-yellow-600/10 to-orange-500/10 hover:border-yellow-500/30 text-yellow-500' },
    };
    return styles[cleanSlug] || { icon: HelpCircle, gradient: 'from-primary/10 to-secondary/10 hover:border-primary/30 text-primary' };
  };

  // Split out the featured post
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  // Next 6 blogs go into the Bento grid
  const gridBlogs = blogs.length > 1 ? blogs.slice(1, 7) : [];

  return (
    <div className="space-y-24 pb-24 overflow-x-hidden">
      
      {/* 1. Animated Parallax Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        
        {/* Parallax Background Wrapper */}
        <motion.div 
          style={{ scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 z-0 origin-center"
        >
          {/* Base Grid Texture & Noise */}
          <div className="absolute inset-0 grid-bg opacity-70" />
          <div className="absolute inset-0 dot-bg opacity-80" />
          <div className="absolute inset-0 noise-bg" />

          {/* Floating Blurred Gradient Orbs */}
          <motion.div 
            animate={{ 
              y: [0, -35, 0],
              x: [0, 20, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-primary/20 dark:bg-primary/10 blur-[90px]" 
          />
          <motion.div 
            animate={{ 
              y: [0, 45, 0],
              x: [0, -30, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/15 dark:bg-secondary/5 blur-[100px]" 
          />
          <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-accent/10 dark:bg-accent/5 blur-[80px]" />
        </motion.div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8 px-4">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-card border-primary/25 dark:border-primary/10 text-primary text-xs font-bold shadow-md bg-surface/30"
          >
            <Zap className="w-3.5 h-3.5 text-primary" />
            Empowering Writers and Thinkers Globally
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-text dark:text-white"
            >
              Share Stories <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                That Matter
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-mutedText dark:text-dark-mutedText max-w-2xl mx-auto leading-relaxed"
            >
              Write beautiful markdown articles, manage them from professional dashboards, and connect with a global community through threaded conversations.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-full bg-primary hover:bg-secondary text-white font-bold shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all text-sm flex items-center gap-1.5"
            >
              Create Blog
            </Link>
            <Link
              to="/blogs"
              className="px-8 py-3.5 rounded-full bg-surface/50 hover:bg-surface text-text font-bold border border-border/80 hover:border-primary/40 dark:bg-dark-surface/40 dark:text-dark-text dark:border-dark-border/80 dark:hover:border-primary/30 shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-1.5"
            >
              Explore Blogs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        </div>
      </section>

      {/* 2. Infinite Blog Keywords Marquee */}
      <section className="relative w-full py-6 border-y border-border/60 dark:border-dark-border/40 bg-surface/20 dark:bg-dark-surface/10 overflow-hidden select-none">
        
        {/* Edge Blur Mask Overlay */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-background dark:from-dark-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-background dark:from-dark-background to-transparent z-10 pointer-events-none" />

        <div className="flex animate-marquee whitespace-nowrap">
          {/* Double content to loop seamlessly */}
          {[...marqueeKeywords, ...marqueeKeywords].map((word, idx) => (
            <span 
              key={idx} 
              className="mx-8 text-xs sm:text-sm font-bold tracking-widest text-mutedText/60 dark:text-dark-mutedText/40 flex items-center gap-2 hover:text-primary dark:hover:text-primary transition-colors cursor-default"
            >
              <span>{word}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            </span>
          ))}
        </div>
      </section>

      {/* 3. Featured Blog Showcase */}
      {featuredBlog && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 mb-8 text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2.5">
              <Award className="w-6 h-6 text-primary" />
              Featured Article
            </h2>
            <p className="text-sm text-mutedText dark:text-dark-mutedText -mt-1">
              Curated editorial highlights handpicked for today's reading.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-surface/40 dark:bg-dark-surface/20 border border-border/50 dark:border-dark-border/40 rounded-3xl p-6 lg:p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-500"
          >
            {/* Image Col (Col span 7) */}
            <div className="lg:col-span-7 aspect-[16/10] sm:aspect-[21/11] lg:aspect-auto rounded-2xl overflow-hidden bg-muted/20 relative">
              <img
                src={featuredBlog.image}
                alt={featuredBlog.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {featuredBlog.category && (
                <span className="absolute top-4 left-4 inline-block text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full backdrop-blur-md bg-primary/95 text-white">
                  {featuredBlog.category.name}
                </span>
              )}
            </div>

            {/* Info Col (Col span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-5 lg:pl-4 text-left">
              
              {/* Meta information */}
              <div className="flex items-center space-x-3 text-xs text-mutedText dark:text-dark-mutedText font-semibold">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-primary/70" />
                  {new Date(featuredBlog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-primary/70" />
                  {featuredBlog.readTime} min read
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl sm:text-3xl font-extrabold text-text dark:text-dark-text leading-tight group-hover:text-primary transition-colors">
                <Link to={`/blogs/${featuredBlog.slug}`}>
                  {featuredBlog.title}
                </Link>
              </h3>

              {/* Description */}
              <p className="text-sm text-mutedText/90 dark:text-dark-mutedText/90 leading-relaxed line-clamp-3">
                {featuredBlog.description}
              </p>

              {/* Author & Stats divider */}
              <div className="border-t border-border/80 dark:border-dark-border/30 pt-5 mt-2 flex items-center justify-between">
                
                {/* Author profile info */}
                <Link to={`/author/${featuredBlog.author?._id}`} className="flex items-center space-x-3">
                  <img
                    src={featuredBlog.author?.avatar}
                    alt={featuredBlog.author?.name}
                    className="w-9 h-9 rounded-full object-cover border border-border dark:border-dark-border"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-text dark:text-dark-text">{featuredBlog.author?.name}</h4>
                    <p className="text-[10px] text-mutedText mt-0.5">{featuredBlog.author?.role || 'Writer'}</p>
                  </div>
                </Link>

                {/* Engagement stats */}
                <div className="flex items-center space-x-3 text-xs text-mutedText dark:text-dark-mutedText">
                  <span className="flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-0.5 text-accent" />
                    {featuredBlog.views}
                  </span>
                  <span className="flex items-center">
                    <Heart className="w-3.5 h-3.5 mr-0.5 text-secondary" />
                    {featuredBlog.likes?.length || 0}
                  </span>
                </div>

              </div>

              {/* Read button */}
              <div className="pt-2">
                <Link
                  to={`/blogs/${featuredBlog.slug}`}
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-secondary text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md transition-all self-start"
                >
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          </motion.div>
        </section>
      )}

      {/* 4. Bento Grid Blog Layout */}
      {gridBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 text-left">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-primary" />
                Latest Insights
              </h2>
              <p className="text-sm text-mutedText dark:text-dark-mutedText mt-1">
                Explore newly published thinking from our global authors.
              </p>
            </div>
            <Link
              to="/blogs"
              className="flex items-center text-xs font-bold text-primary dark:text-dark-primary hover:text-secondary group/link"
            >
              See All Blogs
              <ChevronRight className="w-4 h-4 ml-0.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {gridBlogs.map((blog, idx) => {
              // Asymmetric Bento layout mapping
              // Item 0: spans 2 columns (Horizontal emphasize card)
              // Item 3: spans 2 columns (Horizontal emphasize card)
              const isLarge = idx === 0 || idx === 3;
              
              if (isLarge) {
                return (
                  <motion.div 
                    key={blog._id} 
                    className="md:col-span-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <div className="group relative h-full flex flex-col sm:flex-row bg-surface/50 dark:bg-dark-surface/30 border border-border/40 dark:border-dark-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                      
                      {/* Image block */}
                      <Link to={`/blogs/${blog.slug}`} className="sm:w-1/2 aspect-[16/10] sm:aspect-auto overflow-hidden bg-muted/20 relative">
                        <img 
                          src={blog.image} 
                          alt={blog.title} 
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {blog.category && (
                          <span className="absolute top-4 left-4 inline-block text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-md bg-primary/90 text-white">
                            {blog.category.name}
                          </span>
                        )}
                      </Link>

                      {/* Info details */}
                      <div className="sm:w-1/2 flex flex-col justify-between p-6 text-left">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-[11px] text-mutedText dark:text-dark-mutedText font-semibold">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-primary/70" />
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 text-primary/70" />
                              {blog.readTime} min
                            </span>
                          </div>

                          <h3 className="text-md sm:text-lg font-bold text-text dark:text-dark-text leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            <Link to={`/blogs/${blog.slug}`}>
                              {blog.title}
                            </Link>
                          </h3>

                          <p className="text-xs text-mutedText/85 dark:text-dark-mutedText/85 line-clamp-2">
                            {blog.description}
                          </p>
                        </div>

                        <div className="border-t border-border/60 dark:border-dark-border/30 pt-4 mt-4 flex items-center justify-between">
                          <Link to={`/author/${blog.author?._id}`} className="flex items-center space-x-2">
                            <img src={blog.author?.avatar} alt={blog.author?.name} className="w-7 h-7 rounded-full object-cover border border-border" />
                            <span className="text-xs font-semibold text-text/80 dark:text-dark-text/80">{blog.author?.name}</span>
                          </Link>

                          <div className="flex items-center space-x-2 text-[10px] text-mutedText">
                            <span className="flex items-center"><Eye className="w-3 h-3 mr-0.5" />{blog.views}</span>
                            <span className="flex items-center"><Heart className="w-3 h-3 mr-0.5 text-secondary" />{blog.likes?.length || 0}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              }

              // Standard Bento Cards (spans 1 column)
              return (
                <motion.div 
                  key={blog._id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <BlogCard blog={blog} />
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Trending Blogs Section (Carousel) */}
      {trendingBlogs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-8 text-left">
            <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-primary animate-bounce" />
              Trending on Narrato
            </h2>
            <p className="text-sm text-mutedText dark:text-dark-mutedText">
              Writers sharing insights that are currently capturing our readers' attention.
            </p>
          </div>

          {/* Smooth Horizontal Carousel Scroll */}
          <div className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar snap-x scroll-smooth">
            {trendingBlogs.map((blog, index) => (
              <div 
                key={blog._id} 
                className="w-[280px] sm:w-[350px] shrink-0 snap-align-start snap-always"
              >
                <div className="group relative flex flex-col bg-surface/30 dark:bg-dark-surface/10 border border-border/40 dark:border-dark-border/40 rounded-2xl p-5 hover:border-primary/20 transition-all duration-300">
                  <div className="absolute top-4 right-4 text-3xl sm:text-4xl font-extrabold text-primary/10 dark:text-primary/5 select-none font-mono">
                    {`0${index + 1}`}
                  </div>
                  
                  {/* Category Tag */}
                  <div className="self-start text-[9px] uppercase font-extrabold text-primary tracking-widest mb-3">
                    {blog.category?.name || 'Story'}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-extrabold text-text dark:text-dark-text leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    <Link to={`/blogs/${blog.slug}`}>
                      {blog.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-mutedText/85 dark:text-dark-mutedText/85 line-clamp-2 mb-4 leading-relaxed">
                    {blog.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-mutedText pt-3 border-t border-border/40 dark:border-dark-border/20">
                    <Link to={`/author/${blog.author?._id}`} className="flex items-center space-x-2">
                      <img src={blog.author?.avatar} alt={blog.author?.name} className="w-6 h-6 rounded-full object-cover border border-border/40" />
                      <span className="font-semibold text-text/80">{blog.author?.name}</span>
                    </Link>

                    <div className="flex items-center space-x-2 text-[10px]">
                      <span className="flex items-center"><Eye className="w-3.5 h-3.5 mr-0.5 text-accent" />{blog.views}</span>
                      <span className="flex items-center"><Heart className="w-3.5 h-3.5 mr-0.5 text-secondary" />{blog.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Category Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-8 text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-text dark:text-dark-text flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-primary" />
            Explore Topics
          </h2>
          <p className="text-sm text-mutedText dark:text-dark-mutedText">
            Browse content library segmented by specific technical fields and interests.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {loading ? (
            Array(7).fill(0).map((_, i) => (
              <div key={i} className="shimmer h-28 rounded-2xl" />
            ))
          ) : categories.length === 0 ? (
            <div className="col-span-full py-6 text-center text-muted">No categories created yet.</div>
          ) : (
            categories.slice(0, 7).map((cat) => {
              const catConfig = getCategoryStyles(cat.slug);
              const CatIcon = catConfig.icon;
              return (
                <motion.div
                  key={cat._id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="group"
                >
                  <Link
                    to={`/blogs?category=${cat.slug}`}
                    className={`flex flex-col items-center justify-center p-5 bg-gradient-to-b ${catConfig.gradient} border border-border/40 dark:border-dark-border/40 rounded-2xl hover:shadow-md transition-all text-center h-full`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface dark:bg-dark-surface border border-border/50 dark:border-dark-border/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <CatIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-text dark:text-dark-text truncate max-w-full">
                      {cat.name}
                    </h3>
                    <span className="text-[9px] uppercase tracking-wider text-mutedText/80 dark:text-dark-mutedText/85 font-semibold mt-1">
                      {cat.count || 0} Articles
                    </span>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* 7. Call to Action write section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-14 text-white shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          
          {/* Textures */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40 pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
          <div className="absolute inset-0 noise-bg opacity-15 pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-white" />
              Write for Narrato
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Share Your Knowledge?
            </h2>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed">
              Create a free account, write fluidly using our clean markdown editor, instantly publish, and track reading metrics globally.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to="/dashboard"
              className="px-8 py-3.5 rounded-full bg-white text-primary hover:bg-white/95 font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 text-sm"
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
