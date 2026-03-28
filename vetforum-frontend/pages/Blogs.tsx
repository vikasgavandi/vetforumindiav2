import React, { useState, useRef, useEffect } from 'react';
import { MOCK_POSTS } from '../services/mockDatabase';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { API_BASE_URL } from '../src/config';
import { generateBlogDraft } from '../services/geminiService';
import { getUserAvatarUrl } from '../services/imageUtils';
import { PenTool, ArrowUpRight, Search, BookOpen, Image as ImageIcon, X, Loader2, Edit3, Trash2 } from 'lucide-react';
const API_URL = `${API_BASE_URL}/blogs`;

export const Blogs: React.FC = () => {
  const { user } = useAuth();
  //   const [blogs, setBlogs] = useState<Post[]>(MOCK_POSTS.filter(p => p.type === 'blog'));
  const [blogs, setBlogs] = useState<Post[]>([]); // Start with empty array
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [editingId, setEditingId] = useState<number | null>(null); // New state for editing
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSubtitle, setBlogSubtitle] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI State
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (featuredImage: string | null | undefined) => {
    if (!featuredImage) {
      return `https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600&auto=format&fit=crop`;
    }

    // If it's already a full URL (starts with http), return as is
    if (featuredImage.startsWith('http') || featuredImage.startsWith('data:')) {
      return featuredImage;
    }

    // If it's just a filename, construct the full URL
    const baseUrl = API_BASE_URL.replace('/api/vetforumindia/v1', '');
    return `${baseUrl}/uploads/blogs/${featuredImage}`;
  };

  // Auth helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Helper to normalize tags from any format (string, JSON string, or array)
  const normalizeTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        return Array.isArray(parsed) ? parsed : [tags];
      } catch {
        // Not JSON, maybe comma-separated or just a single tag
        return tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    }
    return [];
  };

  // --- API FETCH LOGIC ---
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch blogs');

        const data = await response.json();
        // Assuming the API returns the array directly or in a 'data' property
        const blogPosts = Array.isArray(data) ? data : data.data || [];
        console.log("Fetched blogs:", blogPosts);
        setBlogs(blogPosts);
        // Filter for blog type if your API returns mixed posts
        // setBlogs(blogPosts.filter((p: Post) => p.type === 'blog'));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const tagsArray = blogTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const formData = new FormData();
    formData.append('title', blogTitle);
    formData.append('subtitle', blogSubtitle || '');
    formData.append('content', blogContent);
    formData.append('excerpt', 'Short excerpt');

    // Append tags
    if (tagsArray.length > 0) {
      formData.append('tags', JSON.stringify(tagsArray));
    } else {
      formData.append('tags', JSON.stringify(["general"]));
    }

    // Append image file if selected
    if (fileInputRef.current?.files?.[0]) {
      formData.append('featuredImage', fileInputRef.current.files[0]);
    } else if (selectedImage && selectedImage.startsWith('http')) {
      // If it's an existing URL (editing without changing image), we might need to handle it or just not send it
      // The backend only updates if featuredImage is present. sent as string if not file
      formData.append('featuredImage', selectedImage);
    } else if (selectedImage && selectedImage.startsWith('data:')) {
      // Fallback for drag-drop or non-file-input sources if any (though we used file input)
      formData.append('featuredImage', selectedImage);
    }

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      // Headers: Do NOT set Content-Type for FormData, browser does it with boundary
      const headers = {
        ...(user ? { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` } : {})
      };

      const response = await fetch(url, {
        method,
        headers,
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const savedBlog = result.data || result;
        if (editingId) {
          setBlogs(prev => prev.map(b => b.id === editingId ? savedBlog : b));
        } else {
          setBlogs([savedBlog, ...blogs]);
        }
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save blog");
      }
    } catch (err) {
      alert("Failed to save blog. Please try again.");
    }
  };

  const handleEditInitiation = async (post: any) => {
    try {
      // Fetch full blog content for editing
      const response = await fetch(`${API_URL}/${post.id}`);
      if (response.ok) {
        const fullBlog = await response.json();
        const blogData = fullBlog.data || fullBlog;

        setEditingId(blogData.id);
        setBlogTitle(blogData.title);
        setBlogSubtitle(blogData.subtitle || '');
        setBlogTags(blogData.tags ? blogData.tags.join(', ') : '');
        setBlogContent(blogData.content); // Use full content from API
        setSelectedImage(blogData.featuredImage);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Failed to load blog for editing');
      }
    } catch (err) {
      alert('Error loading blog content');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        setBlogs(prev => prev.filter(b => b.id !== id));
        if (editingId === id) resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Delete failed");
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setBlogTitle('');
    setBlogSubtitle('');
    setBlogTags('');
    setBlogContent('');
    setSelectedImage(null);
  };

  const handleBlogClick = (blog: any) => {
    setSelectedBlog(blog);
  };

  const canEditBlog = (blog: any) => {
    return user && (user.id === blog.authorId || user.id === blog.author?.id || user.isAdmin);
  };

  const handleAIGenerate = async () => {
    if (!aiTopic) return;
    setIsGenerating(true);
    const generatedContent = await generateBlogDraft(aiTopic);
    setBlogContent(generatedContent);
    setBlogTitle(`Guide to ${aiTopic}`); // Auto-suggest title
    setIsGenerating(false);
  };

  // Blog Reading View
  if (selectedBlog) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header Image */}
          <div className="h-64 md:h-80 overflow-hidden bg-slate-100 relative">
            <img
              src={getImageUrl(selectedBlog.featuredImage)}
              alt={selectedBlog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600&auto=format&fit=crop`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={20} />
            </button>
            {canEditBlog(selectedBlog) && (
              <button
                onClick={() => {
                  setSelectedBlog(null);
                  setEditingId(selectedBlog.id);
                  setBlogTitle(selectedBlog.title);
                  setBlogSubtitle(selectedBlog.subtitle || '');
                  setBlogTags(selectedBlog.tags ? selectedBlog.tags.join(', ') : '');
                  setBlogContent(selectedBlog.content);
                  setSelectedImage(selectedBlog.featuredImage);
                  setIsCreating(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <Edit3 size={20} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {normalizeTags(selectedBlog.tags).map((tag: string, index: number) => (
                <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {selectedBlog.title}
            </h1>

            {/* Subtitle */}
            {selectedBlog.subtitle && (
              <p className="text-xl text-slate-600 mb-6 leading-relaxed">
                {selectedBlog.subtitle}
              </p>
            )}

            {/* Author & Date */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold text-slate-600 border border-slate-300 overflow-hidden">
                {selectedBlog.author && getUserAvatarUrl(selectedBlog.author) ? (
                  <img src={getUserAvatarUrl(selectedBlog.author)!} className="w-full h-full object-cover" />
                ) : (
                  selectedBlog.author?.firstName?.charAt(0) || 'A'
                )}
              </div>
              <div>
                <div className="font-semibold text-slate-900">
                  {selectedBlog.author?.firstName} {selectedBlog.author?.lastName}
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(selectedBlog.publishedAt || selectedBlog.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} • {selectedBlog.readTime || '5'} min read
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {selectedBlog.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Veterinary Insights <BookOpen className="text-green-600" size={24} />
          </h1>
          <p className="text-slate-500 mt-1">Read expert articles or share your own knowledge.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="mt-4 md:mt-0 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg shadow-green-600/20 transition-all flex items-center gap-2"
        >
          <PenTool size={18} /> Write Article
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Draft New Article</h3>

          {/* AI Assistant */}
          <div className="mb-6 p-5 bg-purple-50 rounded-xl border border-purple-100">
            <label className="block text-xs font-bold text-purple-700 uppercase mb-3 flex items-center gap-2">
              <span className="bg-purple-200 text-purple-800 p-1 rounded">AI</span> Writing Assistant
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter a topic (e.g., 'Diabetes management in older cats')"
                className="flex-1 px-4 py-3 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiTopic}
                className="px-6 py-3 bg-purple-600 text-white text-sm rounded-lg font-bold hover:bg-purple-700 disabled:opacity-70 flex items-center shadow-md shadow-purple-600/20 transition-all"
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Writing...</span>
                ) : (
                  <><PenTool size={16} className="mr-2" /> Generate Draft</>
                )}
              </button>
            </div>
            <p className="text-xs text-purple-600 mt-2">AI can draft a structured article for you to edit.</p>
          </div>

          <form onSubmit={handleCreateBlog} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Article Title</label>
              <input
                type="text"
                required
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-medium"
                placeholder="Enter a catchy title..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={blogSubtitle}
                onChange={(e) => setBlogSubtitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Brief description of your article..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tags</label>
              <input
                type="text"
                value={blogTags}
                onChange={(e) => setBlogTags(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Enter tags separated by commas (e.g., surgery, cats, emergency)"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageSelect}
              />
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-green-500 hover:text-green-600 transition-colors bg-slate-50"
                >
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-sm font-medium">Click to upload cover image</span>
                </div>
              ) : (
                <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                  <img src={selectedImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
              <textarea
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none h-64 resize-y leading-relaxed"
                placeholder="Write your article content here..."
                value={blogContent}
                onChange={(e) => setBlogContent(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <div>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingId)}
                    className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={18} /> Delete Permanently
                  </button>
                )}
              </div>
              <button type="button" onClick={() => resetForm()} className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" className="px-8 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-md shadow-green-600/20 transition-all">{editingId ? 'Update Article' : 'Publish Article'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Loading & Error States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Fetching the latest articles...</p>
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">{error}</div>}

      {/* Blog Grid - Mapping the Backend Response */}
      {!isLoading && !error && !isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <div key={post.id} onClick={() => handleBlogClick(post)} className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer">
              <div className="h-48 overflow-hidden bg-slate-100 relative">
                <img
                  src={getImageUrl(post.featuredImage)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=600&auto=format&fit=crop`;
                  }}
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-teal-700 shadow-sm uppercase tracking-wide">
                  {normalizeTags(post.tags)[0] || 'Medical'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-xs text-slate-400 font-medium">{post.readTime} min read</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-green-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed flex-1">
                  {post.subtitle || post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-300 overflow-hidden">
                      {post.author && getUserAvatarUrl(post.author) ? (
                        <img src={getUserAvatarUrl(post.author)!} className="w-full h-full object-cover" />
                      ) : (
                        post.author?.firstName?.charAt(0) || 'A'
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate max-w-[100px]">
                      {post.author?.firstName} {post.author?.lastName}
                    </span>
                  </div>
                  {/* <span className="flex items-center text-green-600 text-xs font-bold group-hover:translate-x-1 transition-transform">
                                        Read More <ArrowUpRight size={14} className="ml-1" />
                                    </span> */}

                  {canEditBlog(post) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditInitiation(post);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
                    >
                      <Edit3 size={16} /> Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && blogs.length === 0 && !error && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Articles Yet</h3>
          <p className="text-slate-500">Be the first to publish an article on the platform.</p>
        </div>
      )}
    </div>
  );
};