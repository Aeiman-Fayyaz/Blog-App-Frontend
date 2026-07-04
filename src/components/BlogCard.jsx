import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Heart, Eye, Clock, Calendar, Bookmark, Share2, ArrowUpRight, Repeat } from 'lucide-react';const BlogCard = ({ blog }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const {
    _id,
    title,
    slug,
    description,
    image,
    category,
    author,
    createdAt,
    readTime,
    likes = [],
    views = 0,
    sharedBy = [],
  } = blog;

  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    if (!user) {
      setBookmarked(false);
      setIsShared(false);
      return;
    }

    const savedIds = user.savedBlogs || [];
    setBookmarked(savedIds.some((id) => id.toString() === _id));

    const sharedIds = user.sharedBlogs || [];
    setIsShared(sharedIds.some((id) => id.toString() === _id));
  }, [user, _id]);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await API.post(`/blogs/${_id}/share`);      if (data.success) {
        setIsShared(true);
        if (setUser) {
          const sharedBlogs = user.sharedBlogs || [];
          setUser({ ...user, sharedBlogs: [...sharedBlogs, _id] });        }
        toast.success(data.message || 'Blog shared to your feed!');
      } else {
        toast.error(data.message || 'Unable to share blog.');
      }
    } catch (error) {
      console.error('Error sharing blog:', error);
      toast.error(error.response?.data?.message || 'Unable to share blog.');
    }
  };

  const handleBookmarkToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await API.put(`/users/bookmark/${_id}`);      if (data?.success) {
        setBookmarked(!bookmarked);
        if (setUser) {
          const savedBlogs = user.savedBlogs || [];
          const nextSavedBlogs = bookmarked
            ? savedBlogs.filter((id) => id.toString() !== _id)
            : [...savedBlogs, _id];          setUser({ ...user, savedBlogs: nextSavedBlogs });
        }
        toast.success(data.message || (bookmarked ? 'Removed from bookmarks.' : 'Added to bookmarks.'));
      } else {
        toast.error(data?.message || 'Unable to update bookmark.');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Unable to update bookmark.');
    }
  };

  return (
    <motion.article 
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative flex flex-col bg-surface/50 dark:bg-dark-surface/30 border border-border/40 dark:border-dark-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300"
    >
      {/* Background radial highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Article Cover Image */}
      <Link to={`/blogs/${slug}`} className="relative block aspect-[16/10] overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-black/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category Badge overlay */}
        {category && (
          <span className="absolute top-4 left-4 z-20 inline-block text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-md bg-primary/80 dark:bg-dark-background/80 text-white border border-white/10 shadow-sm">
            {category.name}
          </span>
        )}

        {/* Read time overlay */}
        <span className="absolute bottom-4 right-4 z-20 inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-md bg-black/60 text-white">
          <Clock className="w-3 h-3 mr-1" />
          {readTime} min read
        </span>
      </Link>

      {/* Card Details */}
      <div className="flex-grow flex flex-col p-6 z-10">
        
        {/* Meta Row (Author & Date) */}
        <div className="flex items-center justify-between text-xs text-mutedText dark:text-dark-mutedText mb-3">
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-primary/70" />
            {formatDate(createdAt)}
          </span>
        </div>

        {/* Blog Title */}
        <h3 className="text-md sm:text-lg font-bold text-text dark:text-dark-text leading-snug mb-2 group-hover:text-primary dark:group-hover:text-dark-primary transition-colors line-clamp-2">
          <Link to={`/blogs/${slug}`} className="flex items-start justify-between gap-1">
            <span>{title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-primary shrink-0" />
          </Link>
        </h3>

        {/* Blog Snippet Description */}
        <p className="text-xs sm:text-sm text-mutedText/85 dark:text-dark-mutedText/85 line-clamp-2 mb-5 flex-grow">
          {description}
        </p>

        {/* Shared by indicator */}
        {isShared && (
          <div className="mb-4 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold text-primary dark:text-dark-primary flex items-center gap-1.5 self-start">
            <Repeat className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            You shared this          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border/60 dark:border-dark-border/40 my-4" />

        {/* Footer Details */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Author info */}
          <Link to={`/author/${author?._id}`} className="flex items-center space-x-2.5 group/author">
            <img
              src={author?.avatar}
              alt={author?.name}
              className="w-7 h-7 rounded-full object-cover border border-border/60 dark:border-dark-border/40 group-hover/author:border-primary/50 transition-colors"
            />
            <span className="text-xs font-semibold text-text/80 dark:text-dark-text/85 group-hover/author:text-primary dark:group-hover/author:text-dark-primary transition-colors truncate max-w-[100px]">
              {author?.name || 'Author'}
            </span>
          </Link>

          {/* Views, Likes, Share & Bookmark Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-[11px] text-mutedText dark:text-dark-mutedText/80 mr-1 select-none">
              <span className="flex items-center">
                <Eye className="w-3.5 h-3.5 mr-0.5 text-accent/80" />
                {views}
              </span>
              <span className="flex items-center">
                <Heart className="w-3.5 h-3.5 mr-0.5 text-secondary fill-secondary/15" />                {likes.length}
              </span>
            </div>

            <button
              onClick={handleShare}
              type="button"
              className="p-1.5 rounded-lg border border-border/60 dark:border-dark-border/40 text-text/70 dark:text-dark-text/70 hover:text-primary dark:hover:text-dark-primary hover:bg-muted dark:hover:bg-dark-surface/60 transition-colors"
              title="Share on feed"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleBookmarkToggle}
              type="button"
              className={`p-1.5 rounded-lg border transition-colors ${
                bookmarked 
                  ? 'bg-primary/10 border-primary text-primary dark:bg-primary/5' 
                  : 'border-border/60 dark:border-dark-border/40 text-text/70 dark:text-dark-text/70 hover:text-primary dark:hover:text-dark-primary hover:bg-muted dark:hover:bg-dark-surface/60'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>          </div>

        </div>

      </div>
    </motion.article>
  );
};

export default BlogCard;

