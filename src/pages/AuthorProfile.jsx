import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../utils/api";
import BlogCard from "../components/BlogCard";
import { BlogCardSkeleton } from "../components/SkeletonLoader";
import {
  Link2,
  Globe,
  Calendar,
  BookOpen,
  Award,
  ChevronLeft,
} from "lucide-react";

const AuthorProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/users/profile/${id}`);
        if (data.success) {
          setProfile(data.user);
          setPostCount(data.postCount);
        }
      } catch (err) {
        console.error("Error fetching author profile:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAuthorBlogs = async () => {
      try {
        setBlogsLoading(true);
        const { data } = await API.get(`/blogs?author=${id}`);
        if (data.success) {
          setBlogs(data.blogs);
        }
      } catch (err) {
        console.error("Error fetching author blogs:", err);
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchAuthorProfile();
    fetchAuthorBlogs();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="shimmer h-40 rounded-3xl w-full animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
          <BlogCardSkeleton />
          <BlogCardSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-lg">Author profile not found.</p>
        <Link
          to="/"
          className="inline-block mt-4 text-xs font-bold text-white bg-primary px-4 py-2 rounded-full"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Back to blogs */}
      <div className="text-left">
        <Link
          to="/blogs"
          className="inline-flex items-center text-xs font-bold text-muted hover:text-secondary transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Browse Articles
        </Link>
      </div>

      {/* Author Header Profile card */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40" />

        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-md relative z-10"
        />

        <div className="space-y-3 relative z-10 flex-grow text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.name}
            </h1>
            <span className="inline-block text-[9px] font-extrabold bg-white/20 px-2 py-0.5 rounded uppercase tracking-wider">
              {profile.role}
            </span>
          </div>

          <p className="text-sm text-surface max-w-xl leading-relaxed">
            {profile.bio || "Wrote stories and shared viewpoints on BlogVerse."}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2 text-xs text-surface">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-secondary" />
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-secondary" />
              {postCount} articles published
            </span>
          </div>
        </div>

        {/* Social connections */}
        {profile.socialLinks && (
          <div className="flex md:flex-col items-center gap-3 relative z-10 bg-dark-surface/15 p-4 rounded-2xl border border-dark-border/15 self-center md:self-auto">
            {profile.socialLinks.github && (
              <a
                href={`https://github.com/${profile.socialLinks.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                title="GitHub"
              >
                <Link2 className="w-5 h-5" />
              </a>
            )}
            {profile.socialLinks.twitter && (
              <a
                href={`https://twitter.com/${profile.socialLinks.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                title="Twitter"
              >
                <Link2 className="w-5 h-5" />
              </a>
            )}
            {profile.socialLinks.website && (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
                title="Personal Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {!profile.socialLinks.github &&
              !profile.socialLinks.twitter &&
              !profile.socialLinks.website && (
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">
                  Verified User
                </span>
              )}
          </div>
        )}
      </section>

      {/* Author published blogs */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-text dark:text-dark-text flex items-center gap-2">
          <Award className="w-6 h-6 text-secondary dark:text-dark-secondary" />
          Articles by {profile.name}
        </h2>

        {blogsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-16 text-center border border-dashed rounded-3xl border-border dark:border-dark-border">
            <p className="text-muted text-sm">
              This author hasn't published any articles yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <BlogCard key={b._id} blog={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AuthorProfile;
