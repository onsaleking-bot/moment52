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

// 暫時保留，供未來表單擴充使用，不影響目前運作
const FORM_ENTRY_NAME = "entry.2037081297";
const FORM_ENTRY_PHONE = "entry.1057236220";
const FORM_ENTRY_EMAIL = "entry.856015986";
const FORM_ENTRY_SIZE = "entry.508788419";
const FORM_ENTRY_COLOR = "entry.1607852062";
const FORM_ENTRY_ADDRESS = "entry.1780577420";
const FORM_ENTRY_CUSTOM_NOTICE = "entry.1535842643";
const FORM_ENTRY_PRIVACY_NOTICE = "entry.1560257946";
const FORM_ENTRY_NOTE = "entry.1489093389";

// --- 工具函數與常數 ---
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

const PLACEHOLDERS = [
  "焦慮只是焦慮",
  "窗外的雨",
  "媽媽老了",
  "我還活著",
  "自己又在編故事",
  "這一刻其實沒有問題"
];

export default function App() {
  const [step, setStep] = useState('home'); 
  const [input, setInput] = useState('');
  const [momentData, setMomentData] = useState(null);
  
  const [showInput, setShowInput] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // 工廠匯出專用的隱藏計數器
  const [secretClicks, setSecretClicks] = useState(0);

  const cardRef = useRef(null);
  const factoryRef = useRef(null); // 指向隱藏的工廠排版區塊
  const placeholderTimerRef = useRef(null);

  // 1. 時間更新機制 (每秒觸發一次重繪)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Placeholder 跑馬燈輪播
  useEffect(() => {
    if (step === 'look' && showInput) {
      placeholderTimerRef.current = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
      }, 3000);
      return () => clearInterval(placeholderTimerRef.current);
    }
  }, [step, showInput]);

  // 3. 進入 Look 模式的延遲顯示
  useEffect(() => {
    if (step === 'look') {
      const timer = setTimeout(() => setShowInput(true), 3500);
      return () => clearTimeout(timer);
    } else {
      setShowInput(false);
    }
  }, [step]);

  // 連點計數器自動歸零 (如果停頓超過 1.5 秒沒點滿)
  useEffect(() => {
    if (secretClicks > 0) {
      const timer = setTimeout(() => setSecretClicks(0), 1500);
      return () => clearTimeout(timer);
    }
  }, [secretClicks]);

  const handleArchive = () => {
    if (!input.trim()) return;
    const now = new Date();
    setMomentData({
      text: input.trim(),
      date: formatDate(now),
      time: formatTime(now),
      signature: generateSignature(),
      quote: QUOTES[Math.floor(Math.random() * QUOTES.length)]
    });
    setStep('archive');
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

  // --- 隱藏功能：匯出給工廠的透明高解析大圖 ---
  const handleFactoryExport = async () => {
    const nextClicks = secretClicks + 1;
    setSecretClicks(nextClicks);
    
    if (nextClicks >= 5) {
      setSecretClicks(0); // 觸發後歸零
      if (!factoryRef.current || !momentData) return;
      
      try {
        if (typeof document !== "undefined" && document.fonts?.ready) {
          await document.fonts.ready;
        }
        
        // 生成工廠級別大圖 (高解析度、全透明背景)
        const canvas = await html2canvas(factoryRef.current, {
          scale: 4, 
          backgroundColor: null, // 透明背景
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

    const params = new URLSearchParams({
      usp: "pp_url",
      [FORM_ENTRY_DECK]: momentData.text,
      [FORM_ENTRY_SIGNATURE]: momentData.signature,
      [FORM_ENTRY_TIME]: `${momentData.date} ${momentData.time}`,
      [FORM_ENTRY_QUOTE]: momentData.quote || momentData.text,
  
      [FORM_ENTRY_SIZE]: "M",
      [FORM_ENTRY_COLOR]: "米白",
  
      [FORM_ENTRY_CUSTOM_NOTICE]:
        "我了解本商品屬個人化客製商品，將依本人於網站生成之牌序與時空簽章專屬製作。訂單確認後即進入製作流程，除商品瑕疵、印刷錯誤或寄送錯誤外，恕不接受任意退換貨。若無故拒收導致商品無法再次銷售，營運方得保留請求相關製作與物流成本之權利。",
  
      [FORM_ENTRY_PRIVACY_NOTICE]:
        "本表單所蒐集之姓名、電話、Email 與收件地址，僅用於訂單聯繫、商品製作、物流寄送與售後服務，不作其他用途。"
    });
  
    window.open(`${GOOGLE_FORM_BASE_URL}?${params.toString()}`, "_blank");
  };

  // ==========================================
  // 畫面渲染函數 (改為直接回傳 JSX，避免 Re-mount 閃爍)
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
