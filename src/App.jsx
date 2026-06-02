import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download, Shirt, RotateCcw, ArrowRight } from 'lucide-react';
import { QUOTES } from "./quotes";

// --- Google Form 真實對接變數 ---
const GOOGLE_FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform";

const FORM_ENTRY_DECK = "entry.907849226";
const FORM_ENTRY_SIGNATURE = "entry.1745604772";
const FORM_ENTRY_TIME = "entry.284034277";
const FORM_ENTRY_QUOTE = "entry.369992627";

const FORM_ENTRY_SIZE = "entry.508788419";
const FORM_ENTRY_COLOR = "entry.1607852062";
const FORM_ENTRY_CUSTOM_NOTICE = "entry.1535842643";
const FORM_ENTRY_PRIVACY_NOTICE = "entry.1560257946";

// --- 工具函數 ---
const generateSignature = () => {
  const chars = "0123456789ABCDEF";
  let hash = "";
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint8Array(8);
    window.crypto.getRandomValues(array);
    array.forEach((val) => {
      hash += chars[val >> 4] + chars[val & 15];
    });
  } else {
    for (let i = 0; i < 16; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
  }
  return `52-${hash}`;
};

const formatDate = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const formatTime = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 升級版 Placeholder：更有人味
const PLACEHOLDERS = [
  "窗外下著雨",
  "媽媽老了",
  "我有點累",
  "我正在焦慮",
  "我想她了",
  "今天其實很好",
  "自己又在編故事",
  "這一刻其實沒有問題",
  "原來我一直在害怕",
  "其實我只是想被理解",
  "我還活著",
  "今天的風很舒服"
];

export default function App() {
  const [step, setStep] = useState('home'); 
  const [input, setInput] = useState('');
  const [momentData, setMomentData] = useState(null);
  
  const [showInput, setShowInput] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [isArchiving, setIsArchiving] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  const cardRef = useRef(null);
  const factoryRef = useRef(null); 
  const placeholderTimerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 'look' && showInput) {
      placeholderTimerRef.current = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }, 3000);
      return () => clearInterval(placeholderTimerRef.current);
    }
  }, [step, showInput]);

  useEffect(() => {
    if (step === 'look') {
      const timer = setTimeout(() => setShowInput(true), 3500);
      return () => clearTimeout(timer);
    } else {
      setShowInput(false);
      setIsArchiving(false);
    }
  }, [step]);

  useEffect(() => {
    if (secretClicks > 0) {
      const timer = setTimeout(() => setSecretClicks(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [secretClicks]);

  const handleArchive = () => {
    if (!input.trim() || isArchiving) return;
    
    setIsArchiving(true);
    
    setTimeout(() => {
      const now = new Date();
      setMomentData({
        text: input.trim(),
        date: formatDate(now),
        time: formatTime(now),
        signature: generateSignature(),
        quote: QUOTES[Math.floor(Math.random() * QUOTES.length)]
      });
      setStep('archive');
    }, 1200);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
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
      link.download = `52Moment-${momentData.signature}.png`;
      link.click();
    } catch (err) {
      console.error("圖卡匯出失敗", err);
    }
  };

  const handleFactoryExport = async () => {
    const nextClicks = secretClicks + 1;
    setSecretClicks(nextClicks);
    if (nextClicks >= 5) {
      setSecretClicks(0); 
      if (!factoryRef.current || !momentData) return;
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
        const canvas = await html2canvas(factoryRef.current, {
          scale: 4, 
          backgroundColor: null, 
          logging: false,
        });
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `FACTORY-PRINT-${momentData.signature}.png`;
        link.click();
        alert("已為您匯出工廠專用高解析透明印刷檔。");
      } catch (err) {
        console.error("工廠圖檔匯出失敗", err);
      }
    }
  };

  const handlePreorder = () => {
    if (!momentData) return;
    // 前端一鍵代入：消滅「人工整理牌序」的內耗
    const params = new URLSearchParams({
      usp: "pp_url",
      [FORM_ENTRY_DECK]: momentData.text,
      [FORM_ENTRY_SIGNATURE]: momentData.signature,
      [FORM_ENTRY_TIME]: `${momentData.date} ${momentData.time}`,
      [FORM_ENTRY_QUOTE]: momentData.quote || momentData.text,
      [FORM_ENTRY_SIZE]: "M",
      [FORM_ENTRY_COLOR]: "米白",
      [FORM_ENTRY_CUSTOM_NOTICE]: "我了解本商品屬個人化客製商品，將依本人於網站生成之牌序與時空簽章專屬製作。訂單確認後即進入製作流程，除商品瑕疵、印刷錯誤或寄送錯誤外，恕不接受任意退換貨。若無故拒收導致商品無法再次銷售，營運方得保留請求相關製作與物流成本之權利。", // 貨到付款（COD）拒收防禦：心理上篩選掉不誠實的低質量訂單
      [FORM_ENTRY_PRIVACY_NOTICE]: "本表單所蒐集之姓名、電話、Email 與收件地址，僅用於訂單聯繫、商品製作、物流寄送與售後服務，不作其他用途。"
    });
    window.open(`${GOOGLE_FORM_BASE_URL}?${params.toString()}`, "_blank");
  };

  // ==========================================
  // 畫面渲染函數
  // ==========================================

  const renderHomeView = () => (
    <motion.div 
      key="home"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
    >
      <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] mb-4">52!</h1>
      <p className="text-xl md:text-2xl font-light tracking-widest text-neutral-400 mb-16">此刻唯一。</p>
      <div className="space-y-3 mb-20 text-neutral-500 font-light tracking-wider text-sm md:text-base">
        <p>你不是在等待奇蹟。</p>
        <p>你正在經歷一個不會重來的排列。</p>
      </div>
      <button 
        onClick={() => setStep('look')}
        className="px-10 py-4 border border-white/20 text-white/80 hover:bg-white hover:text-black transition-all duration-500 tracking-[0.2em] text-sm uppercase"
      >
        開始觀看
      </button>
    </motion.div>
  );

  const renderLookView = () => (
    <motion.div 
      key="look"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 w-full max-w-2xl mx-auto"
    >
      <div className={`text-center transition-all duration-1000 ${showInput ? 'mb-12 opacity-30' : 'mb-0 opacity-100'}`}>
        <p className="text-lg text-neutral-400 font-mono tracking-widest mb-2">{formatDate(currentTime)}</p>
        <p className="text-4xl font-mono tracking-widest text-white/90">{formatTime(currentTime)}</p>
        {!showInput && <p className="mt-10 text-neutral-500 tracking-widest font-light animate-pulse">這一刻，不會再重來。</p>}
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div 
            key="input-box"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="w-full flex flex-col items-center"
          >
            {/* 認知解壓縮的引導文案 */}
            <div className="text-neutral-500 font-light tracking-[0.15em] text-sm mb-12 text-center flex flex-col items-center">
              <p className="mb-2">這不是創作。</p>
              <p className="mb-2">不是願望。</p>
              <p>不是名言。</p>
              
              <div className="h-6"></div>
              
              <p className="mb-2">只是誠實寫下，</p>
              <p>此刻最真實的一件事。</p>
              
              <div className="h-6"></div>

              <p className="mb-2">也許是一個念頭。</p>
              <p className="mb-2">也許是一個事實。</p>
              <p>也許只是一種感受。</p>

              <div className="h-8"></div>
              
              <p className="text-neutral-300 tracking-[0.2em]">你看見了什麼？</p>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={40}
              disabled={isArchiving}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="w-full bg-transparent border-b border-white/20 pb-4 text-center text-2xl md:text-3xl text-white placeholder-neutral-800 focus:outline-none focus:border-white/60 transition-colors font-light tracking-wide disabled:opacity-50"
              autoFocus
            />
            
            {/* 極簡有力的按鈕 */}
            <button 
              onClick={handleArchive}
              disabled={!input.trim() || isArchiving}
              className="mt-16 px-12 py-4 bg-white text-black hover:bg-neutral-200 disabled:opacity-0 transition-all duration-700 tracking-[0.3em] text-sm"
            >
              {isArchiving ? '封存中...' : '我看見了'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderArchiveView = () => (
    <motion.div 
      key="archive"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12"
    >
      <div 
        ref={cardRef}
        className="w-full max-w-md bg-[#0E0E0E] border border-white/10 p-12 flex flex-col items-center text-center relative overflow-hidden shadow-2xl"
      >
        <h2 className="text-2xl font-bold tracking-[0.3em] mb-16 text-white/90">52!</h2>
        <p className="text-xs tracking-[0.3em] text-neutral-600 mb-8">此刻我看見</p>
        <p className="text-2xl md:text-3xl font-light leading-relaxed tracking-wider mb-10 text-white/95">
          「{momentData.text}」
        </p>
        <p className="text-sm md:text-base font-light leading-relaxed tracking-wider mb-16 text-neutral-400">
          {momentData.quote}
        </p>
        <div className="w-full flex flex-col items-center gap-2 font-mono text-[10px] md:text-xs text-neutral-500 tracking-widest break-all px-4">
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

  const renderTShirtView = () => (
    <motion.div 
      key="tshirt"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 py-12 w-full max-w-5xl mx-auto"
    >
      <div className="grid md:grid-cols-2 gap-16 w-full items-center">
        <div className="relative aspect-[3/4] w-full max-w-sm mx-auto bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden">
           <img src="/tshirt-front.png.png" alt="T-shirt Mockup" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen" />
           <div className="relative z-10 flex flex-col items-center text-center p-8 mt-12">
             <p className="text-[9px] tracking-[0.3em] text-neutral-500 mb-4">此刻我看見</p>
             <p className="text-lg font-light tracking-widest text-white/90">「{momentData.text}」</p>
             <p className="text-[7px] font-mono text-neutral-600 mt-8 tracking-widest break-all px-4">{momentData.signature}</p>
           </div>
           <span 
             onClick={handleFactoryExport}
             className="absolute top-4 right-4 text-[9px] tracking-widest text-neutral-600 border border-neutral-800 px-2 py-1 cursor-pointer hover:bg-white/5 transition-colors"
           >
             BACK DESIGN
           </span>
        </div>
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
      {momentData && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div 
            ref={factoryRef} 
            className="flex flex-col items-center justify-center font-sans text-[#FFFFFF]" 
            style={{ width: '1200px', height: '1600px', backgroundColor: 'transparent', padding: '100px' }}
          >
            <p style={{ fontSize: '32px', letterSpacing: '0.3em', marginBottom: '80px', color: '#FFFFFF' }}>此刻我看見</p>
            <p style={{ fontSize: '110px', fontWeight: 300, letterSpacing: '0.1em', marginBottom: '160px', color: '#FFFFFF', textAlign: 'center', lineHeight: '1.4' }}>
              「{momentData.text}」
            </p>
            <p style={{ fontSize: '32px', fontFamily: 'monospace', letterSpacing: '0.2em', color: '#FFFFFF' }}>
              {momentData.signature}
            </p>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {step === 'home' && renderHomeView()}
        {step === 'look' && renderLookView()}
        {step === 'archive' && renderArchiveView()}
        {step === 'tshirt' && renderTShirtView()}
      </AnimatePresence>
    </div>
  );
}
      <AnimatePresence mode="wait">
        {step === 'home' && renderHomeView()}
        {step === 'look' && renderLookView()}
        {step === 'archive' && renderArchiveView()}
        {step === 'tshirt' && renderTShirtView()}
      </AnimatePresence>
    </div>
  );
}
