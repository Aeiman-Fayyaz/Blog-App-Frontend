import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Clock, Calendar } from 'lucide-react';

const BlogCard = ({ blog }) => {
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
  } = blog;

  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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

        {/* Divider */}
        <div className="border-t border-border dark:border-dark-border/50 my-4" />

        {/* Footer Details */}
        <div className="flex items-center justify-between">
          
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

          {/* Engagement stats */}
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

        </div>

      </div>
    </article>
  );
};

export default BlogCard;
