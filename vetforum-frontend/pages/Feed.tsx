import React, { useState, useRef, useEffect } from 'react';
import { MOCK_POSTS } from '../services/mockDatabase';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Send, X, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../src/config';
import { getUserAvatarUrl } from '../services/imageUtils';

const API_URL = `${API_BASE_URL}/posts`;

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showComments, setShowComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isCommenting, setIsCommenting] = useState<{ [key: string]: boolean }>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auth helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_URL, {
          headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch posts');

        const data = await response.json();
        const postData = Array.isArray(data) ? data : data.data || [];
        setPosts(postData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        // Fallback to mock data if API fails
        setPosts(MOCK_POSTS.filter(p => p.type === 'post'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newPostContent.trim() && !selectedImage)) return;

    setIsPosting(true);
    const postData = {
      content: newPostContent,
      image: selectedImage
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();
        const newPost = result.data || result;
        setPosts([newPost, ...posts]);
        setNewPostContent('');
        handleRemoveImage();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create post");
      }
    } catch (err) {
      alert("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/#/feed?post=${post.id}`;
    const shareData = {
      title: 'Vet Forum India Post',
      text: post.content?.substring(0, 100) || 'Check out this post on Vet Forum India',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showFeedback('Link copied to clipboard!');
      } catch (err) {
        showFeedback('Failed to copy link', 'error');
      }
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_URL}/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        showFeedback('Post deleted successfully');
      } else {
        const error = await response.json();
        showFeedback(error.error || 'Failed to delete post', 'error');
      }
    } catch (err) {
      showFeedback('Failed to delete post', 'error');
    }
    setActiveMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async (postId: string) => {
    const isLiked = likedPosts.has(postId);

    try {
      const response = await fetch(`${API_URL}/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const result = await response.json();

        // Update liked posts state
        setLikedPosts(prev => {
          const newSet = new Set(prev);
          if (isLiked) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });

        // Update post likes count
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, likesCount: (post.likesCount || 0) + (isLiked ? -1 : 1) }
            : post
        ));
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/${postId}/comments`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        const commentData = Array.isArray(data) ? data : data.data || [];
        setComments(prev => ({ ...prev, [postId]: commentData }));
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleCommentToggle = (postId: string) => {
    setShowComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
        if (!comments[postId]) {
          fetchComments(postId);
        }
      }
      return newSet;
    });
  };

  const handleAddComment = async (postId: string) => {
    const content = newComment[postId]?.trim();
    if (!content || isCommenting[postId]) return;

    setIsCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      const response = await fetch(`${API_URL}/${postId}/comment`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const result = await response.json();
        const newCommentData = result.data || result;
        setComments(prev => ({
          ...prev,
          [postId]: [newCommentData, ...(prev[postId] || [])]
        }));
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add comment:', errorData.message || response.statusText);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Social Feed</h1>
          <p className="text-slate-500">Connect with fellow veterinarians and pet owners.</p>
        </div>
      </div>

      {/* Create Post Widget */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4">
          {getUserAvatarUrl(user) ? (
            <img src={getUserAvatarUrl(user)!} alt="User" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
              {user.firstName?.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <form onSubmit={handleCreatePost}>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
                placeholder="What's on your mind? Share a case or ask a question..."
                rows={3}
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />

              {/* {selectedImage && (
                      <div className="relative mt-3 mb-2">
                        <img src={selectedImage} alt="Preview" className="w-full max-h-60 object-cover rounded-lg border border-slate-200" />
                        <button 
                          type="button"
                          onClick={handleRemoveImage} 
                          className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full transition-colors"
                        >
                          <X size={16}/>
                        </button>
                      </div>
                    )} */}

              <div className="flex justify-end items-center mt-3">
                {/* <input 
                          type="file" 
                          ref={fileInputRef} 
                          hidden 
                          accept="image/*" 
                          onChange={handleImageSelect} 
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2 text-sm"
                        >
                            <ImageIcon size={18} />
                            <span>Add Photo</span>
                        </button> */}
                <button
                  type="submit"
                  disabled={(!newPostContent.trim() && !selectedImage) || isPosting}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                >
                  {isPosting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Loading posts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Posts Feed */}
      {!isLoading && (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 border border-slate-200 overflow-hidden">
                    {post.author && getUserAvatarUrl(post.author) ? (
                      <img src={getUserAvatarUrl(post.author)!} className="w-full h-full object-cover" />
                    ) : (
                      (post.author?.firstName?.charAt(0) || post.authorName?.charAt(0) || 'U')
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {post.author ? `${post.author.firstName} ${post.author.lastName}` : post.authorName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className={`capitalize font-medium ${(post.author?.isVeterinarian || post.authorRole === 'veterinarian')
                        ? 'text-blue-600'
                        : 'text-slate-500'
                        }`}>
                        {post.author?.isVeterinarian ? 'Veterinarian' : (post.authorRole || 'User')}
                      </span>
                      <span>•</span>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="relative" ref={activeMenu === post.id ? menuRef : null}>
                  <button
                    onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                    className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === post.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 origin-top-right transition-all animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() => {
                          handleShare(post);
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <Share2 size={16} />
                        <span>Copy Post Link</span>
                      </button>

                      <button
                        onClick={() => {
                          showFeedback('Post reported. Thank you for keeping us safe!');
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                      >
                        <AlertCircle size={16} />
                        <span>Report Post</span>
                      </button>

                      {(user?.id === post.authorId || user?.isAdmin) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-slate-50 mt-2 transition-colors font-medium"
                        >
                          <X size={16} />
                          <span>Delete Post</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {post.content && (
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
              )}

              {(post.imageUrl || post.image) && (
                <div className="rounded-xl overflow-hidden mb-4 bg-slate-100">
                  <img
                    src={post.imageUrl || post.image}
                    alt="Post content"
                    className="w-full h-auto object-cover max-h-[500px]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <div className="flex space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors group ${likedPosts.has(post.id)
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-slate-500 hover:text-red-500'
                      }`}
                  >
                    <Heart
                      size={20}
                      className="group-hover:scale-110 transition-transform"
                      fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                    />
                    <span className="text-sm font-medium">{post.likesCount || 0}</span>
                  </button>
                  <button
                    onClick={() => handleCommentToggle(post.id)}
                    className="flex items-center space-x-2 hover:text-blue-500 transition-colors group"
                  >
                    <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.commentsCount || 0}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center space-x-2 hover:text-teal-500 transition-colors py-1 px-3 rounded-lg hover:bg-teal-50"
                >
                  <Share2 size={20} />
                  <span className="text-sm font-medium">Share</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments.has(post.id) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  {/* Add Comment */}
                  <div className="flex gap-3 mb-4">
                    {getUserAvatarUrl(user) ? (
                      <img src={getUserAvatarUrl(user)!} alt="User" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                        {user?.firstName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim() || isCommenting[post.id]}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 text-sm font-medium flex items-center gap-1"
                      >
                        {isCommenting[post.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-3">
                    {comments[post.id]?.map((comment: any) => {
                      const commentAuthor = comment.user || comment.author;
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 overflow-hidden flex-shrink-0">
                            {commentAuthor && getUserAvatarUrl(commentAuthor) ? (
                              <img src={getUserAvatarUrl(commentAuthor)!} className="w-full h-full object-cover" />
                            ) : (
                              commentAuthor?.firstName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="bg-slate-50 rounded-lg px-3 py-2">
                              <div className="font-semibold text-sm text-slate-900">
                                {commentAuthor ? `${commentAuthor.firstName || ''} ${commentAuthor.lastName || ''}`.trim() || 'User' : 'User'}
                              </div>
                              <p className="text-sm text-slate-700">{comment.content}</p>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 px-3">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {(!comments[post.id] || comments[post.id]?.length === 0) && (
                      <p className="text-slate-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {posts.length === 0 && !error && (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${toast.type === 'success'
            ? 'bg-teal-600 text-white border-teal-500'
            : 'bg-red-600 text-white border-red-500'
            }`}>
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};