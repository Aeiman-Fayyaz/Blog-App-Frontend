import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Heart, Eye, Clock, Calendar, Share2, BookMarked, Users } from 'lucide-react';

const BlogCard = ({ blog }) => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const {
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
    setBookmarked(savedIds.some((id) => id.toString() === blog._id));

    const sharedIds = user.sharedBlogs || [];
    setIsShared(sharedIds.some((id) => id.toString() === blog._id));
  }, [user, blog._id]);

  const handleShare = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await API.post(`/blogs/${blog._id}/share`);
      if (data.success) {
        setIsShared(true);
        if (setUser) {
          const sharedBlogs = user.sharedBlogs || [];
          setUser({ ...user, sharedBlogs: [...sharedBlogs, blog._id] });
        }
        toast.success(data.message || 'Blog shared to your feed!');
      } else {
        toast.error(data.message || 'Unable to share blog.');
      }
    } catch (error) {
      console.error('Error sharing blog:', error);
      toast.error(error.response?.data?.message || 'Unable to share blog.');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await API.put(`/users/bookmark/${blog._id}`);

      if (data?.success) {
        setBookmarked(!bookmarked);
        if (setUser) {
          const savedBlogs = user.savedBlogs || [];
          const nextSavedBlogs = bookmarked
            ? savedBlogs.filter((id) => id.toString() !== blog._id)
            : [...savedBlogs, blog._id];
          setUser({ ...user, savedBlogs: nextSavedBlogs });
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
    <article className="group flex flex-col bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Article Cover Image */}
      <Link to={`/blogs/${slug}`} className="relative block aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Category Badge overlay */}
        {category && (
          <span className="absolute top-4 left-4 inline-block text-xs font-semibold px-2.5 py-1 rounded-md glass-card bg-brand-600/90 text-white dark:bg-brand-900/90 shadow-sm">
            {category.name}
          </span>
        )}
      </Link>

      {/* Card Details */}
      <div className="flex-1 flex flex-col p-5">
        
        {/* Meta Row */}
        <div className="flex items-center space-x-4 text-xs text-text/70 dark:text-dark-text/80 mb-3">
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {formatDate(createdAt)}
          </span>
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {readTime} min read
          </span>
        </div>

        {/* Blog Title */}
        <h3 className="text-lg font-bold text-text dark:text-dark-text leading-tight mb-2 group-hover:text-primary dark:group-hover:text-dark-primary transition-colors">
          <Link to={`/blogs/${slug}`} className="line-clamp-2">
            {title}
          </Link>
        </h3>

        {/* Blog Snippet Description */}
        <p className="text-sm text-mutedText dark:text-dark-mutedText line-clamp-2 mb-4 flex-grow">
          {description}
        </p>

        {/* Shared by indicator */}
        {isShared && (
          <div className="mb-3 px-2 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <span>🔁</span> You shared this
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border dark:border-dark-border/50 my-4" />

        {/* Footer Details */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Author info */}
          <Link to={`/author/${author?._id}`} className="flex items-center space-x-2.5 group/author">
            <img
              src={author?.avatar}
              alt={author?.name}
              className="w-8 h-8 rounded-full object-cover border border-border dark:border-dark-border"
            />
            <span className="text-xs font-semibold text-text dark:text-dark-mutedText group-hover/author:text-primary dark:group-hover/author:text-dark-primary transition-colors">
              {author?.name || 'Author'}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-3 text-xs text-mutedText dark:text-dark-mutedText">
              <span className="flex items-center">
                <Eye className="w-3.5 h-3.5 mr-1 text-accent dark:text-accent" />
                {views}
              </span>
              <span className="flex items-center">
                <Heart className="w-3.5 h-3.5 mr-1 text-secondary fill-secondary/20" />
                {likes.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                type="button"
                className="p-2 rounded-full bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-text dark:text-dark-text hover:bg-muted dark:hover:bg-dark-900 transition-colors"
                aria-label="Share on feed"
              >
                <Users className="w-4 h-4" />
              </button>

              <button
                onClick={handleBookmarkToggle}
                type="button"
                className={`p-2 rounded-full border transition-colors ${bookmarked ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-surface border-border text-text hover:bg-muted dark:bg-dark-surface dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-900'}`}
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark blog'}
              >
                <BookMarked className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </article>
  );
};

export default BlogCard;
