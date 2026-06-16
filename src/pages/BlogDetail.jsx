import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { parseMarkdown } from "../components/RichTextEditor"; // We can import it or re-declare a fast lightweight parser here
import { confirmDelete } from "../utils/confirmToast";
import API from "../utils/api";
import { BlogDetailSkeleton } from "../components/SkeletonLoader";
import {
  Heart,
  Eye,
  Clock,
  Calendar,
  Share2,
  CornerDownRight,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  ChevronLeft,
  X,
  ExternalLink,
  Link2,
} from "lucide-react";

// Custom markdown parser fallback for self-containment
const renderMarkdown = (markdown) => {
  if (!markdown) return "";
  let html = markdown;
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Basic blocks
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-surface dark:bg-dark-950 p-4 rounded-xl text-xs font-mono overflow-x-auto text-text dark:text-dark-text my-4 border border-border/50 dark:border-dark-800"><code>$1</code></pre>',
  );
  html = html.replace(
    /`([^`\n]+)`/g,
    '<code class="bg-muted dark:bg-dark-950 px-1 py-0.5 rounded text-xs font-mono text-primary dark:text-dark-primary">$1</code>',
  );
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-lg font-bold text-text dark:text-dark-text mt-5 mb-2">$1</h3>',
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-xl font-bold text-text dark:text-dark-text mt-6 mb-3">$1</h2>',
  );
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-2xl font-extrabold text-text dark:text-dark-text mt-8 mb-4">$1</h1>',
  );
  html = html.replace(
    /^> (.*?)$/gm,
    '<blockquote class="border-l-4 border-secondary pl-4 py-1 italic bg-muted/20 dark:bg-dark-950/20 text-muted dark:text-dark-muted my-4">$1</blockquote>',
  );
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img src="$2" alt="$1" class="max-w-full rounded-2xl my-6 mx-auto shadow-md border border-border/50 dark:border-dark-800" />',
  );
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary dark:text-dark-primary font-semibold underline hover:text-secondary transition-colors">$1</a>',
  );
  html = html.replace(
    /^\s*[-*]\s+(.*?)$/gm,
    '<li class="ml-6 list-disc text-text dark:text-dark-text mb-1">$1</li>',
  );
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-extrabold text-text dark:text-dark-text">$1</strong>',
  );
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(
    /^(?!<[a-z]+)/gm,
    '<p class="mb-4 text-text dark:text-dark-text leading-relaxed">$1</p>',
  );
  html = html.replace(
    /(<li>.*?<\/li>)/gs,
    '<ul class="my-4 space-y-1">$1</ul>',
  );

  // Decode basic HTML tags back so preview works
  html = html
    .replace(/&lt;a /g, "<a ")
    .replace(/&lt;\/a&gt;/g, "</a>")
    .replace(/&lt;img /g, "<img ")
    .replace(/&lt;p&gt;/g, "<p>")
    .replace(/&lt;\/p&gt;/g, "</p>");

  return html;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Engagement triggers
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shareFeedback, setShareFeedback] = useState("");

  // Comment input forms
  const [commentInput, setCommentInput] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [activeReplyBox, setActiveReplyBox] = useState(null); // ID of comment being replied to
  const [activeEditBox, setActiveEditBox] = useState(null); // ID of comment being edited
  const [editInput, setEditInput] = useState("");

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/blogs/slug/${slug}`);
      if (data.success) {
        setBlog(data.blog);
        setLikesCount(data.blog.likes.length);
        setIsLiked(user ? data.blog.likes.includes(user._id) : false);

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

  // Copy URL Share Helper
  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback("Link copied to clipboard!");
    setTimeout(() => setShareFeedback(""), 3000);
  };

  // Social Share Helpers
  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out "${blog.title}" on BlogVerse!`);
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
    );
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
    );
  };

  // Comments CRUD logic
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
          // Re-fetch comments to clear nested children recursively in database
          fetchComments(blog._id);
          toast.success("Comment deleted successfully.");
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || "Error deleting comment.";
        console.error("Error deleting comment:", error);
        toast.error(errorMessage);
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
        // Toggle user id in likes local array
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
  if (!blog) return <div className="text-center py-20">Post not found.</div>;

  // Filter root comments and their child replies
  const rootComments = comments.filter((c) => c.parentComment === null);
  const getReplies = (parentId) =>
    comments.filter((c) => c.parentComment === parentId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/blogs"
          className="inline-flex items-center text-xs font-bold text-muted hover:text-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Articles
        </Link>
      </div>

      {/* Blog Details Header */}
      <header className="space-y-4">
        {blog.category && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded bg-muted/60 text-text dark:bg-dark-surface dark:text-dark-text">
            {blog.category.name}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text dark:text-dark-text leading-tight">
          {blog.title}
        </h1>
        <p className="text-md text-muted dark:text-dark-muted">
          {blog.description}
        </p>

        {/* Author information header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-y border-border dark:border-dark-border/80 py-4 mt-6">
          <div className="flex items-center space-x-3">
            <Link to={`/author/${blog.author?._id}`}>
              <img
                src={blog.author?.avatar}
                alt={blog.author?.name}
                className="w-12 h-12 rounded-full object-cover border border-border dark:border-dark-border"
              />
            </Link>
            <div>
              <Link
                to={`/author/${blog.author?._id}`}
                className="font-bold text-text dark:text-dark-text hover:text-secondary"
              >
                {blog.author?.name}
              </Link>
              <div className="flex items-center text-xs text-muted space-x-3 mt-0.5">
                <span className="flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />{" "}
                  {new Date(blog.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" /> {blog.readTime} min
                  read
                </span>
              </div>
            </div>
          </div>

          {/* Social and Engagement Action row */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${isLiked ? "bg-secondary/10 dark:bg-secondary/5 text-secondary border-secondary/30 dark:border-secondary/20" : "bg-surface dark:bg-dark-surface text-text border-border dark:text-dark-text dark:border-dark-border hover:border-border"}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{likesCount} Likes</span>
            </button>

            <div className="relative flex items-center space-x-2 bg-muted dark:bg-dark-800 p-1 rounded-full border border-border/50 dark:border-dark-border">
              <button
                onClick={shareOnTwitter}
                className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-secondary"
                title="Share on Twitter"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-secondary"
                title="Share on LinkedIn"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={copyShareLink}
                className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-secondary"
                title="Copy link"
              >
                <Link2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {shareFeedback && (
          <div className="text-right text-xs font-bold text-primary dark:text-dark-primary animate-pulse">
            {shareFeedback}
          </div>
        )}
      </header>

      {/* Featured Banner image */}
      <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-surface border border-border/50 dark:border-dark-border">
        <img
          src={blog.image}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main post contents */}
      <article
        className="prose dark:prose-invert max-w-none text-text dark:text-dark-text leading-relaxed text-base border-b border-border dark:border-dark-border pb-12"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
      />

      {/* Author Card Info at Bottom */}
      <section className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-6 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <img
          src={blog.author?.avatar}
          alt={blog.author?.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-secondary/20 shadow"
        />
        <div className="space-y-2 flex-grow text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h4 className="font-extrabold text-lg text-text dark:text-dark-text">
              Written by {blog.author?.name}
            </h4>
            <span className="text-[10px] bg-muted dark:bg-dark-950 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-muted">
              {blog.author?.role}
            </span>
          </div>
          <p className="text-sm text-muted dark:text-dark-muted">
            {blog.author?.bio ||
              "Author on BlogVerse. Check out their recent published writings."}
          </p>
        </div>
      </section>

      {/* Threaded Comments Section */}
      <section className="space-y-6 pt-6">
        <h3 className="text-2xl font-extrabold text-text dark:text-dark-text flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-secondary dark:text-dark-secondary" />
          Discussion ({comments.length})
        </h3>

        {/* Comment Entry Area */}
        {user ? (
          <form
            onSubmit={handleAddComment}
            className="flex gap-4 items-start bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-4 rounded-2xl shadow-sm"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex-1 space-y-3">
              <textarea
                placeholder="What are your thoughts on this story? (Markdown supported)"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full min-h-[80px] text-sm p-3 rounded-xl border border-border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none focus:ring-1 focus:ring-secondary"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Comment
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-surface dark:bg-dark-surface border border-dashed border-border dark:border-dark-border p-6 rounded-2xl text-center">
            <p className="text-muted text-sm">
              Please sign in to join the conversation.
            </p>
            <Link
              to="/login"
              className="inline-block mt-3 text-xs font-bold text-white bg-primary hover:bg-secondary px-4 py-2 rounded-full"
            >
              Login to Comment
            </Link>
          </div>
        )}

        {/* Comments Feed Thread list */}
        {commentsLoading ? (
          <div className="space-y-4">
            <div className="shimmer h-12 rounded-xl" />
            <div className="shimmer h-16 rounded-xl" />
          </div>
        ) : rootComments.length === 0 ? (
          <p className="text-center text-sm text-muted py-6">
            No discussions yet. Be the first to start the thread!
          </p>
        ) : (
          <div className="space-y-6">
            {rootComments.map((comment) => {
              const replies = getReplies(comment._id);
              const hasReplied = activeReplyBox === comment._id;
              const hasEdited = activeEditBox === comment._id;

              return (
                <div key={comment._id} className="space-y-4">
                  {/* Single Root Comment */}
                  <div className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-850 p-4 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={comment.user?.avatar}
                          alt={comment.user?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-sm text-text dark:text-dark-text">
                            {comment.user?.name}
                          </span>
                          <span className="text-[9px] uppercase font-semibold text-muted dark:text-dark-muted ml-2">
                            {comment.user?.role}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Content text or Edit input form */}
                    {hasEdited ? (
                      <form
                        onSubmit={(e) => handleEditComment(e, comment._id)}
                        className="space-y-2"
                      >
                        <textarea
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="w-full text-xs p-2 rounded border dark:border-dark-800 bg-surface dark:bg-dark-surface"
                          required
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setActiveEditBox(null)}
                            className="px-2 py-1 text-[10px] border rounded text-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-2 py-1 text-[10px] bg-primary text-white rounded font-semibold"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-text dark:text-dark-text leading-relaxed whitespace-pre-line pl-1">
                        {comment.content}
                      </p>
                    )}

                    {/* Likes & Operations footer */}
                    <div className="flex items-center space-x-4 text-xs font-semibold text-muted pt-1">
                      <button
                        onClick={() => handleCommentLike(comment._id)}
                        className={`flex items-center gap-1 hover:text-secondary transition-colors ${user && comment.likes.includes(user._id) ? "text-secondary" : ""}`}
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>{comment.likes.length}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveReplyBox(hasReplied ? null : comment._id);
                          setReplyInput("");
                        }}
                        className="hover:text-secondary"
                      >
                        Reply
                      </button>

                      {/* Edit/Delete actions if owner/admin */}
                      {user &&
                        (comment.user?._id === user._id ||
                          user.role === "admin") && (
                          <div className="flex items-center space-x-3 ml-auto border-l border-border dark:border-dark-border pl-3">
                            {comment.user?._id === user._id && (
                              <button
                                onClick={() => {
                                  setActiveEditBox(comment._id);
                                  setEditInput(comment.content);
                                }}
                                className="text-muted hover:text-secondary"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-muted hover:text-secondary"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Reply Input block */}
                  {hasReplied && (
                    <form
                      onSubmit={(e) => handleAddComment(e, comment._id)}
                      className="ml-10 md:ml-12 flex gap-3 items-start bg-surface dark:bg-dark-surface border border-border dark:border-dark-border p-3 rounded-xl"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 space-y-2">
                        <textarea
                          placeholder={`Replying to ${comment.user?.name}...`}
                          value={replyInput}
                          onChange={(e) => setReplyInput(e.target.value)}
                          className="w-full min-h-[50px] text-xs p-2 rounded-lg border dark:border-dark-border bg-surface dark:bg-dark-surface text-text dark:text-dark-text focus:outline-none"
                          required
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setActiveReplyBox(null)}
                            className="px-3 py-1 text-[10px] font-bold text-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-primary hover:bg-secondary text-white rounded font-bold text-[10px]"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Render Nested Replies */}
                  {replies.length > 0 && (
                    <div className="ml-10 md:ml-12 border-l border-border dark:border-dark-border pl-4 space-y-4 pt-1">
                      {replies.map((reply) => {
                        const isRepEdit = activeEditBox === reply._id;
                        return (
                          <div
                            key={reply._id}
                            className="bg-muted/50 dark:bg-dark-surface/50 border border-border/50 dark:border-dark-850/60 p-3.5 rounded-xl space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <img
                                  src={reply.user?.avatar}
                                  alt={reply.user?.name}
                                  className="w-7 h-7 rounded-full object-cover"
                                />
                                <div>
                                  <span className="font-bold text-xs text-text dark:text-dark-text">
                                    {reply.user?.name}
                                  </span>
                                  <span className="text-[8px] bg-muted dark:bg-dark-950 text-muted px-1 ml-1.5 rounded uppercase font-bold">
                                    {reply.user?.role}
                                  </span>
                                </div>
                              </div>
                              <span className="text-[9px] text-muted">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Reply Text Body */}
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
                                  className="w-full text-xs p-2 rounded bg-surface dark:bg-dark-surface border border-border dark:border-dark-850"
                                  required
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setActiveEditBox(null)}
                                    className="px-2 py-1 text-[10px] text-muted"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-2 py-1 text-[10px] bg-primary text-white rounded"
                                  >
                                    Save
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <p className="text-xs text-text dark:text-dark-text leading-relaxed">
                                {reply.content}
                              </p>
                            )}

                            {/* Likes and actions */}
                            <div className="flex items-center space-x-3 text-[11px] font-semibold text-muted pt-1">
                              <button
                                onClick={() => handleCommentLike(reply._id)}
                                className={`flex items-center gap-1 hover:text-secondary transition-colors ${user && reply.likes.includes(user._id) ? "text-secondary" : ""}`}
                              >
                                <Heart className="w-3 h-3" />
                                <span>{reply.likes.length}</span>
                              </button>

                              {user &&
                                (reply.user?._id === user._id ||
                                  user.role === "admin") && (
                                  <div className="flex items-center space-x-2 ml-auto">
                                    {reply.user?._id === user._id && (
                                      <button
                                        onClick={() => {
                                          setActiveEditBox(reply._id);
                                          setEditInput(reply.content);
                                        }}
                                        className="text-muted hover:text-secondary"
                                      >
                                        <Edit2 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        handleDeleteComment(reply._id)
                                      }
                                      className="text-muted hover:text-secondary"
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

      {/* Related Blogs section */}
      {relatedBlogs.length > 0 && (
        <section className="pt-10 border-t border-border dark:border-dark-border">
          <h3 className="text-xl font-extrabold text-text dark:text-dark-text mb-6">
            Related Articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map((b) => (
              <div
                key={b._id}
                className="bg-surface dark:bg-dark-surface border border-border/50 dark:border-dark-850 p-4 rounded-2xl shadow-sm space-y-3"
              >
                <Link
                  to={`/blogs/${b.slug}`}
                  className="block aspect-[16/10] overflow-hidden bg-muted rounded-lg"
                >
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                  />
                </Link>
                <h4 className="font-bold text-sm text-text dark:text-dark-text line-clamp-2">
                  <Link
                    to={`/blogs/${b.slug}`}
                    className="hover:text-secondary transition-colors"
                  >
                    {b.title}
                  </Link>
                </h4>
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span>By {b.author?.name}</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-0.5" /> {b.readTime} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default BlogDetail;
