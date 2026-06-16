import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { confirmDelete } from '../utils/confirmToast';
import RichTextEditor from '../components/RichTextEditor';
import { BlogCardSkeleton, MetricsSkeleton } from '../components/SkeletonLoader';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusSquare, 
  BookMarked, 
  Settings, 
  Users, 
  FolderPlus, 
  Eye, 
  Heart, 
  FileText, 
  Trash2, 
  Edit, 
  Upload, 
  Key, 
  CheckCircle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  FileEdit,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state
  const tabParam = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);

  // General state
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Author stats & blogs
  const [stats, setStats] = useState({ totalBlogs: 0, publishedBlogs: 0, draftBlogs: 0, totalViews: 0, totalLikes: 0 });
  const [myBlogs, setMyBlogs] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // Form states: Create / Edit Blog
  const [blogTitle, setBlogTitle] = useState('');
  const [blogDesc, setBlogDesc] = useState('');
  const [blogCategory, setBlogCategory] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogStatus, setBlogStatus] = useState('draft');
  const [blogImage, setBlogImage] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState('');
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSuccess, setEditorSuccess] = useState('');
  const [editorError, setEditorError] = useState('');

  // Form states: Update Profile
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileGithub, setProfileGithub] = useState(user?.socialLinks?.github || '');
  const [profileTwitter, setProfileTwitter] = useState(user?.socialLinks?.twitter || '');
  const [profileWebsite, setProfileWebsite] = useState(user?.socialLinks?.website || '');
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [profileAvatarPreview, setProfileAvatarPreview] = useState(user?.avatar || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Form states: Update Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Admin states
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalBlogs: 0, totalViews: 0, totalCategories: 0 });
  const [adminCategoryStats, setAdminCategoryStats] = useState([]);
  const [adminBlogs, setAdminBlogs] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // Admin Form: Category creation
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImage, setNewCatImage] = useState(null);
  const [newCatImagePreview, setNewCatImagePreview] = useState('');
  const [catSuccess, setCatSuccess] = useState('');
  const [catError, setCatError] = useState('');

  // Auto redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/dashboard');
    }
  }, [user, navigate]);

  // Sync tab with URL search parameter
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setActiveTab(tabName);
    // Clear alerts
    setEditorSuccess('');
    setEditorError('');
    setProfileSuccess('');
    setProfileError('');
    setPasswordSuccess('');
    setPasswordError('');
    setCatSuccess('');
    setCatError('');
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      
      // 1. Fetch Categories
      const catRes = await API.get('/categories');
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
      }

      // 2. Fetch Author stats and blogs
      const statsRes = await API.get('/blogs/dashboard/stats');
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setMyBlogs(statsRes.data.blogs);
      }

      // 3. Fetch bookmarks
      const bookRes = await API.get('/users/bookmarks');
      if (bookRes.data.success) {
        setBookmarks(bookRes.data.bookmarks);
      }

      // 4. Fetch admin stats if user is admin
      if (user.role === 'admin') {
        fetchAdminData();
      }

    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setAdminLoading(true);
      const res = await API.get('/blogs/admin/stats');
      if (res.data.success) {
        setAdminStats(res.data.stats);
        setAdminCategoryStats(res.data.categoryStats);
        setAdminBlogs(res.data.blogs);
      }

      const usersRes = await API.get('/users');
      if (usersRes.data.success) {
        setAdminUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error loading admin records:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Image previews
  const handleImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Create / Edit Article Submission
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    if (!blogTitle || !blogDesc || !blogCategory || !blogContent) {
      setEditorError('Please fill in all required post details.');
      return;
    }

    try {
      setEditorLoading(true);
      setEditorError('');
      setEditorSuccess('');

      const formData = new FormData();
      formData.append('title', blogTitle);
      formData.append('description', blogDesc);
      formData.append('category', blogCategory);
      formData.append('tags', blogTags);
      formData.append('content', blogContent);
      formData.append('status', blogStatus);
      if (blogImage) {
        formData.append('image', blogImage);
      }

      let res;
      if (editingBlogId) {
        res = await API.put(`/blogs/${editingBlogId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await API.post('/blogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        const successMessage = editingBlogId ? 'Blog updated successfully!' : 'Blog created successfully!';
        setEditorSuccess(successMessage);
        toast.success(successMessage);
        
        // Reset Editor state
        if (!editingBlogId) {
          setBlogTitle('');
          setBlogDesc('');
          setBlogCategory('');
          setBlogTags('');
          setBlogContent('');
          setBlogImage(null);
          setBlogImagePreview('');
        }
        
        // Refresh stats
        fetchDashboardData();
        
        // Timeout redirect back to blogs list
        setTimeout(() => {
          changeTab('my-blogs');
          setEditingBlogId(null);
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error occurred while saving blog.';
      setEditorError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEditorLoading(false);
    }
  };

  // Edit Trigger Helper
  const handleEditTrigger = (blog) => {
    setEditingBlogId(blog._id);
    setBlogTitle(blog.title);
    setBlogDesc(blog.description);
    setBlogCategory(blog.category?._id || blog.category);
    setBlogTags(blog.tags?.join(', ') || '');
    setBlogContent(blog.content);
    setBlogStatus(blog.status);
    setBlogImagePreview(blog.image);
    setBlogImage(null);
    changeTab('write');
  };

  // Toggle Blog Status (Publish / Unpublish)
  const handleToggleBlogStatus = async (blog) => {
    try {
      const nextStatus = blog.status === 'published' ? 'draft' : 'published';
      const { data } = await API.put(`/blogs/${blog._id}`, { status: nextStatus });
      if (data.success) {
        setMyBlogs(prev => prev.map(b => b._id === blog._id ? { ...b, status: data.blog.status } : b));
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error toggling blog status:', err);
    }
  };

  // Delete blog
  const handleDeleteBlog = async (blogId) => {
    const confirmed = await confirmDelete('Are you sure you want to delete this blog post permanently? This action cannot be undone.');
    
    if (confirmed) {
      try {
        const { data } = await API.delete(`/blogs/${blogId}`);
        if (data.success) {
          setMyBlogs(prev => prev.filter(b => b._id !== blogId));
          setAdminBlogs(prev => prev.filter(b => b._id !== blogId));
          fetchDashboardData();
          toast.success('Blog deleted successfully!', {
            position: 'top-center',
            autoClose: 3000,
          });
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error deleting blog.';
        console.error('Error deleting blog:', err);
        toast.error(errorMessage);
      }
    }
  };

  // Update Profile Submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      const formData = new FormData();
      formData.append('name', profileName);
      formData.append('bio', profileBio);
      formData.append('github', profileGithub);
      formData.append('twitter', profileTwitter);
      formData.append('website', profileWebsite);
      if (profileAvatar) {
        formData.append('avatar', profileAvatar);
      }

      const { data } = await API.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        const successMessage = 'Profile details updated successfully.';
        setProfileSuccess(successMessage);
        toast.success(successMessage);
        // Update window/local user representation if required
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile settings.';
      setProfileError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  // Update Password Submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccess('');

      const { data } = await API.put('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });

      if (data.success) {
        const successMessage = 'Password changed successfully.';
        setPasswordSuccess(successMessage);
        toast.success(successMessage);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update account password.';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  // ================= ADMIN ACTIONS =================

  // Category creation
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) {
      setCatError('Please specify a category name.');
      return;
    }
    try {
      setCatError('');
      setCatSuccess('');
      
      const formData = new FormData();
      formData.append('name', newCatName);
      formData.append('description', newCatDesc);
      if (newCatImage) {
        formData.append('image', newCatImage);
      }

      const { data } = await API.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        const successMessage = `Category "${newCatName}" created successfully!`;
        setCatSuccess(successMessage);
        toast.success(successMessage);
        setNewCatName('');
        setNewCatDesc('');
        setNewCatImage(null);
        setNewCatImagePreview('');
        fetchDashboardData();
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error occurred while creating category.';
      setCatError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (catId) => {
    const confirmed = await confirmDelete('Delete this category? This operation is non-reversible.');
    
    if (confirmed) {
      try {
        const { data } = await API.delete(`/categories/${catId}`);
        if (data.success) {
          fetchDashboardData();
          toast.success('Category deleted successfully.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete category.';
        toast.error(errorMessage);
      }
    }
  };

  // Toggle user role
  const handleToggleUserRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    const confirmed = await confirmDelete(`Change ${targetUser.name}'s role to ${nextRole}?`);
    
    if (confirmed) {
      try {
        const { data } = await API.put(`/users/${targetUser._id}/role`, { role: nextRole });
        if (data.success) {
          setAdminUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: data.user.role } : u));
          toast.success(`Role updated to ${data.user.role} for ${targetUser.name}.`);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error changing role.';
        console.error('Error changing role:', err);
        toast.error(errorMessage);
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    const confirmed = await confirmDelete('Delete this user account? All their articles will also be recursively deleted.');
    
    if (confirmed) {
      try {
        const { data } = await API.delete(`/users/${userId}`);
        if (data.success) {
          setAdminUsers(prev => prev.filter(u => u._id !== userId));
          fetchDashboardData();
          toast.success('User deleted successfully.');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Error deleting user account.';
        console.error('Error deleting user account:', err);
        toast.error(errorMessage);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR TABS CONTROLS */}
        <aside className="w-full lg:w-64 flex-shrink-0 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 p-5 rounded-2xl shadow-sm h-fit space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-border dark:border-dark-border">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="truncate text-left">
              <h3 className="font-bold text-text dark:text-dark-text truncate">{user.name}</h3>
              <span className="inline-block text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                {user.role} Member
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-accent dark:text-dark-accent tracking-wider pl-3 mb-2 text-left">Author Actions</p>
            <button
              onClick={() => changeTab('overview')}
              className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2.5" />
              Overview
            </button>
            <button
              onClick={() => changeTab('my-blogs')}
              className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'my-blogs' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
            >
              <BookOpen className="w-4 h-4 mr-2.5" />
              My Articles
            </button>
            <button
              onClick={() => {
                setEditingBlogId(null);
                setBlogTitle('');
                setBlogDesc('');
                setBlogCategory('');
                setBlogTags('');
                setBlogContent('');
                setBlogImagePreview('');
                changeTab('write');
              }}
              className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'write' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
            >
              <PlusSquare className="w-4 h-4 mr-2.5" />
              Create Article
            </button>
            <button
              onClick={() => changeTab('bookmarks')}
              className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'bookmarks' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
            >
              <BookMarked className="w-4 h-4 mr-2.5" />
              Bookmarks
            </button>
            <button
              onClick={() => changeTab('settings')}
              className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
            >
              <Settings className="w-4 h-4 mr-2.5" />
              Settings
            </button>
          </div>

          {/* ADMIN ONLY CONTROLS */}
          {user.role === 'admin' && (
            <div className="space-y-1 pt-4 border-t border-border dark:border-dark-border">
              <p className="text-[10px] uppercase font-bold text-accent dark:text-dark tracking-wider pl-3 mb-2 text-left flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                Moderation Panel
              </p>
              <button
                onClick={() => changeTab('admin-blogs')}
                className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'admin-blogs' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
              >
                <FileText className="w-4 h-4 mr-2.5" />
                Global Blogs
              </button>
              <button
                onClick={() => changeTab('admin-categories')}
                className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'admin-categories' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
              >
                <FolderPlus className="w-4 h-4 mr-2.5" />
                Categories Setup
              </button>
              <button
                onClick={() => changeTab('admin-users')}
                className={`flex w-full items-center px-3 py-2 text-sm font-semibold rounded-xl transition-all ${activeTab === 'admin-users' ? 'bg-primary/10 dark:bg-primary/5 text-primary dark:text-primary' : 'text-text hover:bg-surface dark:text-dark-text dark:hover:bg-dark-surface/40'}`}
              >
                <Users className="w-4 h-4 mr-2.5" />
                Audited Users
              </button>
            </div>
          )}
        </aside>

        {/* MAIN DASHBOARD CONTENT ROUTER VIEW */}
        <main className="flex-1 bg-surface dark:bg-dark-surface border border-border/60 dark:border-dark-border/80 p-6 md:p-8 rounded-2xl shadow-sm text-left">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricsSkeleton />
                <MetricsSkeleton />
                <MetricsSkeleton />
              </div>
              <div className="shimmer h-40 rounded-2xl w-full" />
            </div>
          ) : (
            <>
              {/* TAB 1: AUTHOR OVERVIEW / ANALYTICS */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-text dark:text-dark-text flex items-center gap-2">
                      Overview Dashboard
                    </h2>
                    <p className="text-sm text-mutedText dark:text-dark-mutedText mt-1">Analytics stats compiled from your published stories.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-50 dark:bg-dark-950 p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800/85">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Articles</span>
                        <BookOpen className="w-5 h-5 text-brand-600" />
                      </div>
                      <p className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-accent">{stats.totalBlogs}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                        {stats.publishedBlogs} Published · {stats.draftBlogs} Drafts
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-dark-950 p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800/85">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Article Views</span>
                        <Eye className="w-5 h-5 text-brand-600" />
                      </div>
                      <p className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-accent">{stats.totalViews}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold">Accumulated views across posts</div>
                    </div>

                    <div className="bg-slate-50 dark:bg-dark-950 p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800/85">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accumulated Likes</span>
                        <Heart className="w-5 h-5 text-red-500" />
                      </div>
                      <p className="text-3xl font-extrabold mt-2 text-slate-900 dark:text-accent">{stats.totalLikes}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold">Appreciation rating score</div>
                    </div>
                  </div>

                  {/* Recent Activity list */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-slate-950 dark:text-white">Recent Articles</h3>
                    {myBlogs.length === 0 ? (
                      <p className="text-sm text-slate-400 py-6 border border-dashed rounded-2xl text-center">No posts written yet. Start by creating your first article!</p>
                    ) : (
                      <div className="space-y-3">
                        {myBlogs.slice(0, 3).map(b => (
                          <div key={b._id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 rounded-xl">
                            <div className="truncate flex-1 pr-4">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-primary truncate">{b.title}</h4>
                              <span className="text-[10px] text-slate-800">{new Date(b.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`text-[14px] font-semibold px-2 py-0.5 rounded capitalize ${b.status === 'published' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'}`}>
                              {b.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MY BLOGS LISTING (CRUD TABLE) */}
              {activeTab === 'my-blogs' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Articles ({myBlogs.length})</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and audit your draft and published stories.</p>
                    </div>
                    <button 
                      onClick={() => changeTab('write')}
                      className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-sm transition-all"
                    >
                      Create Post
                    </button>
                  </div>

                  {myBlogs.length === 0 ? (
                    <div className="py-20 text-center space-y-4 border border-dashed rounded-3xl border-slate-300 dark:border-dark-800">
                      <p className="text-slate-400 text-sm">You haven't authored any articles yet.</p>
                      <button onClick={() => changeTab('write')} className="px-4 py-2 bg-brand-600 text-white rounded-full font-semibold text-xs">Write First Article</button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900">
                      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-350 uppercase bg-slate-50 dark:bg-dark-950 font-bold">
                          <tr>
                            <th scope="col" className="px-6 py-3">Title</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Views</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
                          {myBlogs.map((blog) => (
                            <tr key={blog._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-800/10">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-accent max-w-[200px] truncate">
                                {blog.title}
                              </td>
                              <td className="px-6 py-4">{blog.category?.name || 'Unassigned'}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleToggleBlogStatus(blog)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${blog.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 hover:bg-yellow-200'}`}
                                  title="Click to toggle status"
                                >
                                  {blog.status}
                                </button>
                              </td>
                              <td className="px-6 py-4 flex items-center gap-1 text-xs">
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                {blog.views}
                              </td>
                              <td className="px-4 py-4 space-x-2">
                                <button
                                  onClick={() => handleEditTrigger(blog)}
                                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-brand-500 transition-colors inline-block"
                                  title="Edit Post"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(blog._id)}
                                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-red-500 transition-colors inline-block"
                                  title="Delete Post"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WRITE / EDIT ARTICLE FORM */}
              {activeTab === 'write' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {editingBlogId ? 'Modify Blog Post' : 'Write New Article'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Compose dynamic content with rich markdown settings.</p>
                  </div>

                  {editorSuccess && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-250 text-sm font-semibold rounded-xl">
                      {editorSuccess}
                    </div>
                  )}
                  {editorError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-250 text-sm font-semibold rounded-xl">
                      {editorError}
                    </div>
                  )}

                  <form onSubmit={handleBlogSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Title */}
                      <div className="space-y-1.5 text-left md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Blog Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Mastering Next.js Security Controls"
                          value={blogTitle}
                          onChange={(e) => setBlogTitle(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          required
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1.5 text-left md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Short Description / Snippet *</label>
                        <textarea
                          placeholder="Add a compelling summary sentence that will appear in search results."
                          value={blogDesc}
                          onChange={(e) => setBlogDesc(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-dark-700 bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm h-20 resize-none"
                          required
                        />
                      </div>

                      {/* Category */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Category Topic *</label>
                        <select
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Tags (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. react, webdev, tutorial"
                          value={blogTags}
                          onChange={(e) => setBlogTags(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-700 bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        />
                      </div>

                      {/* Featured image select */}
                      <div className="space-y-1.5 text-left md:col-span-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Featured Image Cover</label>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {blogImagePreview && (
                            <div className="w-40 aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                              <img src={blogImagePreview} alt="Blog Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <label className="flex flex-col items-center justify-center border border-dashed border-slate-350 dark:border-dark-700 rounded-xl px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-950/40 transition-colors w-full sm:w-fit">
                            <Upload className="w-5 h-5 text-slate-400 mb-1" />
                            <span className="text-xs font-semibold text-brand-600">Choose Image File</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP max 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(e, setBlogImage, setBlogImagePreview)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                    </div>

                    {/* Rich text markdown editor */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-450 uppercase tracking-wider">Article Content *</label>
                      <RichTextEditor value={blogContent} onChange={setBlogContent} />
                    </div>

                    {/* Status selection and actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-dark-800 pt-6">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Save State:</label>
                        <select
                          value={blogStatus}
                          onChange={(e) => setBlogStatus(e.target.value)}
                          className="text-xs font-bold rounded bg-slate-100 dark:bg-dark-950 border-0 py-1.5 text-slate-700 dark:text-slate-500"
                        >
                          <option value="draft">Draft Save</option>
                          <option value="published">Publish Platform</option>
                        </select>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBlogId(null);
                            changeTab('my-blogs');
                          }}
                          className="px-4 py-2 text-xs font-bold text-slate-500 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-850"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editorLoading}
                          className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow disabled:opacity-50 transition-all flex items-center gap-1.5"
                        >
                          {editorLoading ? 'Saving...' : (editingBlogId ? 'Save Edits' : 'Publish Post')}
                        </button>
                      </div>
                    </div>

                  </form>
                </div>
              )}

              {/* TAB 4: BOOKMARKS */}
              {activeTab === 'bookmarks' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Bookmarked Articles</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Quick links to stories you saved for reading later.</p>
                  </div>

                  {bookmarks.length === 0 ? (
                    <p className="py-12 border border-dashed rounded-2xl text-center text-slate-400 text-sm">No articles bookmarked yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bookmarks.map((b) => (
                        <div key={b._id} className="p-4 bg-slate-50 dark:bg-dark-950 border border-slate-200/50 rounded-2xl flex items-center justify-between">
                          <div className="truncate flex-1 pr-3 text-left">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">
                              <Link to={`/blogs/${b.slug}`} className="hover:text-brand-600">{b.title}</Link>
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">By {b.author?.name} · {b.readTime} min</p>
                          </div>
                          
                          <button
                            onClick={async () => {
                              try {
                                const { data } = await API.put(`/users/bookmark/${b._id}`);
                                if (data.success) {
                                  setBookmarks(prev => prev.filter(item => item._id !== b._id));
                                }
                              } catch (err) {
                                console.error('Error toggling bookmark:', err);
                              }
                            }}
                            className="p-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg transition-colors border border-red-200/20"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: ACCOUNT SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-10">
                  {/* Part A: Profile settings */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Profile Details</h2>
                      <p className="text-xs text-slate-500 mt-1">Configure your public name, bio description, and social handles.</p>
                    </div>

                    {profileSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-xs font-semibold rounded-xl">
                        {profileSuccess}
                      </div>
                    )}
                    {profileError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 text-xs font-semibold rounded-xl">
                        {profileError}
                      </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-5">
                      <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-100 dark:border-dark-850 pb-5">
                        <img src={profileAvatarPreview} alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-slate-200" />
                        <label className="px-4 py-2 border rounded-xl text-xs font-bold text-brand-600 border-slate-200 dark:border-dark-850 hover:bg-slate-50 cursor-pointer">
                          Upload New Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, setProfileAvatar, setProfileAvatarPreview)}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Public Username</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-xl border text-primary dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                            required
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bio Biography</label>
                          <textarea
                            value={profileBio}
                            onChange={(e) => setProfileBio(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-xl border text-primary dark:border-dark-800 bg-slate-50 dark:bg-dark-950 h-20 resize-none"
                          />
                        </div>

                        {/* Social URLs */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">GitHub Username</label>
                          <input
                            type="text"
                            placeholder="e.g. octocat"
                            value={profileGithub}
                            onChange={(e) => setProfileGithub(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-xl border text-primary dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Twitter Username</label>
                          <input
                            type="text"
                            placeholder="e.g. twitterdev"
                            value={profileTwitter}
                            onChange={(e) => setProfileTwitter(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-xl border text-primary dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                          />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Website URL</label>
                          <input
                            type="url"
                            placeholder="e.g. https://mywebsite.com"
                            value={profileWebsite}
                            onChange={(e) => setProfileWebsite(e.target.value)}
                            className="w-full text-sm p-2.5 rounded-xl border text-primary dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={profileLoading}
                          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 transition-all"
                        >
                          {profileLoading ? 'Updating Details...' : 'Save Profile Changes'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Part B: Password Change */}
                  <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-dark-850">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Security Settings</h2>
                      <p className="text-xs text-slate-500 mt-1">Modify account passwords regularly to ensure credentials integrity.</p>
                    </div>

                    {passwordSuccess && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-xs font-semibold rounded-xl">
                        {passwordSuccess}
                      </div>
                    )}
                    {passwordError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 text-xs font-semibold rounded-xl">
                        {passwordError}
                      </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full text-sm p-2.5 rounded-xl border dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                          placeholder='Enter your current password'
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full text-sm p-2.5 rounded-xl border dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                          placeholder='Enter your new password'
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full text-sm p-2.5 rounded-xl border dark:border-dark-800 bg-slate-50 dark:bg-dark-950"
                          placeholder='Enter your confirm new password'
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 transition-all"
                        >
                          {passwordLoading ? 'Updating Password...' : 'Change Password'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ADMIN ONLY VIEW 1: MANAGE BLOGS */}
              {activeTab === 'admin-blogs' && user.role === 'admin' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Global Article Moderation</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit, edit, or delete any article published across the platform.</p>
                  </div>

                  {adminBlogs.length === 0 ? (
                    <p className="py-12 border border-dashed rounded-2xl text-center text-slate-400 text-sm">No blogs created on the platform yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900">
                      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 dark:text-slate-350 uppercase bg-slate-50 dark:bg-dark-950 font-bold">
                          <tr>
                            <th className="px-6 py-3">Title</th>
                            <th className="px-6 py-3">Author</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Views</th>
                            <th className="px-6 py-3">Audit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
                          {adminBlogs.map((b) => (
                            <tr key={b._id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">
                                {b.title}
                              </td>
                              <td className="px-6 py-4 truncate max-w-[120px]">{b.author?.name || 'Deleted User'}</td>
                              <td className="px-6 py-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${b.status === 'published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300'}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">{b.views}</td>
                              <td className="px-6 py-4 space-x-2">
                                <button
                                  onClick={() => handleEditTrigger(b)}
                                  className="p-1.5 text-slate-400 hover:text-brand-500"
                                  title="Edit Blog"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteBlog(b._id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500"
                                  title="Delete Blog"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN ONLY VIEW 2: MANAGE CATEGORIES */}
              {activeTab === 'admin-categories' && user.role === 'admin' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dynamic Categories Configuration</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure and manage database category filters.</p>
                  </div>

                  {/* Create Category Section */}
                  <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-200/50 dark:border-dark-800/80 space-y-4">
                    <h3 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FolderPlus className="w-4 h-4 text-brand-600" /> Add New Topic Category
                    </h3>

                    {catSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg">{catSuccess}</div>}
                    {catError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">{catError}</div>}

                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500">Category Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Technology"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border dark:border-dark-800 bg-white dark:bg-dark-900"
                            required
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500">Category Description</label>
                          <input
                            type="text"
                            placeholder="Articles relating to programming & hardware."
                            value={newCatDesc}
                            onChange={(e) => setNewCatDesc(e.target.value)}
                            className="w-full text-xs p-2.5 rounded-xl border dark:border-dark-800 bg-white dark:bg-dark-900"
                          />
                        </div>
                        <div className="space-y-1.5 text-left sm:col-span-2">
                          <label className="text-[10px] font-extrabold uppercase text-slate-500">Card Cover Image</label>
                          <div className="flex items-center gap-4">
                            {newCatImagePreview && (
                              <img src={newCatImagePreview} alt="Cat Preview" className="w-20 h-12 object-cover rounded" />
                            )}
                            <label className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-white cursor-pointer bg-slate-100 dark:bg-dark-900 dark:border-dark-800">
                              Upload File
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, setNewCatImage, setNewCatImagePreview)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-sm">
                          Create Category
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Categories list */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Categories ({categories.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((c) => (
                        <div key={c._id} className="p-4 bg-slate-50 dark:bg-dark-950 border border-slate-200/50 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center space-x-3 truncate">
                            <img src={c.image} alt={c.name} className="w-10 h-10 object-cover rounded-lg" />
                            <div className="truncate text-left">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{c.name}</h4>
                              <span className="text-[9px] text-slate-400 font-semibold">{c.count || 0} blogs published</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCategory(c._id)}
                            className="p-1.5 text-slate-400 hover:text-red-500"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN ONLY VIEW 3: MANAGE USERS */}
              {activeTab === 'admin-users' && user.role === 'admin' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">User Registry Audits</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage user authorization roles and deactivate accounts.</p>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                      <thead className="text-xs text-slate-700 dark:text-slate-350 uppercase bg-slate-50 dark:bg-dark-950 font-bold">
                        <tr>
                          <th className="px-6 py-3">User Profile</th>
                          <th className="px-6 py-3">Email Address</th>
                          <th className="px-6 py-3">Role Status</th>
                          <th className="px-6 py-3">Total Blogs</th>
                          <th className="px-6 py-3">Audit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-dark-850">
                        {adminUsers.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 flex items-center space-x-2">
                              <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                              <span className="font-bold text-slate-900 dark:text-white">{u.name}</span>
                            </td>
                            <td className="px-6 py-4 truncate max-w-[150px]">{u.email}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleUserRole(u)}
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-850 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                                title="Click to toggle user role"
                              >
                                {u.role}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold">{u.postsCount || 0}</td>
                            <td className="px-6 py-4">
                              {u._id !== user._id && (
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-1.5 text-slate-400 hover:text-red-500"
                                  title="Delete User Account"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
};

export default Dashboard;
