
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Contest, QuizQuestion, QuizOption } from '../types';
import { API_BASE_URL } from '../src/config';
import { Calendar, Clock, Trophy, Users, Award, Plus, CheckCircle, ArrowRight, Edit, X, Loader2, Trash2, CreditCard, Play } from 'lucide-react';

// Use centralized API_BASE_URL from config
const API_BASE = API_BASE_URL;

const ADMIN_API_URL = `${API_BASE}/admin/quiz-cards`;
const USER_API_URL = `${API_BASE}/quiz/available`;
const QUIZ_DETAIL_API_URL = `${API_BASE}/quiz`;
const QUIZ_NEXT_API_URL = `${API_BASE}/quiz/next`;
const QUIZ_SUBMIT_API_URL = `${API_BASE}/quiz/submit`;
const PAYMENT_API_URL = `${API_BASE}/quiz/payment`;
const JOIN_API_URL = `${API_BASE}/quiz/join`;

// Status mapping: Backend uses 'ongoing', frontend displays as 'live'
const STATUS_MAP: { [key: string]: string } = {
  'ongoing': 'live',
  'live': 'ongoing', // reverse mapping for API calls
  'upcoming': 'upcoming',
  'completed': 'completed'
};

// Mock data fallback for when API is unavailable
const MOCK_CONTESTS: Contest[] = [
  { id: '1', title: 'Veterinary Science Fundamentals', category: 'Veterinary Science', status: 'live', date: '2026-02-15', duration: '60 mins', prize: '₹15000', participants: 847, price: 299, credits: '2 CEU Credits' },
  { id: '2', title: 'Animal Science Essentials', category: 'Animal Science', status: 'live', date: '2026-02-20', duration: '45 mins', prize: '₹10000', participants: 542, price: 199, credits: '1 CEU Credits' },
  { id: '3', title: 'Advanced Veterinary Research', category: 'Veterinary Science', status: 'upcoming', date: '2026-03-01', duration: '60 mins', prize: '₹12000', participants: 0, price: 249, credits: '2 CEU Credits' },
];

export const Contests: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'completed'>('upcoming');
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<{ [key: string]: 'registered' | 'paid' | 'joined' }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Contest | null>(null);
  const [showContestDetails, setShowContestDetails] = useState(false);
  const [selectedContest, setSelectedContest] = useState<any>(null);
  const [quizState, setQuizState] = useState<{
    currentQuestion: any;
    progress: any;
    selectedAnswer: string;
    showResult: boolean;
    lastResult: any;
  }>({ currentQuestion: null, progress: null, selectedAnswer: '', showResult: false, lastResult: null });

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState(1);

  // Auth helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Check if user is admin - check multiple possible admin indicators
  const isAdmin = user?.role === UserRole.ADMIN || user?.role === 'admin' || (user as any)?.isAdmin === true;

  // Transform backend data to frontend format
  const transformContestData = (data: any[]): Contest[] => {
    const categoryMap: { [key: string]: string } = {
      'Emergency & Critical Care': 'Veterinary Science',
      'Small Animal Surgery': 'Animal Science',
      'Pharmacology': 'Veterinary Science',
      'Medicine': 'Veterinary Science',
      'Surgery': 'Animal Science',
      'Emergency': 'Veterinary Science'
    };

    return data.map(item => ({
      id: String(item.id),
      title: item.title || 'Untitled Contest',
      category: categoryMap[item.category] || item.category || 'Veterinary Science',
      status: (STATUS_MAP[item.status] || item.status || 'upcoming') as 'upcoming' | 'live' | 'completed',
      date: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      duration: item.duration ? `${item.duration} mins` : '60 mins',
      prize: item.prize || '₹10000',
      participants: item.participants || 0,
      price: parseFloat(item.price) || 0,
      credits: item.credits || `${Math.ceil((item.duration || 60) / 30)} CEU Credits`,
      questions: item.questions || [],
      description: item.description
    }));
  };

  // Fetch contests from API
  useEffect(() => {
    const fetchContests = async () => {
      try {
        setIsLoading(true);

        const token = localStorage.getItem('auth_token');
        if (!token) {
          // Use mock data when not logged in
          setContests(MOCK_CONTESTS);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Choose API URL based on user role
        const apiUrl = isAdmin ? ADMIN_API_URL : `${USER_API_URL}?status=ongoing`;

        const response = await fetch(apiUrl, {
          headers: getAuthHeaders()
        });

        if (response.status === 404) {
          console.warn('Quiz API endpoint not implemented, using mock data');
          setContests(MOCK_CONTESTS);
          setError(null);
          return;
        }

        if (response.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('auth_token');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch contests: ${response.status}`);
        }

        const data = await response.json();
        const rawData = Array.isArray(data) ? data : data.data || [];
        const transformedData = transformContestData(rawData);

        // If no data from API, use mock data
        if (transformedData.length === 0) {
          setContests(MOCK_CONTESTS);
        } else {
          setContests(transformedData);
        }
        setError(null);
      } catch (err) {
        console.error('Contest fetch error:', err);
        // Fallback to mock data on error
        setContests(MOCK_CONTESTS);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, [isAdmin]);

  // Form State
  const [formData, setFormData] = useState<Partial<Contest>>({
    title: '',
    description: '',
    category: 'Veterinary Science',
    difficulty: 'Medium',
    duration: '30 min',
    price: 0,
    credits: '1 CEU Credits',
    passingScore: 50,
    startDate: '',
    endDate: '',
    instructions: '',
    status: 'live', // Auto-set to live for new contests
    questions: []
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const filteredContests = isAdmin
    ? contests.filter(c => c.status === activeTab)
    : contests.filter(c => c.status === 'live' || c.status === 'ongoing');

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Veterinary Science',
      difficulty: 'Medium',
      duration: '30 min',
      price: 0,
      credits: '1 CEU Credits',
      passingScore: 50,
      startDate: '',
      endDate: '',
      instructions: '',
      status: 'live', // Auto-set to live for new contests
      questions: []
    });
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCreateStep(1);
    setIsEditorOpen(true);
  };

  const handleDelete = async (contestId: string) => {
    if (!isAdmin) {
      alert('Only admins can delete contests');
      return;
    }

    if (!confirm('Are you sure you want to delete this contest?')) {
      return;
    }

    try {
      const response = await fetch(`${ADMIN_API_URL}/${contestId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setContests(prev => prev.filter(c => c.id !== contestId));
      } else {
        alert('Failed to delete contest');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete contest');
    }
  };
  const handleOpenEdit = (contest: Contest) => {
    setEditingId(contest.id);
    setFormData({
      title: contest.title,
      category: contest.category,
      duration: contest.duration,
      price: contest.price,
      credits: contest.credits,
      status: contest.status
    });
    setQuestions(contest.questions || []);
    setCurrentQuestionIndex(0);
    setCreateStep(1); // Only show status update for editing
    setIsEditorOpen(true);
  };

  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      text: '',
      options: [
        { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-3`, text: '', isCorrect: false },
        { id: `opt-${Date.now()}-4`, text: '', isCorrect: false }
      ]
    };
    setQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = (questionId: string) => {
    const questionIndex = questions.findIndex(q => q.id === questionId);
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    if (currentQuestionIndex >= questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions.length - 2));
    }
  };

  const updateQuestion = (questionId: string, text: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, text } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? {
        ...q,
        options: [...q.options, { id: `opt-${Date.now()}`, text: '', isCorrect: false }]
      } : q
    ));
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? {
        ...q,
        options: q.options.filter(opt => opt.id !== optionId)
      } : q
    ));
  };

  const updateOption = (questionId: string, optionId: string, text: string, isCorrect?: boolean) => {
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? {
        ...q,
        options: q.options.map(opt =>
          opt.id === optionId ? {
            ...opt,
            text: text !== undefined ? text : opt.text,
            isCorrect: isCorrect !== undefined ? isCorrect : opt.isCorrect
          } : opt
        )
      } : q
    ));
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
      alert('Only admins can create/edit contests');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      alert('Please login to continue');
      return;
    }

    setIsCreating(true);
    const contestData = editingId ? {
      // For editing, only send status update
      status: formData.status === 'live' ? 'ongoing' : formData.status
    } : {
      // For creating, send all data including questions with status as 'live'
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      duration: parseInt(formData.duration?.toString().replace(' min', '') || '30'),
      numberOfQuestions: questions.length,
      price: parseFloat(formData.price?.toString() || '0') || 0,
      passingScore: parseInt(formData.passingScore?.toString() || '50') || 50,
      status: 'ongoing', // Backend expects 'ongoing' for live contests
      startDate: formData.startDate,
      endDate: formData.endDate,
      instructions: formData.instructions,
      questions: questions
    };

    try {
      if (editingId) {
        // Update existing contest
        const response = await fetch(`${ADMIN_API_URL}/${editingId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(contestData),
        });

        if (response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('auth_token');
          return;
        }

        if (response.ok) {
          const result = await response.json();
          const updatedContest = result.data || result;
          setContests(prev => prev.map(c => c.id === editingId ? updatedContest : c));
        } else {
          const error = await response.json();
          alert(error.message || error.error || `Failed to update contest: ${response.status}`);
          return;
        }
      } else {
        // Create new contest
        const response = await fetch(ADMIN_API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(contestData),
        });

        if (response.status === 401) {
          alert('Session expired. Please login again.');
          localStorage.removeItem('auth_token');
          return;
        }

        if (response.ok) {
          const result = await response.json();
          const newContest = result.data || result;
          setContests(prev => [...prev, newContest]);
        } else {
          const error = await response.json();
          alert(error.message || error.error || `Failed to create contest: ${response.status}`);
          return;
        }
      }

      setIsEditorOpen(false);
      setEditingId(null);
      setCreateStep(1);
    } catch (err) {
      console.error('Contest submit error:', err);
      alert("Failed to save contest. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleShowContestDetails = async (contestId: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${QUIZ_DETAIL_API_URL}/${contestId}`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedContest(data.data);
        setShowContestDetails(true);
      } else {
        alert('Failed to load contest details');
      }
    } catch (err) {
      console.error('Contest details error:', err);
      alert('Failed to load contest details');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (contestId: string, price: number) => {
    if (!user) {
      alert('Please login to register');
      return;
    }

    console.log('[QUIZ-PAYMENT] Starting payment flow:', { contestId, price });

    if (price === 0) {
      console.log('[QUIZ-PAYMENT] Free quiz detected, using join endpoint');
      handleJoinContest(contestId);
      return;
    }

    try {
      console.log('[QUIZ-PAYMENT] Initiating payment for paid quiz...');
      const paymentResponse = await fetch(PAYMENT_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ contestId: parseInt(contestId) })
      });

      const paymentData = await paymentResponse.json();
      console.log('[QUIZ-PAYMENT] Payment init response:', paymentData);

      if (!paymentResponse.ok) {
        console.error('[QUIZ-PAYMENT] Payment init failed:', paymentData);
        alert(paymentData.message || 'Failed to initiate payment');
        return;
      }

      if (paymentData.success && paymentData.data) {

        const options = {
          key: paymentData.data.razorpayKeyId,
          amount: paymentData.data.amount,
          currency: paymentData.data.currency,
          name: 'Vet Forum India',
          description: 'Contest Registration',
          order_id: paymentData.data.orderId,
          handler: async (response: any) => {
            console.log('[QUIZ-PAYMENT] Payment completed, verifying...', response);
            const verifyResponse = await fetch(`${PAYMENT_API_URL}/verify`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                contestId: parseInt(contestId),
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyResponse.json();
            console.log('[QUIZ-PAYMENT] Verification response:', verifyData);

            if (verifyResponse.ok && verifyData.success) {
              setUserRegistrations(prev => ({ ...prev, [contestId]: 'paid' }));
              alert('Payment successful! You can now start the quiz.');
            } else {
              console.error('[QUIZ-PAYMENT] Verification failed:', verifyData);
              alert(verifyData.message || 'Payment verification failed.');
            }
          },
          prefill: {
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed');
    }
  };

  const handleStartQuiz = async (contestId: string) => {
    console.log('[QUIZ-START] Initializing quiz:', { contestId });
    try {
      // Initialize/Reset quiz for this specific card
      const initResponse = await fetch(`${API_BASE}/quiz/new`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quizCardId: parseInt(contestId) })
      });

      const initData = await initResponse.json();
      console.log('[QUIZ-START] Init response:', initData);

      if (!initResponse.ok) {
        console.error('[QUIZ-START] Init failed:', initData);
        alert(initData.error || 'Failed to initialize quiz. Please ensure you are registered.');
        return;
      }

      const response = await fetch(QUIZ_NEXT_API_URL, {
        headers: getAuthHeaders()
      });

      const data = await response.json();
      console.log('[QUIZ-START] First question response:', data);

      if (response.ok) {
        if (data.quizCompleted) {
          alert('No questions available for this quiz');
          return;
        }
        setQuizState({
          currentQuestion: data.question,
          progress: data.progress,
          selectedAnswer: '',
          showResult: false,
          lastResult: null
        });
        setShowQuiz(true);
        setShowContestDetails(false);
        console.log('[QUIZ-START] Quiz started successfully');
      } else {
        console.error('[QUIZ-START] Failed to get question:', data);
        alert(data.error || 'Failed to start quiz');
      }
    } catch (err) {
      console.error('Start quiz error:', err);
      alert('Failed to start quiz');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!quizState.selectedAnswer) {
      alert('Please select an answer');
      return;
    }

    try {
      const response = await fetch(QUIZ_SUBMIT_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ answer: quizState.selectedAnswer })
      });

      if (response.ok) {
        const result = await response.json();
        setQuizState(prev => ({
          ...prev,
          showResult: true,
          lastResult: result
        }));
      }
    } catch (err) {
      console.error('Submit answer error:', err);
      alert('Failed to submit answer');
    }
  };

  const handleNextQuestion = async () => {
    if (quizState.lastResult?.progress?.isCompleted) {
      alert('Quiz completed!');
      setShowQuiz(false);
      return;
    }

    try {
      const response = await fetch(QUIZ_NEXT_API_URL, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setQuizState({
          currentQuestion: data.question,
          progress: data.progress,
          selectedAnswer: '',
          showResult: false,
          lastResult: null
        });
      }
    } catch (err) {
      console.error('Next question error:', err);
      alert('Failed to load next question');
    }
  };

  const handleJoinContest = async (contestId: string) => {
    if (!user) {
      alert('Please login to join contests');
      return;
    }

    console.log('[QUIZ-JOIN] Joining contest:', { contestId });

    setIsProcessing(true);
    try {
      const response = await fetch(JOIN_API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ contestId: parseInt(contestId) })
      });

      const data = await response.json();
      console.log('[QUIZ-JOIN] Join response:', data);

      if (response.ok && data.success) {
        setUserRegistrations(prev => ({ ...prev, [contestId]: 'paid' }));
        alert(data.message || 'Successfully joined the contest! You can now start the quiz.');
      } else {
        console.error('[QUIZ-JOIN] Join failed:', data);
        alert(data.message || 'Failed to join contest. Please try again.');
      }
    } catch (err) {
      console.error('Join error:', err);
      alert('Failed to join contest. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };



  const getButtonText = (contest: Contest) => {
    const registration = userRegistrations[contest.id];

    if (contest.status === 'completed') return 'Closed';
    if (contest.status === 'live') {
      if (registration === 'paid') return 'Start Quiz';
      return 'Register';
    }
    return 'Register';
  };

  const handleButtonClick = (contest: Contest) => {
    const registration = userRegistrations[contest.id];

    if (contest.status === 'completed') return;

    if (contest.status === 'live') {
      if (registration === 'paid') {
        handleStartQuiz(contest.id);
      } else {
        handleShowContestDetails(contest.id);
      }
    }
  };

  if (isEditorOpen) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {editingId ? 'Edit Contest' : 'Create Contest'} <span className="text-blue-500"><CheckCircle size={20} className="inline" /></span>
            </h1>
            <p className="text-slate-500 mt-1">
              {editingId ? 'Update details for this quiz card.' : 'Ready to test your knowledge and engage the community?'}
            </p>
          </div>
          <button onClick={() => setIsEditorOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Step Wizard Header */}
        <div className="flex justify-between items-center mb-8 px-12">
          <div className={`flex flex-col items-center ${createStep >= 1 ? 'text-green-600' : 'text-slate-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${createStep >= 1 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>1</div>
            <span className="text-xs font-bold uppercase">Details</span>
          </div>
          <div className="flex-1 h-[2px] bg-slate-200 mx-4 relative">
            <div className="absolute left-0 top-0 h-full bg-green-600 transition-all duration-300" style={{ width: createStep >= 2 ? '100%' : '0%' }}></div>
          </div>
          <div className={`flex flex-col items-center ${createStep >= 2 ? 'text-green-600' : 'text-slate-300'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-2 ${createStep >= 2 ? 'bg-green-600 text-white' : 'bg-slate-200'}`}>2</div>
            <span className="text-xs font-bold uppercase">Questions</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          {createStep === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Topic Category</label>
                  <select
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    disabled={editingId}
                  >
                    <option>Veterinary Science</option>
                    <option>Animal Science</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Duration</label>
                  <select
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    disabled={editingId}
                  >
                    <option>30 min</option>
                    <option>60 min</option>
                    <option>90 min</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Contest Title</label>
                <input
                  type="text"
                  placeholder="e.g. Fastest Finger First"
                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  disabled={editingId}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  placeholder="Describe what this contest covers..."
                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  disabled={editingId}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Difficulty Level</label>
                  <select
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                    disabled={editingId}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Passing Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore || ''}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setFormData({ ...formData, passingScore: isNaN(val) ? 0 : val });
                    }}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={editingId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Credits Awarded</label>
                  <input
                    type="text"
                    value={formData.credits}
                    onChange={e => setFormData({ ...formData, credits: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={editingId}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Registration Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                    }}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={editingId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={editingId}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={editingId}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Instructions</label>
                <textarea
                  placeholder="Instructions for participants..."
                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500 ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  value={formData.instructions}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  disabled={editingId}
                  rows={3}
                />
              </div>

              {editingId ? (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Contest Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-teal-500"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'live' | 'completed' })}
                  >
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ) : null}

              <div className="pt-4 flex justify-between">
                <button onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:text-slate-800 font-medium">Cancel</button>
                {editingId ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isCreating}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Contest'
                    )}
                  </button>
                ) : (
                  <button onClick={() => setCreateStep(2)} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center">
                    Next <ArrowRight size={18} className="ml-2" />
                  </button>
                )}
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">
                  Quiz Questions {questions.length > 0 && `(${currentQuestionIndex + 1} of ${questions.length})`}
                </h3>
                <button
                  onClick={addNewQuestion}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} /> Add New Question
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No questions added yet. Click "Add New Question" to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Question */}
                  <div className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Question {currentQuestionIndex + 1}</label>
                        <input
                          type="text"
                          placeholder="Type your question here..."
                          value={questions[currentQuestionIndex]?.text || ''}
                          onChange={e => updateQuestion(questions[currentQuestionIndex].id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <button
                        onClick={() => removeQuestion(questions[currentQuestionIndex].id)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove Question"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold text-slate-700">Options</label>
                        <button
                          onClick={() => addOption(questions[currentQuestionIndex].id)}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {questions[currentQuestionIndex]?.options.map((option, oIndex) => (
                          <div key={option.id} className="flex items-center gap-3">
                            <input
                              type="radio"
                              name={`correct-${questions[currentQuestionIndex].id}`}
                              checked={option.isCorrect}
                              onChange={() => {
                                questions[currentQuestionIndex].options.forEach(opt => {
                                  updateOption(questions[currentQuestionIndex].id, opt.id, opt.text, opt.id === option.id);
                                });
                              }}
                              className="text-green-600"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              value={option.text}
                              onChange={e => updateOption(questions[currentQuestionIndex].id, option.id, e.target.value)}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {questions[currentQuestionIndex].options.length > 2 && (
                              <button
                                onClick={() => removeOption(questions[currentQuestionIndex].id, option.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove Option"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Question Pagination */}
                  <div className="flex gap-2 justify-center py-4">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${index === currentQuestionIndex
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between">
                <button onClick={() => setCreateStep(1)} className="text-slate-500 hover:text-slate-800 font-medium">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={isCreating || questions.length === 0}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingId ? 'Update Contest' : 'Publish Contest'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Evolve <span className="text-blue-500"><CheckCircle size={20} className="inline" /></span>
          </h1>
          <p className="text-slate-500 mt-1">Expand Your Horizons.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
          >
            <Plus size={18} /> Create Contest
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Loading contests...</p>
        </div>
      )}

      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>User: {user ? `${user.firstName} ${user.lastName}` : 'Not logged in'}</p>
          <p>Role: {user?.role || 'N/A'}</p>
          <p>Is Admin: {isAdmin ? 'Yes' : 'No'}</p>
          <p>Auth Token: {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center">
          {error}
        </div>
      )}

      {!isLoading && (
        <>
          {/* Filter Tabs - Only show for admin */}
          {isAdmin && (
            <div className="flex gap-4 border-b border-slate-200">
              {['upcoming', 'live', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`pb-3 px-2 text-sm font-bold uppercase transition-colors border-b-2 ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredContests.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400">No {isAdmin ? activeTab : 'live'} contests found.</p>
              </div>
            ) : (
              filteredContests.map((contest) => (
                <div key={contest.id} className="bg-slate-50 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow relative group">

                  {/* Admin Edit & Delete Buttons */}
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 z-10">
                      <button
                        onClick={() => handleOpenEdit(contest)}
                        className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
                        title="Edit Contest"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(contest.id)}
                        className="p-2 bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors"
                        title="Delete Contest"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <h3 className="text-lg font-bold text-slate-800 w-full leading-tight">{contest.title}</h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1 absolute top-6 right-6 group-hover:opacity-0 transition-opacity
                                ${contest.status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' :
                          contest.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {contest.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-600"></span>}
                        {contest.status}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 font-medium">{contest.category}</p>
                    <p className="text-sm text-slate-600 mb-6 line-clamp-2">
                       {contest.description || 'Join this exciting contest to test your knowledge against top professionals.'}
                    </p>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-600 p-1 rounded"><Award size={14} /></span>
                        Intermediate
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-yellow-100 text-yellow-600 p-1 rounded"><Award size={14} /></span>
                        {contest.credits}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-600" />
                        {contest.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-green-600" />
                        {contest.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-blue-500" />
                        {contest.participants} vets
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" />
                        {contest.prize}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 flex justify-between items-center mt-auto border border-slate-100">
                    <span className="text-xl font-bold text-slate-700">₹{contest.price}</span>
                    <button
                      onClick={() => handleButtonClick(contest)}
                      disabled={isProcessing || (contest.status === 'completed') || (contest.status === 'upcoming' && userRegistrations[contest.id] === 'registered')}
                      className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2
                                ${contest.status === 'completed' || (contest.status === 'upcoming' && userRegistrations[contest.id] === 'registered')
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          : userRegistrations[contest.id] === 'joined' && contest.status === 'live'
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                            : 'bg-green-600 text-white hover:bg-green-700 shadow-md'}`}
                    >
                      {isProcessing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          {userRegistrations[contest.id] === 'joined' && contest.status === 'live' && <Play size={16} />}
                          {contest.price > 0 && !userRegistrations[contest.id] && <CreditCard size={16} />}
                          {getButtonText(contest)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Contest Details Modal */}
      {showContestDetails && selectedContest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{selectedContest.title}</h2>
                <button
                  onClick={() => setShowContestDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-slate-600">{selectedContest.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="font-semibold text-slate-700">Duration:</span>
                    <span className="ml-2 text-slate-600">{selectedContest.duration} minutes</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="font-semibold text-slate-700">Questions:</span>
                    <span className="ml-2 text-slate-600">{selectedContest.numberOfQuestions}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="font-semibold text-slate-700">Difficulty:</span>
                    <span className="ml-2 text-slate-600">{selectedContest.difficulty}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <span className="font-semibold text-slate-700">Passing Score:</span>
                    <span className="ml-2 text-slate-600">{selectedContest.passingScore}%</span>
                  </div>
                </div>

                {selectedContest.instructions && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="font-bold text-blue-900 mb-2">Instructions</h3>
                    <p className="text-blue-800 text-sm">{selectedContest.instructions}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-slate-700">₹{selectedContest.price}</span>
                <button
                  onClick={() => handlePayment(selectedContest.id, parseFloat(selectedContest.price))}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
                >
                  {parseFloat(selectedContest.price) > 0 ? (
                    <><CreditCard size={20} /> Pay & Register</>
                  ) : (
                    'Register Free'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Interface */}
      {showQuiz && quizState.currentQuestion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Question {quizState.progress?.currentQuestionNumber}</h2>
                  <p className="text-slate-500">Progress: {quizState.progress?.totalQuestionsAnswered} answered</p>
                </div>
                <button
                  onClick={() => setShowQuiz(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">{quizState.currentQuestion.question}</h3>

                <div className="space-y-3">
                  {Object.entries(quizState.currentQuestion.options).map(([key, value]) => (
                    <label key={key} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="answer"
                        value={key}
                        checked={quizState.selectedAnswer === key}
                        onChange={(e) => setQuizState(prev => ({ ...prev, selectedAnswer: e.target.value }))}
                        className="mr-3"
                        disabled={quizState.showResult}
                      />
                      <span className="font-medium text-slate-700 mr-2">{key}.</span>
                      <span className="text-slate-600">{value as string}</span>
                    </label>
                  ))}
                </div>
              </div>

              {quizState.showResult && quizState.lastResult && (
                <div className={`p-4 rounded-xl mb-6 ${quizState.lastResult.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-bold ${quizState.lastResult.isCorrect ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {quizState.lastResult.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </span>
                    {!quizState.lastResult.isCorrect && (
                      <span className="text-slate-600">Correct answer: {quizState.lastResult.correctAnswer}</span>
                    )}
                  </div>
                  {quizState.lastResult.explanation && (
                    <p className="text-slate-600 text-sm">{quizState.lastResult.explanation}</p>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <div className="text-sm text-slate-500">
                  Score: {quizState.lastResult?.progress?.scorePercentage || 0}%
                </div>
                <div className="flex gap-3">
                  {!quizState.showResult ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!quizState.selectedAnswer}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      {quizState.lastResult?.progress?.isCompleted ? 'Finish Quiz' : 'Next Question'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
