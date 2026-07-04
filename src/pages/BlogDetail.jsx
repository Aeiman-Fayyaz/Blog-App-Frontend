import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { confirmDelete } from "../utils/confirmToast";
import API from "../utils/api";
import { BlogDetailSkeleton } from "../components/SkeletonLoader";
import {
  Heart,
  Eye,
  Clock,
  Calendar,
  Share2,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  ChevronLeft,
  X,
  ExternalLink,
  Link2,
  Bookmark,
  Users,
  Compass,
  ArrowRight,
  List,
  Repeat
} from "lucide-react";

// Slugify helper to map TOC hashes
const slugify = (text) => 
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// Custom markdown parser fallback that injects IDs for TOC targets
const renderMarkdown = (markdown) => {
  if (!markdown) return "";
  let html = markdown;
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headers (injecting matching IDs)
  html = html.replace(/^### (.*?)$/gm, (_, text) => {
    return `<h3 id="${slugify(text)}" class="scroll-mt-24 text-md sm:text-lg font-bold text-text dark:text-dark-text mt-8 mb-3">${text}</h3>`;
  });
  html = html.replace(/^## (.*?)$/gm, (_, text) => {
    return `<h2 id="${slugify(text)}" class="scroll-mt-24 text-lg sm:text-xl font-extrabold text-text dark:text-dark-text mt-10 mb-4 pb-2 border-b border-border/40 dark:border-dark-border/20">${text}</h2>`;
  });
  html = html.replace(/^# (.*?)$/gm, (_, text) => {
    return `<h1 id="${slugify(text)}" class="scroll-mt-24 text-xl sm:text-2xl font-black text-text dark:text-dark-text mt-12 mb-5">${text}</h1>`;
  });

  
  // Decode basic safe tags
  html = html
    .replace(/&lt;a /g, "<a ")
    .replace(/&lt;\/a&gt;/g, "</a>")
    .replace(/&lt;img /g, "<img ")
    .replace(/&lt;p&gt;/g, "<p>")
    .replace(/&lt;\/p&gt;/g, "</p>");

  return html;
};

// Extracts headings for Table of Contents
const extractHeadings = (markdown) => {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const headings = [];

  lines.forEach((line) => {
    // Look for lines starting with #, ## or ###
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      // Exclude main title if using standard Markdown # Title
      headings.push({ level, text, id });
    }
  });

  return headings;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Engagement triggers
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shareFeedback, setShareFeedback] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  // Comment inputs
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [activeReplyBox, setActiveReplyBox] = useState(null);
  const [activeEditBox, setActiveEditBox] = useState(null);
  const [editInput, setEditInput] = useState("");

  const handleScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/blogs/slug/${slug}`);
      if (data.success) {
        setBlog(data.blog);
        setLikesCount(data.blog.likes.length);
        setIsLiked(user ? data.blog.likes.includes(user._id) : false);
        setIsBookmarked(
          user && user.savedBlogs
            ? user.savedBlogs.some((id) => id.toString() === data.blog._id)
            : false,
        );
        setIsShared(
          user && user.sharedBlogs
            ? user.sharedBlogs.some((id) => id.toString() === data.blog._id)
            : false,
        );

        // Fetch related posts (same category)
        const relRes = await API.get(
          `/blogs?category=${data.blog.category._id}&limit=4`,
        );
        if (relRes.data.success) {
          // Filter out current blog post
          setRelatedBlogs(
            relRes.data.blogs
              .filter((b) => b._id !== data.blog._id)
              .slice(0, 3),
          );
        }

        // Fetch comments
        fetchComments(data.blog._id);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      navigate("/blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (blogId) => {
    try {
      setCommentsLoading(true);
      const { data } = await API.get(`/comments/blog/${blogId}`);
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogDetails();
  }, [slug, user]);

  const handleBookmarkToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data } = await API.put(`/users/bookmark/${blog._id}`);
      if (data.success) {
        const nextSavedBlogs = isBookmarked
          ? (user.savedBlogs || []).filter((id) => id.toString() !== blog._id)
          : [...(user.savedBlogs || []), blog._id];

        setIsBookmarked(!isBookmarked);
        setUser({ ...user, savedBlogs: nextSavedBlogs });
        toast.success(
          data.message ||
            (isBookmarked ? 'Removed from bookmarks.' : 'Saved to bookmarks.'),
        );
      } else {
        toast.error(data.message || 'Unable to update bookmark.');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Unable to update bookmark.');
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const { data } = await API.put(`/blogs/${blog._id}/like`);
      if (data.success) {
        setIsLiked(data.isLiked);
        setLikesCount(data.likesCount);
      }
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  // Share helpers
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback("Copied to clipboard!");
    setTimeout(() => setShareFeedback(""), 3000);
  };

  const shareOnFeed = async () => {
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

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
    );
  };

  // Comments CRUD
  const handleAddComment = async (e, parentId = null) => {
    e.preventDefault();
    const content = parentId ? replyInput : commentInput;
    if (!content.trim()) return;

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { data } = await API.post("/comments", {
        blogId: blog._id,
        content: content.trim(),
        parentComment: parentId,
      });

      if (data.success) {
        setComments((prev) => [...prev, data.comment]);
        if (parentId) {
          setReplyInput("");
          setActiveReplyBox(null);
        } else {
          setCommentInput("");
        }
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleEditComment = async (e, commentId) => {
    e.preventDefault();
    if (!editInput.trim()) return;

    try {
      const { data } = await API.put(`/comments/${commentId}`, {
        content: editInput.trim(),
      });
      if (data.success) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId ? { ...c, content: data.comment.content } : c,
          ),
        );
        setActiveEditBox(null);
        setEditInput("");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = await confirmDelete("Are you sure you want to delete this comment and its replies?");
    
    if (confirmed) {
      try {
        const { data } = await API.delete(`/comments/${commentId}`);
        if (data.success) {
          fetchComments(blog._id);
          toast.success("Comment deleted successfully.");
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Error deleting comment.");
      }
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const { data } = await API.put(`/comments/${commentId}/like`);
      if (data.success) {
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === commentId) {
              const index = c.likes.indexOf(user._id);
              const newLikes = [...c.likes];
              if (index === -1) {
                newLikes.push(user._id);
              } else {
                newLikes.splice(index, 1);
              }
              return { ...c, likes: newLikes };
            }
            return c;
          }),
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  if (loading) return <BlogDetailSkeleton />;
  if (!blog) return <div className="text-center py-24 text-mutedText">Article not found.</div>;

  const rootComments = comments.filter((c) => c.parentComment === null);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentComment === parentId);

  // Extract headings from markdown content for TOC
  const headings = extractHeadings(blog.content);

  return (
    <div className="relative pb-24">
      
      {/* Reading Progress Indicator Bar */}
      <div className="fixed top-16 left-0 right-0 h-1 bg-surface dark:bg-dark-surface/30 z-50">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-secondary"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Back Link */}
        <div className="mb-8 text-left">
          <Link
            to="/blogs"
            className="inline-flex items-center text-xs font-bold text-mutedText hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Articles
          </Link>
        </div>

        {/* Hero Section Container */}
        <header className="max-w-4xl mx-auto text-left space-y-6 mb-10">
          
          {blog.category && (
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-primary/10 text-primary">
              {blog.category.name}
            </span>
          )}

          <h1 className="text-3xl sm:text-5xl font-extrabold text-text dark:text-dark-text tracking-tight leading-tight">
            {blog.title}
          </h1>

          <p className="text-base sm:text-lg text-mutedText dark:text-dark-mutedText font-medium leading-relaxed">
            {blog.description}
          </p>

          {/* Author Details Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border/80 dark:border-dark-border/40 py-5 mt-8">
            <div className="flex items-center space-x-3.5">
              <Link to={`/author/${blog.author?._id}`}>
                <img
                  src={blog.author?.avatar}
                  alt={blog.author?.name}
                  className="w-11 h-11 rounded-full object-cover border border-border/60 dark:border-dark-border/30 hover:border-primary/50 transition-colors"
                />
              </Link>
              <div className="text-left">
                <Link
                  to={`/author/${blog.author?._id}`}
                  className="font-bold text-sm text-text dark:text-dark-text hover:text-primary transition-colors block"
                >
                  {blog.author?.name}
                </Link>
                <div className="flex items-center text-xs text-mutedText space-x-3.5 mt-1 font-semibold">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-primary/70" />
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-primary/70" />
                    {blog.readTime} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Top Share Actions Row */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLikeToggle}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  isLiked 
                    ? "bg-primary/10 text-primary border-primary/20" 
                    : "bg-surface dark:bg-dark-surface/50 text-text/80 border-border dark:text-dark-text/85 dark:border-dark-border/40 hover:border-primary/30"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                <span>{likesCount} Likes</span>
              </button>

              <div className="flex items-center space-x-1.5 bg-muted/40 dark:bg-dark-surface/50 px-2 py-1 rounded-full border border-border/60 dark:border-dark-border/40">
                <button
                  onClick={shareOnFeed}
                  disabled={isShared}
                  className={`p-1.5 rounded-full transition-colors ${
                    isShared 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-mutedText hover:text-primary hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                  title={isShared ? 'Already shared' : 'Share to feed'}
                >
                  <Repeat className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-1.5 rounded-full text-mutedText hover:text-primary hover:bg-surface dark:hover:bg-dark-surface transition-all"
                  title="Share on LinkedIn"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={copyShareLink}
                  className="p-1.5 rounded-full text-mutedText hover:text-primary hover:bg-surface dark:hover:bg-dark-surface transition-all"
                  title="Copy Link"
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleBookmarkToggle}
                  className={`p-1.5 rounded-full transition-colors ${
                    isBookmarked 
                      ? 'text-primary' 
                      : 'text-mutedText hover:text-primary hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {shareFeedback && (
            <div className="text-right text-xs font-bold text-primary animate-pulse pt-2">
              {shareFeedback}
            </div>
          )}
        </header>

        {/* Large Hero Feature Image */}
        <div className="max-w-5xl mx-auto aspect-[21/9] rounded-3xl overflow-hidden bg-muted/20 border border-border/50 dark:border-dark-border/40 mb-12">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 12-Column Layout Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Reading Content (Col span 8) */}
          <main className="lg:col-span-8 text-left">
            
            {/* Table of Contents for Mobile View (collapsible) */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-8 p-5 bg-surface/50 dark:bg-dark-surface/30 border border-border/45 dark:border-dark-border/45 rounded-2xl">
                <details className="group">
                  <summary className="flex items-center justify-between font-bold text-sm text-text dark:text-dark-text cursor-pointer select-none">
                    <span className="flex items-center gap-2">
                      <List className="w-4 h-4 text-primary" />
                      Table of Contents
                    </span>
                    <span className="transition-transform group-open:rotate-180">
                      <ChevronLeft className="w-4 h-4 -rotate-90" />
                    </span>
                  </summary>
                  <ul className="mt-4 space-y-2 border-t border-border/40 dark:border-dark-border/20 pt-4 text-xs font-semibold">
                    {headings.map((h, i) => (
                      <li 
                        key={i} 
                        style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                      >
                        <a 
                          href={`#${h.id}`}
                          className="text-mutedText hover:text-primary transition-colors block py-0.5"
                        >
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </div>
            )}

            {/* Parsed content body */}
            <article
              className="prose dark:prose-invert max-w-none text-text dark:text-dark-text leading-relaxed border-b border-border/60 dark:border-dark-border/40 pb-12"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
            />

            {/* Author Footer Bio Card */}
            <section className="bg-surface/50 dark:bg-dark-surface/20 border border-border/40 dark:border-dark-border/40 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-5 mt-10">
              <img
                src={blog.author?.avatar}
                alt={blog.author?.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-md shrink-0"
              />
              <div className="space-y-2 flex-grow text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-extrabold text-base sm:text-lg text-text dark:text-dark-text">
                    Written by {blog.author?.name}
                  </h4>
                  <span className="text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                    {blog.author?.role || 'Author'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-mutedText dark:text-dark-mutedText leading-relaxed">
                  {blog.author?.bio ||
                    "Contributor at Narrato. Follow to read the latest tech insights and comprehensive guides from this author."}
                </p>
              </div>
            </section>

            {/* Comment Discussions */}
            <section className="space-y-6 pt-12">
              <h3 className="text-xl sm:text-2xl font-extrabold text-text dark:text-dark-text flex items-center gap-2">
                <MessageSquare className="w-5.5 h-5.5 text-primary" />
                Discussions ({comments.length})
              </h3>

              {/* Comment Input */}
              {user ? (
                <form
                  onSubmit={handleAddComment}
                  className="flex gap-4 items-start bg-surface/50 dark:bg-dark-surface/20 border border-border/50 dark:border-dark-border/50 p-4 rounded-2xl shadow-sm"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-grow space-y-3">
                    <textarea
                      placeholder="What are your thoughts on this story? Markdown supported."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full min-h-[90px] text-sm p-3 rounded-xl border border-border/60 dark:border-dark-border/40 bg-surface dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Post Comment
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-surface/30 dark:bg-dark-surface/10 border border-dashed border-border dark:border-dark-border p-8 rounded-2xl text-center">
                  <p className="text-mutedText text-sm font-semibold">
                    Sign in to participate in the conversation.
                  </p>
                  <Link
                    to="/login"
                    className="inline-block mt-4 text-xs font-bold text-white bg-primary hover:bg-secondary px-5 py-2.5 rounded-full shadow-md transition-all"
                  >
                    Login to Comment
                  </Link>
                </div>
              )}

              {/* Comments Thread list */}
              {commentsLoading ? (
                <div className="space-y-4">
                  <div className="shimmer h-12 rounded-xl" />
                  <div className="shimmer h-16 rounded-xl" />
                </div>
              ) : rootComments.length === 0 ? (
                <p className="text-center text-sm text-mutedText py-8">
                  No comments yet. Write the first response!
                </p>
              ) : (
                <div className="space-y-6">
                  {rootComments.map((comment) => {
                    const replies = getReplies(comment._id);
                    const hasReplied = activeReplyBox === comment._id;
                    const hasEdited = activeEditBox === comment._id;

                    return (
                      <div key={comment._id} className="space-y-4 text-left">
                        {/* Parent Comment */}
                        <div className="bg-surface/50 dark:bg-dark-surface/20 border border-border/40 dark:border-dark-border/45 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2.5">
                              <img
                                src={comment.user?.avatar}
                                alt={comment.user?.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <span className="font-bold text-xs sm:text-sm text-text dark:text-dark-text">
                                  {comment.user?.name}
                                </span>
                                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2">
                                  {comment.user?.role || 'User'}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-mutedText">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Render Content/Edit Box */}
                          {hasEdited ? (
                            <form
                              onSubmit={(e) => handleEditComment(e, comment._id)}
                              className="space-y-2"
                            >
                              <textarea
                                value={editInput}
                                onChange={(e) => setEditInput(e.target.value)}
                                className="w-full text-xs p-2.5 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none"
                                required
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveEditBox(null)}
                                  className="px-3 py-1 text-[10px] border border-border rounded-lg text-mutedText font-semibold"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 text-[10px] bg-primary text-white rounded-lg font-bold"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="text-sm text-text dark:text-dark-text/90 leading-relaxed whitespace-pre-line pl-0.5">
                              {comment.content}
                            </p>
                          )}

                          {/* Footer options */}
                          <div className="flex items-center space-x-4 text-xs font-semibold text-mutedText pt-2">
                            <button
                              onClick={() => handleCommentLike(comment._id)}
                              className={`flex items-center gap-1 hover:text-primary transition-colors ${
                                user && comment.likes.includes(user._id) ? "text-primary" : ""
                              }`}
                            >
                              <Heart className="w-3.5 h-3.5" />
                              <span>{comment.likes.length}</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveReplyBox(hasReplied ? null : comment._id);
                                setReplyInput("");
                              }}
                              className="hover:text-primary transition-colors"
                            >
                              Reply
                            </button>

                            {/* Owner options */}
                            {user &&
                              (comment.user?._id === user._id ||
                                user.role === "admin") && (
                                <div className="flex items-center space-x-3 ml-auto border-l border-border dark:border-dark-border/40 pl-3">
                                  {comment.user?._id === user._id && (
                                    <button
                                      onClick={() => {
                                        setActiveEditBox(comment._id);
                                        setEditInput(comment.content);
                                      }}
                                      className="text-mutedText hover:text-primary"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="text-mutedText hover:text-secondary"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Reply Form Block */}
                        {hasReplied && (
                          <form
                            onSubmit={(e) => handleAddComment(e, comment._id)}
                            className="ml-10 md:ml-14 flex gap-3 items-start bg-surface/50 dark:bg-dark-surface/20 border border-border/45 dark:border-dark-border/45 p-3 rounded-2xl"
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-grow space-y-2">
                              <textarea
                                placeholder={`Replying to ${comment.user?.name}...`}
                                value={replyInput}
                                onChange={(e) => setReplyInput(e.target.value)}
                                className="w-full min-h-[60px] text-xs p-2 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none"
                                required
                              />
                              <div className="flex justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveReplyBox(null)}
                                  className="px-3 py-1 text-[10px] font-bold text-mutedText"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="px-3 py-1 bg-primary text-white rounded-lg font-bold text-[10px]"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </form>
                        )}

                        {/* Child Replies rendering */}
                        {replies.length > 0 && (
                          <div className="ml-10 md:ml-14 border-l border-border/80 dark:border-dark-border/40 pl-4 space-y-4 pt-1">
                            {replies.map((reply) => {
                              const isRepEdit = activeEditBox === reply._id;
                              return (
                                <div
                                  key={reply._id}
                                  className="bg-surface/30 dark:bg-dark-surface/10 border border-border/40 dark:border-dark-border/40 p-4 rounded-2xl space-y-2 text-left"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <img
                                        src={reply.user?.avatar}
                                        alt={reply.user?.name}
                                        className="w-6.5 h-6.5 rounded-full object-cover"
                                      />
                                      <div>
                                        <span className="font-bold text-xs text-text dark:text-dark-text">
                                          {reply.user?.name}
                                        </span>
                                        <span className="text-[7.5px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ml-1.5">
                                          {reply.user?.role || 'User'}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-[9px] text-mutedText">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {isRepEdit ? (
                                    <form
                                      onSubmit={(e) =>
                                        handleEditComment(e, reply._id)
                                      }
                                      className="space-y-2"
                                    >
                                      <textarea
                                        value={editInput}
                                        onChange={(e) => setEditInput(e.target.value)}
                                        className="w-full text-xs p-2 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border"
                                        required
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => setActiveEditBox(null)}
                                          className="px-2.5 py-0.5 text-[9px] text-mutedText font-semibold"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="submit"
                                          className="px-2.5 py-0.5 bg-primary text-white rounded font-bold text-[9px]"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </form>
                                  ) : (
                                    <p className="text-xs text-text dark:text-dark-text/90 leading-relaxed pl-0.5">
                                      {reply.content}
                                    </p>
                                  )}

                                  <div className="flex items-center space-x-3 text-[10px] font-semibold text-mutedText pt-1">
                                    <button
                                      onClick={() => handleCommentLike(reply._id)}
                                      className={`flex items-center gap-1 hover:text-primary transition-colors ${
                                        user && reply.likes.includes(user._id) ? "text-primary" : ""
                                      }`}
                                    >
                                      <Heart className="w-3 h-3" />
                                      <span>{reply.likes.length}</span>
                                    </button>

                                    {user &&
                                      (reply.user?._id === user._id ||
                                        user.role === "admin") && (
                                        <div className="flex items-center space-x-2 ml-auto border-l border-border dark:border-dark-border/40 pl-2">
                                          {reply.user?._id === user._id && (
                                            <button
                                              onClick={() => {
                                                setActiveEditBox(reply._id);
                                                setEditInput(reply.content);
                                              }}
                                              className="text-mutedText hover:text-primary"
                                            >
                                              <Edit2 className="w-2.5 h-2.5" />
                                            </button>
                                          )}
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(reply._id)
                                            }
                                            className="text-mutedText hover:text-secondary"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </section>

          </main>

          {/* Sidebar Area (Desktop only - Col span 4) */}
          <aside className="hidden lg:col-span-4 lg:flex flex-col space-y-8 text-left self-start sticky top-28">
            
            {/* Table of Contents widget */}
            {headings.length > 0 && (
              <div className="bg-surface/50 dark:bg-dark-surface/20 border border-border/40 dark:border-dark-border/40 p-6 rounded-3xl space-y-4">
                <h3 className="font-extrabold text-sm text-text dark:text-dark-text tracking-wider uppercase flex items-center gap-2">
                  <List className="w-4 h-4 text-primary" />
                  Table of Contents
                </h3>
                <ul className="space-y-3.5 text-xs font-semibold">
                  {headings.map((h, i) => (
                    <li 
                      key={i} 
                      style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
                      className="border-l border-border/60 dark:border-dark-border/20 pl-3 py-0.5 hover:border-primary transition-colors"
                    >
                      <a 
                        href={`#${h.id}`}
                        className="text-mutedText hover:text-primary transition-colors block leading-tight"
                      >
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Engagement card widget */}
            <div className="bg-surface/50 dark:bg-dark-surface/20 border border-border/40 dark:border-dark-border/40 p-6 rounded-3xl space-y-4 text-center">
              <h3 className="font-extrabold text-sm text-text dark:text-dark-text tracking-wider uppercase text-left border-b border-border/30 dark:border-dark-border/20 pb-3 mb-2">
                Share & Like
              </h3>
              
              <p className="text-xs text-mutedText leading-relaxed text-left mb-3">
                Love this story? Support the writer by saving it to your bookmarks, liking it, or sharing it with your followers.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isLiked 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-surface dark:bg-dark-surface/50 text-text/80 border-border dark:text-dark-text/85 dark:border-dark-border/40 hover:border-primary/30"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
                  <span>{likesCount}</span>
                </button>

                <button
                  onClick={handleBookmarkToggle}
                  className={`flex items-center justify-center space-x-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isBookmarked 
                      ? "bg-primary/10 border-primary text-primary dark:bg-primary/5" 
                      : "bg-surface dark:bg-dark-surface/50 text-text/85 border-border dark:text-dark-text/85 dark:border-dark-border/40 hover:border-primary/30"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{isBookmarked ? 'Bookmarked' : 'Save'}</span>
                </button>
              </div>

              <div className="pt-2 text-left">
                <button
                  onClick={shareOnFeed}
                  disabled={isShared}
                  className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold shadow-sm transition-all ${
                    isShared
                      ? 'bg-primary/10 border border-primary/20 text-primary cursor-not-allowed'
                      : 'bg-primary hover:bg-secondary text-white'
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>{isShared ? 'Shared on feed' : 'Share on feed'}</span>
                </button>
              </div>
            </div>

          </aside>

        </div>

        {/* Related / Recommended Blogs Section */}
        {relatedBlogs.length > 0 && (
          <section className="pt-16 border-t border-border/80 dark:border-dark-border/40 mt-16 max-w-7xl mx-auto">
            <div className="space-y-1 mb-8 text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold text-text dark:text-dark-text flex items-center gap-2">
                <Compass className="w-5.5 h-5.5 text-primary" />
                Related Articles
              </h3>
              <p className="text-xs sm:text-sm text-mutedText">
                Further readings from the same topic categories.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((b) => (
                <div
                  key={b._id}
                  className="group bg-surface/50 dark:bg-dark-surface/20 border border-border/40 dark:border-dark-border/40 p-4 rounded-2xl shadow-sm flex flex-col justify-between text-left hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <Link
                      to={`/blogs/${b.slug}`}
                      className="block aspect-[16/10] overflow-hidden bg-muted/20 rounded-xl"
                    >
                      <img
                        src={b.image}
                        alt={b.title}
                        className="w-full h-full object-cover hover:scale-104 transition-all duration-500"
                      />
                    </Link>
                    <h4 className="font-extrabold text-sm sm:text-base text-text dark:text-dark-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      <Link to={`/blogs/${b.slug}`}>
                        {b.title}
                      </Link>
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-mutedText font-semibold pt-4 mt-4 border-t border-border/40 dark:border-dark-border/20">
                    <span>By {b.author?.name}</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-0.5 text-primary/70" /> 
                      {b.readTime} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default BlogDetail;
