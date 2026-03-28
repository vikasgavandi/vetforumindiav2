import React, { useState } from 'react';
import { MOCK_POSTS } from '../services/mockDatabase';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, MoreHorizontal, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateBlogDraft } from '../services/geminiService';

export const Community: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [activeTab, setActiveTab] = useState<'feed' | 'blogs'>('feed');
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  
  // AI Blog Generation State
  const [blogTopic, setBlogTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newPost: Post = {
        id: `p-${Date.now()}`,
        authorId: user.id,
        authorName: `${user.firstName} ${user.lastName}`,
        authorRole: user.role,
        content: newPostContent,
        likes: 0,
        createdAt: new Date().toISOString(),
        type: activeTab === 'feed' ? 'post' : 'blog'
    };
    setPosts([newPost, ...posts]);
    setIsCreating(false);
    setNewPostContent('');
  };

  const handleAIGenerate = async () => {
    if (!blogTopic) return;
    setIsGenerating(true);
    const generatedContent = await generateBlogDraft(blogTopic);
    setNewPostContent(generatedContent);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Community Hub</h1>
        <button 
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
        >
            + Create {activeTab === 'feed' ? 'Post' : 'Blog'}
        </button>
      </div>

      <div className="flex border-b border-slate-200">
         <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'feed' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('feed')}
         >
            Social Feed
         </button>
         <button 
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'blogs' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('blogs')}
         >
            Veterinary Blogs
         </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-slate-800 mb-4">Create New {activeTab === 'feed' ? 'Post' : 'Article'}</h3>
            
            {activeTab === 'blogs' && (
                 <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <label className="block text-xs font-bold text-purple-800 uppercase mb-2">AI Writing Assistant</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Enter a topic (e.g., 'Diabetes in Dogs')" 
                            className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-md focus:outline-purple-500"
                            value={blogTopic}
                            onChange={(e) => setBlogTopic(e.target.value)}
                        />
                        <button 
                            onClick={handleAIGenerate}
                            disabled={isGenerating || !blogTopic}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center"
                        >
                            {isGenerating ? 'Generating...' : <><PenTool size={14} className="mr-2"/> Draft with AI</>}
                        </button>
                    </div>
                 </div>
            )}

            <form onSubmit={handleCreatePost}>
                <textarea 
                    className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none h-40 resize-none mb-4"
                    placeholder={activeTab === 'feed' ? "Share something with the community..." : "Write your article content here..."}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                />
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Publish</button>
                </div>
            </form>
        </div>
      )}

      <div className="space-y-6">
        {posts
            .filter(p => activeTab === 'feed' ? p.type !== 'blog' : p.type === 'blog')
            .map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                            {post.authorName.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900">{post.authorName}</h4>
                            <p className="text-xs text-slate-500">
                                <span className="capitalize">{post.authorRole}</span> • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {post.type === 'announcement' && (
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full uppercase">Announcement</span>
                    )}
                </div>
                
                {post.title && <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>}
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-6 text-slate-500">
                    <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                        <Heart size={20} />
                        <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">Comment</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-teal-500 transition-colors">
                        <Share2 size={20} />
                        <span className="text-sm font-medium">Share</span>
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};