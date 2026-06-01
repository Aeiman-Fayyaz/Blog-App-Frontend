import React from 'react';

// Single Blog Card Skeleton
export const BlogCardSkeleton = () => {
  return (
    <div className="border border-slate-200/60 dark:border-dark-800/80 rounded-2xl overflow-hidden bg-white dark:bg-dark-900 shadow-sm p-5 space-y-4">
      {/* Cover Image Shimmer */}
      <div className="shimmer aspect-[16/10] rounded-xl w-full" />
      
      {/* Meta Text */}
      <div className="space-y-3">
        <div className="shimmer h-3.5 rounded-full w-1/3" />
        <div className="shimmer h-5.5 rounded-full w-4/5" />
        <div className="shimmer h-3.5 rounded-full w-full" />
        <div className="shimmer h-3.5 rounded-full w-5/6" />
      </div>
      
      {/* Footer Profile Shimmer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-dark-800/50">
        <div className="flex items-center space-x-2">
          <div className="shimmer h-8 w-8 rounded-full" />
          <div className="shimmer h-3.5 rounded-full w-16" />
        </div>
        <div className="shimmer h-3.5 rounded-full w-12" />
      </div>
    </div>
  );
};

// Analytics Metrics Card Skeleton
export const MetricsSkeleton = () => {
  return (
    <div className="bg-white dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800/80 p-5 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="shimmer h-4 rounded-full w-20" />
        <div className="shimmer h-8 w-8 rounded-lg" />
      </div>
      <div className="shimmer h-8 rounded-full w-14" />
    </div>
  );
};

// Full Page Blog Detail Skeleton
export const BlogDetailSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="shimmer h-6 rounded-full w-1/4" />
      <div className="shimmer h-12 rounded-full w-3/4" />
      
      {/* Author Bar */}
      <div className="flex items-center space-x-4">
        <div className="shimmer h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <div className="shimmer h-4 rounded-full w-32" />
          <div className="shimmer h-3.5 rounded-full w-24" />
        </div>
      </div>

      {/* Banner */}
      <div className="shimmer aspect-[21/9] rounded-2xl w-full" />

      {/* Content lines */}
      <div className="space-y-3 pt-4">
        <div className="shimmer h-4 rounded-full w-full" />
        <div className="shimmer h-4 rounded-full w-full" />
        <div className="shimmer h-4 rounded-full w-5/6" />
        <div className="shimmer h-4 rounded-full w-4/5" />
        <div className="shimmer h-4 rounded-full w-full" />
      </div>
    </div>
  );
};
