import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download, Shirt, RotateCcw, Share2, ArrowRight } from 'lucide-react';

// --- 工具函數 ---
const generateSignature = () => {
  const chars = '0123456789ABCDEF';
  let hash = '';
  for (let i = 0; i < 4; i++) hash += chars[Math.floor(Math.random() * 16)];
  return `#L-${hash}`;
};

const formatDate = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const formatTime = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const PLACEHOLDERS = [
  "焦慮只是焦慮",
  "窗外的雨",
  "媽媽老了",
  "我還活著",
  "自己又在編故事",
  "這一刻其實沒有問題"
];

// 替換為你真實的 Google Form 網址與 entry ID
const GOOGLE_FORM_BASE_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform";
const FORM_ENTRY_QUOTE = "entry.123456"; 
const FORM_ENTRY_SIGNATURE = "entry.789012";

export default function App() {
  const [step, setStep] = useState('home'); // 'home' | 'look' | 'archive' | 'tshirt'
  const [input, setInput] = useState('');
  const [momentData, setMomentData] = useState(null);
  
  const [showInput, setShowInput] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const cardRef = useRef(null);
  const placeholderTimerRef = useRef(null);

  // 時間更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Placeholder 輪播
  useEffect(() => {
    if (step === 'look' && showInput) {
      placeholderTimerRef.current = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }, 3000);
      return () => clearInterval(placeholderTimerRef.current);
    }
  }, [step, showInput]);

  // 進入 Look 模式的延遲顯示
  useEffect(() => {
    if (step === 'look') {
      const timer = setTimeout(() => setShowInput(true), 3500);
      return () => clearTimeout(timer);
    } else {
      setShowInput(false);
    }
  }, [step]);

  const handleArchive = () => {
    if (!input.trim()) return;
    const now = new Date();
    setMomentData({
      text: input.trim(),
      date: formatDate(now),
      time: formatTime(now),
      signature: `${generateSignature()}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
    });
    setStep('archive');
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      // 確保字體完全載入，避免 Canvas 渲染回退到預設字體
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#0E0E0E',
        logging: false,
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `Look-${momentData.signature}.png`;
      link.click();
    } catch (err) {
      console.error("圖卡匯出失敗", err);
    }
  };

  const handlePreorder = () => {
    // 將使用者輸入與時空簽章作為參數帶入 Google Form URL
    const url = `${GOOGLE_FORM_BASE_URL}?${FORM_ENTRY_QUOTE}=${encodeURIComponent(momentData.text)}&${FORM_ENTRY_SIGNATURE}=${encodeURIComponent(momentData.signature)}`;
    window.open(url, '_blank');
  };

  // --- 畫面元件 ---

  const HomeView = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
    >
      <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] mb-4">Look.</h1>
      <p className="text-xl md:text-2xl font-light tracking-widest text-neutral-400 mb-16">看見這一刻。</p>
      
      <div className="space-y-3 mb-20 text-neutral-500 font-light tracking-wider text-sm md:text-base">
        <p>Before you think, just see.</p>
        <p>在思考之前，先看見。</p>
        <div className="h-4"></div>
        <p>這一刻正在發生。</p>
        <p>它不會再重來。</p>
      </div>

      <button 
        onClick={() => setStep('look')}
        className="px-10 py-4 border border-white/20 text-white/80 hover:bg-white hover:text-black transition-all duration-500 tracking-[0.2em] text-sm uppercase"
      >
        開始觀看
      </button>
    </motion.div>
  );

  const LookView = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 w-full max-w-2xl mx-auto"
    >
      <div className={`text-center transition-all duration-1000 ${showInput ? 'mb-24 opacity-40' : 'mb-0 opacity-100'}`}>
        <p className="text-lg text-neutral-400 font-mono tracking-widest mb-2">{formatDate(currentTime)}</p>
        <p className="text-4xl font-mono tracking-widest text-white/90">{formatTime(currentTime)}</p>
        {!showInput && <p className="mt-10 text-neutral-500 tracking-widest font-light animate-pulse">這一刻，不會再重來。</p>}
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="w-full flex flex-col items-center"
          >
            <p className="text-neutral-500 tracking-[0.2em] mb-6 text-sm">此刻我看見</p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={40}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-transparent border-b border-white/20 pb-4 text-center text-2xl md:text-3xl text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-colors font-light tracking-wide"
              autoFocus
            />
            <button 
              onClick={handleArchive}
              disabled={!input.trim()}
              className="mt-16 px-8 py-3 bg-white text-black hover:bg-neutral-200 disabled:opacity-0 transition-all duration-700 tracking-[0.2em] text-sm"
            >
              封存這一刻
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const ArchiveView = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
    >
      {/* 數位 Moment Card */}
      <div 
        ref={cardRef}
        className="w-full max-w-md bg-[#0E0E0E] border border-white/10 p-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl"
      >
        <h2 className="text-2xl font-bold tracking-[0.3em] mb-16 text-white/90">LOOK.</h2>
        
        <p className="text-xs tracking-[0.3em] text-neutral-600 mb-8">此刻我看見</p>
        <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-wider mb-24 text-white/95">
          「{momentData.text}」
        </p>

        <div className="w-full flex flex-col items-center gap-2 font-mono text-[10px] md:text-xs text-neutral-500 tracking-widest">
          <p>{momentData.date} {momentData.time}</p>
          <p className="mt-4">{momentData.signature}</p>
        </div>

        <p className="mt-16 text-[9px] text-neutral-700 tracking-[0.2em] uppercase">
          This moment will never happen again.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-8">
        <button onClick={handleDownload} className="flex flex-col items-center gap-3 text-neutral-500 hover:text-white transition-colors">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center"><Download size={18} /></div>
          <span className="text-[10px] tracking-widest uppercase">下載卡片</span>
        </button>
        <button onClick={() => setStep('tshirt')} className="flex flex-col items-center gap-3 text-neutral-500 hover:text-white transition-colors">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5"><Shirt size={18} /></div>
          <span className="text-[10px] tracking-widest uppercase">製作 T 恤</span>
        </button>
        <button onClick={() => { setInput(''); setShowInput(false); setStep('look'); }} className="flex flex-col items-center gap-3 text-neutral-500 hover:text-white transition-colors">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center"><RotateCcw size={18} /></div>
          <span className="text-[10px] tracking-widest uppercase">重新觀看</span>
        </button>
      </div>
    </motion.div>
  );

  const TShirtView = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12 w-full max-w-5xl mx-auto"
    >
      <div className="grid md:grid-cols-2 gap-16 w-full items-center">
        {/* T-Shirt Mockup 區塊 */}
        <div className="relative aspect-[3/4] w-full max-w-sm mx-auto bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
           {/* 背景載入指定的材質底圖 */}
           <img src="image_8d4358.jpg" alt="Mockup Texture" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale" />
           
           <div className="relative z-10 flex flex-col items-center text-center p-8">
             <Shirt size={80} strokeWidth={1} className="text-white/10 mb-8" />
             <p className="text-[9px] tracking-[0.3em] text-neutral-500 mb-4">此刻我看見</p>
             <p className="text-lg font-light tracking-widest text-white/90">「{momentData.text}」</p>
             <p className="text-[8px] font-mono text-neutral-600 mt-8 tracking-widest">{momentData.signature}</p>
           </div>
           
           <span className="absolute top-4 right-4 text-[9px] tracking-widest text-neutral-600 border border-neutral-800 px-2 py-1">BACK DESIGN</span>
        </div>

        {/* 商品文案與結帳區塊 */}
        <div className="flex flex-col items-start text-left">
          <h2 className="text-2xl md:text-3xl font-light tracking-[0.2em] mb-8">把一個瞬間穿在身上。</h2>
          <div className="space-y-3 text-neutral-400 tracking-wider font-light leading-relaxed mb-12 text-sm md:text-base">
            <p>這不是潮流標語，不是品牌口號。</p>
            <p>它是你在某一刻，真正看見的事。</p>
            <div className="h-4"></div>
            <p className="text-xs text-neutral-500">
              * 點擊預購將前往訂製表單，您的專屬時空簽章與句子將會自動帶入。
            </p>
          </div>

          <button 
            onClick={handlePreorder}
            className="w-full md:w-auto px-12 py-4 bg-white text-black hover:bg-neutral-200 transition-colors tracking-[0.2em] text-sm mb-6 flex items-center justify-center gap-3"
          >
            前往預購 <ArrowRight size={16} />
          </button>
          <button 
            onClick={() => setStep('archive')} 
            className="text-xs text-neutral-500 hover:text-white tracking-[0.1em] transition-colors"
          >
            ← 返回觀看紀錄
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0E0E0E] text-[#D4D4D4] selection:bg-white/30 font-sans">
      <AnimatePresence mode="wait">
        {step === 'home' && <HomeView key="home" />}
        {step === 'look' && <LookView key="look" />}
        {step === 'archive' && <ArchiveView key="archive" />}
        {step === 'tshirt' && <TShirtView key="tshirt" />}
      </AnimatePresence>
    </div>
  );
}
