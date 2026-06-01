import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  
  // Pagination and count stats
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 6;

  // Search input state
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  // Extract other search parameters
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || 'latest';

  useEffect(() => {
    // Fetch categories on mount
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
    // Fetch blogs when params change
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
    newParams.set('page', 1); // Reset page to 1
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and Search Form */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border dark:border-dark-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-text dark:text-dark-text flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-accent dark:text-dark-secondary" />
            Explore Articles
          </h1>
          <p className="text-sm text-text dark:text-accent mt-1">
            {currentTag ? `Showing articles tagged with #${currentTag}` : 'Read insights, tutorials, and discussions from our writing community.'}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative flex-shrink-0 w-full md:w-80">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-full border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text  focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted" />
          <button 
            type="submit"
            className="absolute right-1.5 top-2.5 px-3 py-1 bg-primary text-white rounded-full text-xs font-semibold hover:bg-secondary transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter and layout controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 p-4 rounded-2xl shadow-sm">
        
        {/* Categories Scroller Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full no-scrollbar select-none">
          <button
            onClick={() => handleCategoryFilter('')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!currentCategory ? 'bg-primary text-white shadow-sm' : 'bg-surface text-text border border-border dark:bg-dark-surface dark:text-dark-text dark:border-dark-border hover:bg-muted dark:hover:bg-dark-900'}`}
          >
            All Topics
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryFilter(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${currentCategory === cat.slug ? 'bg-primary text-white shadow-sm' : 'bg-surface text-text border border-border dark:bg-dark-surface dark:text-dark-text dark:border-dark-border hover:bg-muted dark:hover:bg-dark-900'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sort and View Settings */}
        <div className="flex items-center space-x-3 ml-auto">
          {/* Sorting Dropdown */}
          <div className="flex items-center space-x-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-mutedText" />
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="text-xs font-semibold rounded bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-1.5 pr-8 focus:ring-1 focus:ring-secondary text-text dark:text-dark-text"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>

          {/* Grid/List toggles */}
          <div className="hidden sm:flex items-center bg-muted dark:bg-dark-950 p-1 rounded-lg border border-border/50 dark:border-dark-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-dark-surface dark:bg-dark-surface text-accent dark:text-dark-primary shadow-sm' : 'text-secondary hover:text-text'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-dark-surface dark:bg-dark-surface text-accent dark:text-dark-primary shadow-sm' : 'text-secondary hover:text-text'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Active filters summary */}
      {(currentCategory || currentTag || searchParams.get('search')) && (
        <div className="flex items-center justify-between bg-muted/50 dark:bg-dark-950/10 px-4 py-2.5 rounded-xl border border-border/50 dark:border-dark-border/20">
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <span className="text-muted font-semibold">Active Filter:</span>
            {currentCategory && (
              <span className="px-2 py-0.5 rounded bg-muted/60 text-text dark:bg-dark-surface dark:text-dark-text font-bold uppercase tracking-wider">
                Category: {currentCategory}
              </span>
            )}
            {currentTag && (
              <span className="px-2 py-0.5 rounded bg-muted/60 text-text dark:bg-dark-surface dark:text-dark-text font-bold">
                Tag: #{currentTag}
              </span>
            )}
            {searchParams.get('search') && (
              <span className="px-2 py-0.5 rounded bg-muted/60 text-text dark:bg-dark-surface dark:text-dark-text font-bold italic">
                Query: "{searchParams.get('search')}"
              </span>
            )}
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center text-xs font-bold text-secondary hover:text-primary gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Content Feed Grid */}
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
        <div className="py-20 text-center space-y-4 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-3xl">
          <p className="text-muted text-lg">No matching articles found.</p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-full bg-primary hover:bg-secondary text-white font-semibold shadow-sm transition-all"
          >
            Show All Articles
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-6 max-w-4xl mx-auto"
        }>
          {blogs.map((blog) => (
            <div key={blog._id} className={viewMode === 'list' ? 'flex flex-col' : ''}>
              <BlogCard blog={blog} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination component */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-10">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="p-2.5 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-text hover:bg-muted dark:text-dark-text dark:hover:bg-dark-surface/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-semibold text-text dark:text-dark-text px-4">
            Page {page} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-text hover:bg-muted dark:text-dark-text dark:hover:bg-dark-surface/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Blogs;
