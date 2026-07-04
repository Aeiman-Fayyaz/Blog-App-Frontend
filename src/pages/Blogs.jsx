import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/SkeletonLoader';
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';

const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 6;

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams(searchParams);
        queryParams.set('limit', limit);
        queryParams.set('page', page);
        
        const { data } = await API.get(`/blogs?${queryParams.toString()}`);
        if (data.success) {
          setBlogs(data.blogs);
          setTotalBlogs(data.total);
          setTotalPages(Math.ceil(data.total / limit));
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, [searchParams, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', 1);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (catSlug) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', 1);
    if (catSlug) {
      newParams.set('category', catSlug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSortChange = (sortVal) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', 1);
    newParams.set('sort', sortVal);
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage);
      setSearchParams(newParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header and Search Form */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 dark:border-dark-border/80 pb-8 text-left">
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text dark:text-dark-text tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Explore Articles
          </h1>
          <p className="text-sm text-mutedText dark:text-dark-mutedText max-w-xl">
            {currentTag 
              ? `Showing articles tagged with #${currentTag}` 
              : 'Discover insights, comprehensive guides, and creative writing from our engineering and design community.'}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex-shrink-0 w-full md:w-80">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-full border border-border/60 dark:border-dark-border/40 bg-surface/50 dark:bg-dark-surface/50 text-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-mutedText" />
          <button 
            type="submit"
            className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-primary text-white rounded-full text-xs font-bold hover:bg-secondary transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter controls and view switches */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface/40 dark:bg-dark-surface/20 border border-border/40 dark:border-dark-border/40 p-4 rounded-2xl shadow-sm">
        
        {/* Categories Tabs Scroller */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full no-scrollbar select-none">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              !currentCategory 
                ? 'bg-primary text-white shadow-md shadow-primary/10' 
                : 'bg-surface/50 text-text/80 dark:bg-dark-surface/40 dark:text-dark-text/80 border border-border/50 dark:border-dark-border/50 hover:bg-muted dark:hover:bg-dark-surface/85'
            }`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                currentCategory === cat.slug 
                  ? 'bg-primary text-white shadow-md shadow-primary/10' 
                  : 'bg-surface/50 text-text/80 dark:bg-dark-surface/40 dark:text-dark-text/80 border border-border/50 dark:border-dark-border/50 hover:bg-muted dark:hover:bg-dark-surface/85'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort and view modes */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-mutedText" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-xs font-bold rounded-xl bg-surface/50 dark:bg-dark-surface/40 border border-border/50 dark:border-dark-border/50 p-2 focus:ring-1 focus:ring-primary text-text/80 dark:text-dark-text/80 focus:outline-none"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Grid/List toggles */}
          <div className="hidden sm:flex items-center bg-muted/40 dark:bg-dark-surface/50 p-1 rounded-xl border border-border/40 dark:border-dark-border/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surface dark:bg-dark-surface text-primary shadow-sm' : 'text-mutedText hover:text-primary'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface dark:bg-dark-surface text-primary shadow-sm' : 'text-mutedText hover:text-primary'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Active filters display */}
      {(currentCategory || currentTag || searchParams.get('search')) && (
        <div className="flex items-center justify-between bg-primary/5 px-4 py-2.5 rounded-xl border border-primary/10">
          <div className="flex flex-wrap gap-2 items-center text-xs text-left">
            <span className="text-mutedText dark:text-dark-mutedText font-semibold">Active Filter:</span>
            {currentCategory && (
              <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                Category: {currentCategory}
              </span>
            )}
            {currentTag && (
              <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                Tag: #{currentTag}
              </span>
            )}
            {searchParams.get('search') && (
              <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px] italic">
                Query: "{searchParams.get('search')}"
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center text-xs font-bold text-secondary hover:text-primary gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        </div>
      )}

      {/* Content Feed Layout Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      ) : blogs.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-surface/30 dark:bg-dark-surface/10 border border-border/40 dark:border-dark-border/40 rounded-3xl">
          <p className="text-mutedText text-lg">No matching articles found.</p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-full bg-primary hover:bg-secondary text-white font-bold text-xs shadow-md transition-all"
          >
            Show All Articles
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-6 max-w-4xl mx-auto"
            }
          >
            {blogs.map((blog, idx) => (
              <motion.div 
                key={blog._id} 
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={viewMode === 'list' ? 'flex flex-col' : ''}
              >
                <BlogCard blog={blog} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination control panel */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-10">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2.5 rounded-xl bg-surface/50 dark:bg-dark-surface/40 border border-border/50 dark:border-dark-border/50 text-text/80 hover:bg-muted dark:text-dark-text/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs font-bold text-text/85 dark:text-dark-text/85 px-4 select-none">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl bg-surface/50 dark:bg-dark-surface/40 border border-border/50 dark:border-dark-border/50 text-text/80 hover:bg-muted dark:text-dark-text/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;
