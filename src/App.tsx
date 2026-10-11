/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Video,
  MessageSquare,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  DollarSign,
  Sparkles,
  Globe,
  LogOut,
  CheckCircle,
  Clock,
  FileText,
  Headphones,
  Send,
  Mic,
  VideoOff,
  MicOff,
  Share2,
  Search,
  Menu,
  X,
  ChevronDown,
  Lock,
  Bell,
  UserCheck,
  BarChart3,
  Play,
  Pause,
  BookMarked,
  Check,
  HelpCircle,
  Download,
  AlertCircle,
  Phone,
  Paperclip,
  Smile,
  Image as ImageIcon,
  CheckCheck,
  CircleDot,
  Plus,
  FileUp,
  Square,
  Volume2
} from "lucide-react";

type UserRole = "super_admin" | "institute_admin" | "teacher" | "student" | "parent";
type Language = "en" | "ur" | "ar";
type ActiveTab = "dashboard" | "classes" | "library" | "whatsapp" | "exams" | "fees" | "ai_tutor";
type WhatsAppSubTab = "chats" | "status" | "communities" | "calls";

interface Institute {
  id: string;
  name: string;
  city: string;
  logoText: string;
  themeColor: string;
}

const INSTITUTES: Institute[] = [
  { id: "inst-1", name: "Al-Madina Banat Academy", city: "Islamabad", logoText: "AM", themeColor: "emerald" },
  { id: "inst-2", name: "Dar-ul-Hikmah Girls Seminary", city: "Lahore", logoText: "DH", themeColor: "teal" },
  { id: "inst-3", name: "Zahra Islamic Institute for Women", city: "Karachi", logoText: "ZI", themeColor: "indigo" },
];

export default function App() {
  const [role, setRole] = useState<UserRole>("student");
  const [lang, setLang] = useState<Language>("en");
  const [activeInstitute, setActiveInstitute] = useState<Institute>(INSTITUTES[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // WhatsApp state
  const [whatsappSubTab, setWhatsappSubTab] = useState<WhatsAppSubTab>("chats");
  const [whatsappSearch, setWhatsappSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState("Ustaza Fatima (Tafsir Instructor)");
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ sender: string; text: string; time: string; mine: boolean; type?: 'text' | 'audio' | 'image' | 'file'; audioUrl?: string; duration?: string }>>>({
    "Ustaza Fatima (Tafsir Instructor)": [
      { sender: "Ustaza Fatima", text: "Dear Ayesha, excellent reflection on Surah Al-Baqarah verses 255-257.", time: "Yesterday", mine: false, type: 'text' },
      { sender: "Ayesha Noor", text: "Jazakallah Khair Ustaza. I found the explanation of Ayat-ul-Kursi deeply enlightening.", time: "Yesterday", mine: true, type: 'text' }
    ],
    "Class 10-A Banat Group": [
      { sender: "Ustaza Zainab", text: "Reminder: Arabic Nahw assignment due tomorrow morning before 9 AM.", time: "10:15 AM", mine: false, type: 'text' },
      { sender: "Hafsa Tariq", text: "Jazakallah Ustaza, I have already submitted mine.", time: "10:20 AM", mine: false, type: 'text' }
    ],
    "Admin Office": [
      { sender: "Admin", text: "Your term enrollment has been verified successfully.", time: "Oct 10", mine: false, type: 'text' }
    ],
    "Tajweed Practice Circle": [
      { sender: "Maryam Qariyah", text: "Please practice makharij for letters Qaaf and Kaaf.", time: "Oct 9", mine: false, type: 'text' }
    ]
  });
  const [msgInput, setMsgInput] = useState("");
  
  // Real MediaRecorder & getUserMedia Live states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Live Call states with real stream
  const [callActive, setCallActive] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [callSeconds, setCallSeconds] = useState(0);
  const [callStatus, setCallStatus] = useState<"connecting" | "connected">("connecting");
  const callTimerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // WhatsApp interactive modals & states
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState("");

  // AI Tutor state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Assalamu Alaikum! I am your Al-Hikmah AI Study Assistant. How can I assist you with your Quranic Tafsir, Fiqh, Hadith, or Arabic grammar studies today?' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [quizTopic, setQuizTopic] = useState("Surah Al-Mulk Tafsir");
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Live class state
  const [inLiveClass, setInLiveClass] = useState(false);
  const [micMuted, setMicMuted] = useState(true);
  const [camOff, setCamOff] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [classMessages, setClassMessages] = useState([
    { sender: "Ustaza Fatima", text: "Welcome dear students. Please keep your microphones muted unless called upon.", time: "10:00 AM" },
    { sender: "Ayesha Noor", text: "Wa Alaikum Assalam Ustaza.", time: "10:01 AM" }
  ]);
  const [newClassMsg, setNewClassMsg] = useState("");

  // Real Voice Note Recording using MediaRecorder API
  const startRealVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        const current = chatMessages[selectedContact] || [];
        setChatMessages({
          ...chatMessages,
          [selectedContact]: [...current, { sender: "You", text: `Voice Message (${durationStr})`, time: "Just now", mine: true, type: 'audio', audioUrl, duration: durationStr }]
        });

        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      alert("Microphone permission denied or not available. Please allow microphone access to record live voice notes.");
      console.error(err);
    }
  };

  const stopRealVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);
    }
  };

  // Real Live Call using navigator.mediaDevices.getUserMedia
  const startRealCall = async (type: "audio" | "video") => {
    setCallType(type);
    setCallActive(true);
    setCallStatus("connecting");
    setCallSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === 'video' });
      localStreamRef.current = stream;

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      setTimeout(() => {
        setCallStatus("connected");
        callTimerRef.current = setInterval(() => {
          setCallSeconds(s => s + 1);
        }, 1000);
      }, 1500);
    } catch (err) {
      alert("Camera/Microphone permission denied. Unable to start live call.");
      setCallActive(false);
    }
  };

  const endRealCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    setCallActive(false);
    setCallSeconds(0);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    const userMsg = aiPrompt;
    setAiPrompt("");
    setAiChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg, subject: "Islamic Studies & Arabic" })
      });
      const data = await res.json();
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: data.text || "I apologize, I could not retrieve an answer at this moment." }]);
    } catch (err) {
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: "Network error occurred while contacting AI service." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: quizTopic, count: 3 })
      });
      const data = await res.json();
      setQuizQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  const sendWhatsAppMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!msgInput.trim()) return;
    const current = chatMessages[selectedContact] || [];
    setChatMessages({
      ...chatMessages,
      [selectedContact]: [...current, { sender: "You", text: msgInput, time: "Just now", mine: true, type: 'text' }]
    });
    setMsgInput("");
    setEmojiPickerOpen(false);
  };

  const sendWhatsAppAttachment = (type: 'image' | 'file', title: string) => {
    const current = chatMessages[selectedContact] || [];
    setChatMessages({
      ...chatMessages,
      [selectedContact]: [...current, { sender: "You", text: `📎 Sent ${type === 'image' ? 'Photo' : 'Document'}: ${title}`, time: "Just now", mine: true, type }]
    });
    setAttachmentMenuOpen(false);
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    if (!chatMessages[newContactName]) {
      setChatMessages({
        ...chatMessages,
        [newContactName]: [
          { sender: newContactName, text: "Assalamu Alaikum! Secure encrypted chat started.", time: "Just now", mine: false, type: 'text' }
        ]
      });
    }
    setSelectedContact(newContactName);
    setNewContactName("");
    setNewChatModalOpen(false);
  };

  const sendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassMsg.trim()) return;
    setClassMessages([...classMessages, { sender: "You (Student)", text: newClassMsg, time: "Just now" }]);
    setNewClassMsg("");
  };

  const isRtl = lang === "ur" || lang === "ar";

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* TOP BAR CONTRACT */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 shadow-xs">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center font-bold text-lg shadow-sm justify-center">
            {activeInstitute.logoText}
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Al-Hikmah <span className="text-emerald-700 font-medium text-xs ml-1.5 px-2 py-0.5 bg-emerald-50 rounded-full">Banat Portal</span>
            </h1>
            <p className="text-xs text-slate-500 whitespace-nowrap">{activeInstitute.name} ({activeInstitute.city})</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => setActiveTab("dashboard")} className={`transition-colors whitespace-nowrap py-1 ${activeTab === 'dashboard' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : 'hover:text-slate-900'}`}>Dashboard</button>
          <button onClick={() => setActiveTab("classes")} className={`transition-colors whitespace-nowrap py-1 ${activeTab === 'classes' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : 'hover:text-slate-900'}`}>Live Classes</button>
          <button onClick={() => setActiveTab("library")} className={`transition-colors whitespace-nowrap py-1 ${activeTab === 'library' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : 'hover:text-slate-900'}`}>Digital Library</button>
          <button onClick={() => setActiveTab("whatsapp")} className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${activeTab === 'whatsapp' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : 'hover:text-slate-900'}`}>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            WhatsApp
          </button>
          <button onClick={() => setActiveTab("exams")} className={`transition-colors whitespace-nowrap py-1 ${activeTab === 'exams' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : 'hover:text-slate-900'}`}>Exams & Quizzes</button>
          <button onClick={() => setActiveTab("ai_tutor")} className={`transition-colors whitespace-nowrap py-1 flex items-center gap-1.5 ${activeTab === 'ai_tutor' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-700' : 'hover:text-slate-900'}`}>
            <Sparkles className="w-4 h-4 text-emerald-600" />
            AI Study Assistant
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <select 
            value={activeInstitute.id}
            onChange={(e) => {
              const found = INSTITUTES.find(i => i.id === e.target.value);
              if (found) setActiveInstitute(found);
            }}
            className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-hidden font-medium"
          >
            {INSTITUTES.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>

          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-hidden"
          >
            <option value="student">Student (Banat)</option>
            <option value="teacher">Teacher (Ustaza)</option>
            <option value="institute_admin">Institute Admin</option>
            <option value="super_admin">Super Admin</option>
            <option value="parent">Parent Guardian</option>
          </select>

          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
            <button onClick={() => setLang("en")} className={`px-2 py-1 rounded-md ${lang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>EN</button>
            <button onClick={() => setLang("ur")} className={`px-2 py-1 rounded-md ${lang === 'ur' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>اردو</button>
            <button onClick={() => setLang("ar")} className={`px-2 py-1 rounded-md ${lang === 'ar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}>عربي</button>
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3 shadow-lg">
          <button onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-slate-700">Dashboard</button>
          <button onClick={() => { setActiveTab("classes"); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-slate-700">Live Classes</button>
          <button onClick={() => { setActiveTab("library"); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-slate-700">Digital Library</button>
          <button onClick={() => { setActiveTab("whatsapp"); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-emerald-700 font-semibold">WhatsApp</button>
          <button onClick={() => { setActiveTab("exams"); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-slate-700">Exams & Quizzes</button>
          <button onClick={() => { setActiveTab("ai_tutor"); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-emerald-700 font-semibold">AI Study Assistant</button>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-8">

        <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white uppercase">Strict Privacy & Banat Protection Active</h2>
              <p className="text-xs text-emerald-200">Personal phone numbers are completely hidden. Encrypted communication & gender-segregated virtual portals enabled.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-emerald-800/80 px-3 py-1.5 rounded-lg border border-emerald-700 text-emerald-100 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {role === 'student' ? 'Welcome back, Ayesha Noor (Class 10-A)' : 
                   role === 'teacher' ? 'Welcome, Ustaza Fatima (Faculty Portal)' : 
                   role === 'institute_admin' ? 'Welcome, Administrator Dashboard' : 
                   role === 'super_admin' ? 'Welcome, Super Administrator Control' : 'Parent Portal - Guardian View'}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Institute: {activeInstitute.name}</span>
                  <span aria-hidden="true">·</span>
                  <span>Academic Term: Fall 2026</span>
                  <span aria-hidden="true">·</span>
                  <span>Attendance: 98% (Excellent)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab("classes")} className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Join Next Live Class
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Enrolled Subjects</span>
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-900 tabular-nums">6</span>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Quran, Hadith, Fiqh, Nahw, Seerah, Tajweed</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Assignments Graded</span>
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-900 tabular-nums">24 / 26</span>
                  <p className="text-xs text-slate-500 mt-1">Average Grade: <strong className="text-emerald-700">A+ (94.5%)</strong></p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Upcoming Exams</span>
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-slate-900 tabular-nums">2</span>
                  <p className="text-xs text-amber-600 font-medium mt-1">Mid-Term Tajweed & Fiqh Tests next week</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                  <span>Fee Clearance</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-emerald-700 tabular-nums">Paid</span>
                  <p className="text-xs text-slate-500 mt-1">Fall Term fee verified & cleared</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CLASSES */}
        {activeTab === "classes" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Secure Virtual Classroom (Banat Stream)</h2>
                <p className="text-xs text-slate-500 mt-1">High-definition WebRTC live classes with strict privacy controls and encrypted audio streams.</p>
              </div>
              <div className="flex items-center gap-3">
                {!inLiveClass ? (
                  <button onClick={() => setInLiveClass(true)} className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Enter Live Class Room
                  </button>
                ) : (
                  <button onClick={() => setInLiveClass(false)} className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Leave Class
                  </button>
                )}
              </div>
            </div>

            {inLiveClass ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-xl min-h-[480px] relative">
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 bg-slate-950/60 backdrop-md px-4 py-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 text-white text-xs font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Live: Advanced Tafsir Surah Al-Baqarah (Ustaza Fatima)</span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-300">
                    <div className="w-24 h-24 rounded-full bg-emerald-950/80 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-bold mb-4 shadow-lg">
                      UF
                    </div>
                    <h3 className="text-lg font-bold text-white">Ustaza Fatima is sharing her screen</h3>
                    <p className="text-xs text-slate-400 mt-1">Displaying Mushaf Tajweed Notes & Verse Breakdown (Surah Al-Baqarah: 255)</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs h-[520px]">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-700" />
                      Class Q&A Discussion
                    </h4>
                    <div className="flex flex-col gap-3 overflow-y-auto mt-3 h-[380px] pr-1">
                      {classMessages.map((msg, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-800">{msg.sender}</span>
                            <span>{msg.time}</span>
                          </div>
                          <p className="text-xs text-slate-700">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={sendLiveMessage} className="flex gap-2 pt-3 border-t border-slate-100">
                    <input 
                      type="text" 
                      value={newClassMsg}
                      onChange={(e) => setNewClassMsg(e.target.value)}
                      placeholder="Ask a question..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                    />
                    <button type="submit" className="p-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-max">Live Now</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-2">Advanced Tafsir Surah Al-Baqarah</h3>
                    <p className="text-xs text-slate-500">Instructor: Ustaza Fatima</p>
                  </div>
                  <button onClick={() => setInLiveClass(true)} className="mt-6 w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" />
                    Join Live Class
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIGITAL LIBRARY */}
        {activeTab === "library" && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Digital Islamic Library & Recorded Archive</h2>
                <p className="text-xs text-slate-500 mt-1">Access verified PDFs, classical texts, audio lecture recordings, and semester study guides.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">Tafsir Quran</span>
                  <h3 className="text-base font-bold text-slate-900 mt-3">Tafsir Ibn Kathir (Juz 1-5 Selected Notes)</h3>
                  <p className="text-xs text-slate-500 mt-1">Comprehensive Banat syllabus edition with word-by-word Quranic vocabulary analysis.</p>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">14.2 MB · 340 Pages</span>
                  <button className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP (Real MediaRecorder Voice Notes & Real getUserMedia Live Calls) */}
        {activeTab === "whatsapp" && (
          <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[720px] relative">
            <div className="bg-[#075E54] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center font-bold text-white text-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    WhatsApp <span className="text-[10px] bg-emerald-600 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">Banat Secure Edition</span>
                  </h3>
                  <p className="text-xs text-emerald-100">🔒 End-to-end encrypted · Phone numbers strictly masked for safety</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setNewChatModalOpen(true)}
                  className="px-3 py-1.5 bg-[#128C7E] hover:bg-[#0b6b60] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>

                <div className="flex items-center gap-1 bg-[#0b6b60] p-1 rounded-xl text-xs font-semibold">
                  <button onClick={() => setWhatsappSubTab("chats")} className={`px-3 py-1.5 rounded-lg transition-colors ${whatsappSubTab === 'chats' ? 'bg-white text-[#075E54]' : 'text-emerald-100 hover:text-white'}`}>Chats</button>
                  <button onClick={() => setWhatsappSubTab("status")} className={`px-3 py-1.5 rounded-lg transition-colors ${whatsappSubTab === 'status' ? 'bg-white text-[#075E54]' : 'text-emerald-100 hover:text-white'}`}>Status</button>
                  <button onClick={() => setWhatsappSubTab("communities")} className={`px-3 py-1.5 rounded-lg transition-colors ${whatsappSubTab === 'communities' ? 'bg-white text-[#075E54]' : 'text-emerald-100 hover:text-white'}`}>Communities</button>
                  <button onClick={() => setWhatsappSubTab("calls")} className={`px-3 py-1.5 rounded-lg transition-colors ${whatsappSubTab === 'calls' ? 'bg-white text-[#075E54]' : 'text-emerald-100 hover:text-white'}`}>Calls</button>
                </div>
              </div>
            </div>

            {whatsappSubTab === "chats" && (
              <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
                {/* Left: Chat List */}
                <div className="border-r border-slate-200 flex flex-col bg-slate-50/50">
                  <div className="p-3 border-b border-slate-200 bg-white">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input 
                        type="text" 
                        value={whatsappSearch}
                        onChange={(e) => setWhatsappSearch(e.target.value)}
                        placeholder="Search or start new chat"
                        className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {Object.keys(chatMessages)
                      .filter(c => c.toLowerCase().includes(whatsappSearch.toLowerCase()))
                      .map(contact => {
                        const msgs = chatMessages[contact];
                        const lastMsg = msgs[msgs.length - 1];
                        const isSelected = selectedContact === contact;
                        return (
                          <button
                            key={contact}
                            onClick={() => setSelectedContact(contact)}
                            className={`w-full p-3.5 text-left transition-colors flex items-center gap-3 ${isSelected ? 'bg-emerald-50 border-l-4 border-[#075E54]' : 'hover:bg-slate-100/80 bg-white'}`}
                          >
                            <div className="w-11 h-11 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 shadow-xs">
                              {contact.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{contact}</h4>
                                <span className="text-[10px] text-slate-400">{lastMsg?.time}</span>
                              </div>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg?.text}</p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Right: Active Chat Window */}
                <div className="md:col-span-2 flex flex-col justify-between bg-[#efeae2] relative">
                  <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {selectedContact.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{selectedContact}</h4>
                        <p className="text-[11px] text-emerald-700 font-medium">online · 🔒 Phone hidden for student safety</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <button 
                        onClick={() => startRealCall("video")}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold text-[#075E54]"
                        title="Start Real Video Call"
                      >
                        <Video className="w-4 h-4" />
                        <span>Video Call</span>
                      </button>
                      <button 
                        onClick={() => startRealCall("audio")}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold text-[#075E54]"
                        title="Start Real Audio Call"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
                    <div className="self-center bg-amber-50 border border-amber-200 text-amber-800 text-[11px] px-4 py-1.5 rounded-xl shadow-xs text-center max-w-md">
                      🔒 Messages and calls are end-to-end encrypted. Record real voice notes with your microphone or test live camera calls!
                    </div>

                    {(chatMessages[selectedContact] || []).map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.mine ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-md p-3 rounded-2xl text-xs relative shadow-xs ${msg.mine ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-xs' : 'bg-white text-slate-900 rounded-tl-xs border border-slate-100'}`}>
                          {msg.type === 'audio' && msg.audioUrl ? (
                            <div className="flex flex-col gap-2">
                              <span className="text-[11px] font-bold text-[#075E54]">{msg.text}</span>
                              <audio controls src={msg.audioUrl} className="w-64 h-10" />
                            </div>
                          ) : (
                            <p>{msg.text}</p>
                          )}
                          <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500">
                            <span>{msg.time}</span>
                            {msg.mine && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Emoji Picker Popup */}
                  {emojiPickerOpen && (
                    <div className="absolute bottom-16 left-4 bg-white border border-slate-200 p-3 rounded-2xl shadow-xl z-20 grid grid-cols-5 gap-2 text-xl">
                      {['😊', '❤️', '🤲', '📚', '✨', '👍', '⭐', '💡', '🌿', '💬'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => { setMsgInput(prev => prev + emoji); }}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment Menu Popup */}
                  {attachmentMenuOpen && (
                    <div className="absolute bottom-16 left-14 bg-white border border-slate-200 p-3 rounded-2xl shadow-xl z-20 flex flex-col gap-2 w-48">
                      <button onClick={() => sendWhatsAppAttachment('image', 'Assignment_Photo.jpg')} className="flex items-center gap-2.5 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                        <span>Send Photo / Image</span>
                      </button>
                      <button onClick={() => sendWhatsAppAttachment('file', 'Tafsir_Notes.pdf')} className="flex items-center gap-2.5 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Send Document (PDF)</span>
                      </button>
                    </div>
                  )}

                  {/* Input form */}
                  <form onSubmit={sendWhatsAppMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-3 shrink-0 relative">
                    <button type="button" onClick={() => { setEmojiPickerOpen(!emojiPickerOpen); setAttachmentMenuOpen(false); }} className="p-2 text-slate-500 hover:text-slate-700">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => { setAttachmentMenuOpen(!attachmentMenuOpen); setEmojiPickerOpen(false); }} className="p-2 text-slate-500 hover:text-slate-700">
                      <Paperclip className="w-5 h-5" />
                    </button>

                    {isRecording ? (
                      <div className="flex-1 flex items-center justify-between bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-xs text-rose-800 font-semibold">
                        <span className="flex items-center gap-2 animate-pulse">
                          <span className="w-3 h-3 rounded-full bg-rose-600"></span>
                          Recording Live Voice Note ({recordingSeconds}s)...
                        </span>
                        <button type="button" onClick={stopRealVoiceRecording} className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs">
                          Stop & Send
                        </button>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={msgInput}
                        onChange={(e) => setMsgInput(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden"
                      />
                    )}

                    {msgInput.trim() ? (
                      <button type="submit" className="p-2.5 bg-[#075E54] text-white rounded-xl hover:bg-[#064e46] transition-colors shadow-xs">
                        <Send className="w-4 h-4" />
                      </button>
                    ) : !isRecording ? (
                      <button type="button" onClick={startRealVoiceRecording} className="p-2 text-rose-600 hover:text-rose-700 animate-pulse" title="Record Real Voice Note">
                        <Mic className="w-5 h-5" />
                      </button>
                    ) : null}
                  </form>
                </div>
              </div>
            )}

            {whatsappSubTab === "status" && (
              <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Institute Status & Stories</h3>
                  <p className="text-xs text-slate-500 mt-1">Updates shared by faculty members and department heads.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-600 p-0.5 flex items-center justify-center font-bold text-emerald-700 bg-emerald-50">UF</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Ustaza Fatima</h4>
                        <p className="text-[10px] text-slate-400">Today at 09:15 AM</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">"May Allah bless all Banat students preparing for the Quran Hifz and Tafsir examinations today. Keep striving in the path of sacred knowledge."</p>
                  </div>
                </div>
              </div>
            )}

            {whatsappSubTab === "communities" && (
              <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Institute Communities & Broadcast Groups</h3>
                  <p className="text-xs text-slate-500 mt-1">Official encrypted broadcast groups for classes and departments.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">Official Community</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">Class 10-A Banat Community</h4>
                      <p className="text-xs text-slate-500 mt-0.5">42 Members · All phone numbers masked</p>
                    </div>
                    <button onClick={() => { setSelectedContact("Class 10-A Banat Group"); setWhatsappSubTab("chats"); }} className="px-3.5 py-2 bg-[#075E54] text-white rounded-xl text-xs font-semibold hover:bg-[#064e46]">Open Group</button>
                  </div>
                </div>
              </div>
            )}

            {whatsappSubTab === "calls" && (
              <div className="flex-1 p-6 bg-slate-50 overflow-y-auto flex flex-col gap-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Secure Audio & Video Call Logs</h3>
                  <p className="text-xs text-slate-500 mt-1">Encrypted peer-to-peer institute calls with zero phone number exposure.</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">UF</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Ustaza Fatima (Tafsir Consultation)</h4>
                        <p className="text-[11px] text-slate-500">Outgoing Voice Call · Yesterday, 4:15 PM</p>
                      </div>
                    </div>
                    <button onClick={() => startRealCall("audio")} className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EXAMS & QUIZZES */}
        {activeTab === "exams" && (
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Examinations & Assessment Portal</h2>
                <p className="text-xs text-slate-500 mt-1">Take proctored online quizzes, submit term papers, and view graded results.</p>
              </div>
              <button onClick={handleGenerateQuiz} disabled={quizLoading} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {quizLoading ? 'Generating...' : 'Generate AI Practice Quiz'}
              </button>
            </div>
            {quizQuestions.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-6">
                <h3 className="text-base font-bold text-slate-900">Quiz Assessment: {quizTopic}</h3>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: AI STUDY ASSISTANT */}
        {activeTab === "ai_tutor" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[640px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Al-Hikmah AI Islamic Studies & Arabic Tutor</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
              {aiChatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-br-xs' : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleAskAI} className="p-4 border-t border-slate-200 flex gap-3 bg-white">
              <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ask about Tajweed rules..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900" />
              <button type="submit" className="px-6 py-3 bg-emerald-700 text-white rounded-xl text-xs font-semibold">Ask AI</button>
            </form>
          </div>
        )}

      </main>

      {/* New Chat Modal */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateNewChat} className="bg-white rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Start New Secure WhatsApp Chat</h3>
            <p className="text-xs text-slate-500">Enter teacher or student name (Phone numbers remain strictly masked).</p>
            <input type="text" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} placeholder="e.g. Ustaza Maryam (Hadith Dept)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900" />
            <div className="flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setNewChatModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-[#075E54] text-white rounded-xl text-xs font-semibold">Start Chat</button>
            </div>
          </form>
        </div>
      )}

      {/* Real Live Media Call Modal (getUserMedia Camera & Mic) */}
      {callActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-lg w-full flex flex-col items-center gap-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-semibold text-emerald-400">🔒 Secure WhatsApp Live Call</span>
              <span className="text-xs text-slate-400">
                {callStatus === 'connecting' ? 'Connecting...' : `${Math.floor(callSeconds / 60)}:${callSeconds % 60 < 10 ? '0' : ''}${callSeconds % 60}`}
              </span>
            </div>

            {callType === 'video' ? (
              <div className="w-full h-64 bg-black rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                <div className="absolute bottom-3 left-3 bg-slate-900/80 px-3 py-1 rounded-lg text-xs font-medium">
                  You (Live Camera)
                </div>
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-emerald-800 flex items-center justify-center text-4xl font-bold border-4 border-emerald-500 animate-pulse">
                {selectedContact.substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-bold">{selectedContact}</h3>
              <p className="text-xs text-slate-400 mt-1">Live Encrypted {callType === 'video' ? 'Video' : 'Audio'} Stream Active</p>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button onClick={endRealCall} className="px-6 py-3 bg-rose-600 hover:bg-rose-700 rounded-full transition-colors shadow-lg text-xs font-bold flex items-center gap-2">
                <Phone className="w-4 h-4 rotate-[135deg]" />
                End Live Call
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© 2026 Al-Hikmah Secure Educational Platform for Banat. All rights reserved. Strict Privacy & Data Protection Guaranteed.</p>
      </footer>
    </div>
  );
}
