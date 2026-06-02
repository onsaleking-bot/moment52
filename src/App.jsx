import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { ArrowRight, Download, RotateCcw, Shirt } from "lucide-react";
import { QUOTES } from "./quotes";

// --- 常數設定 ---
const GOOGLE_FORM_BASE_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform";

const FORM_ENTRY_DECK = "entry.907849226";
const FORM_ENTRY_SIGNATURE = "entry.1745604772";
const FORM_ENTRY_TIME = "entry.284034277";
const FORM_ENTRY_QUOTE = "entry.369992627";
const FORM_ENTRY_SIZE = "entry.508788419";
const FORM_ENTRY_COLOR = "entry.1607852062";
const FORM_ENTRY_CUSTOM_NOTICE = "entry.1535842634";
const FORM_ENTRY_PRIVACY_NOTICE = "entry.1560257946";

const PLACEHOLDERS = [
  "窗外下著雨", "媽媽老了", "我有點累", "我正在焦慮", "我想她了",
  "今天其實很好", "自己又在編故事", "這一刻其實沒有問題", 
  "原來我一直在害怕", "其實我只是想被理解", "我還活著", "今天的風很舒服"
];

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
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const formatTime = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const exportElementAsPng = async (element, filename, options = {}) => {
  if (!element) return;
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  const canvas = await html2canvas(element, {
    scale: options.scale ?? 3,
    backgroundColor: options.backgroundColor ?? "#0E0E0E",
    logging: false
  });
  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = image;
  link.download = filename;
  link.click();
};

// ==========================================
// 獨立畫面元件 (徹底分離職責，優化效能)
// ==========================================

const HomeView = ({ onStart }) => (
  <motion.div
    key="home"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
    className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
  >
    <h1 className="mb-4 text-5xl font-bold tracking-[0.2em] md:text-7xl">52!</h1>
    <p className="mb-16 text-xl font-light tracking-widest text-neutral-400 md:text-2xl">此刻唯一。</p>
    <div className="mb-20 space-y-3 text-sm font-light tracking-wider text-neutral-500 md:text-base">
      <p>你不是在等待奇蹟。</p>
      <p>你正在經歷一個不會重來的排列。</p>
    </div>
    <button
      onClick={onStart}
      className="border border-white/20 px-10 py-4 text-sm uppercase tracking-[0.2em] text-white/80 transition-all duration-500 hover:bg-white hover:text-black"
    >
      開始觀看
    </button>
  </motion.div>
);

const LookView = ({ onArchive }) => {
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isArchiving, setIsArchiving] = useState(false);

  // 時鐘只在 LookView 運作，不影響其他頁面
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showInput) return;
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [showInput]);

  const handleAction = () => {
    if (!input.trim() || isArchiving) return;
    setIsArchiving(true);
    setTimeout(() => {
      const now = new Date();
      onArchive({
        text: input.trim(),
        date: formatDate(now),
        time: formatTime(now),
        signature: generateSignature(),
        quote: QUOTES[Math.floor(Math.random() * QUOTES.length)]
      });
    }, 1200);
  };

  return (
    <motion.div
      key="look"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6"
    >
      <div className={`text-center transition-all duration-1000 ${showInput ? "mb-12 opacity-30" : "mb-0 opacity-100"}`}>
        <p className="mb-2 font-mono text-lg tracking-widest text-neutral-400">{formatDate(currentTime)}</p>
        <p className="font-mono text-4xl tracking-widest text-white/90">{formatTime(currentTime)}</p>
        {!showInput && (
          <p className="mt-10 animate-pulse font-light tracking-widest text-neutral-500">這一刻，不會再重來。</p>
        )}
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div
            key="input-box"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
            className="flex w-full flex-col items-center"
          >
            <div className="mb-12 flex flex-col items-center text-center text-sm font-light tracking-[0.15em] text-neutral-500">
              <p className="mb-2">這不是創作。</p>
              <p className="mb-2">不是願望。</p>
              <p>不是名言。</p>
              <div className="h-6" />
              <p className="mb-2">只是誠實寫下，</p>
              <p>此刻最真實的一件事。</p>
              <div className="h-6" />
              <p className="mb-2">也許是一個念頭。</p>
              <p className="mb-2">也許是一個事實。</p>
              <p>也許只是一種感受。</p>
              <div className="h-8" />
              <p className="tracking-[0.2em] text-neutral-300">你看見了什麼？</p>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={40}
              disabled={isArchiving}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="w-full border-b border-white/20 bg-transparent pb-4 text-center text-2xl font-light tracking-wide text-white placeholder-neutral-800 transition-colors focus:border-white/60 focus:outline-none disabled:opacity-50 md:text-3xl"
              autoFocus
            />
            <button
              onClick={handleAction}
              disabled={!input.trim() || isArchiving}
              className="mt-16 bg-white px-12 py-4 text-sm tracking-[0.3em] text-black transition-all duration-700 hover:bg-neutral-200 disabled:opacity-0"
            >
              {isArchiving ? "封存中..." : "我看見了"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ArchiveView = ({ data, onTShirt, onReset }) => {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    try {
      await exportElementAsPng(cardRef.current, `52Moment-${data.signature}.png`);
    } catch (error) {
      console.error("圖卡匯出失敗", error);
    }
  };

  return (
    <motion.div
      key="archive"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-16 px-6 py-12 md:flex-row md:gap-24"
    >
      <div
        ref={cardRef}
        className="relative flex w-full max-w-sm flex-shrink-0 flex-col items-center overflow-hidden border border-white/10 bg-[#0E0E0E] p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <h2 className="mb-16 text-2xl font-bold tracking-[0.3em] text-white/90">52!</h2>
        <p className="mb-8 text-xs tracking-[0.3em] text-neutral-600">此刻我看見</p>
        <p className="mb-10 px-2 text-2xl font-light leading-relaxed tracking-wider text-white/95 break-words md:text-3xl">
          「{data.text}」
        </p>
        <p className="mb-16 px-4 text-sm font-light leading-relaxed tracking-wider text-neutral-400 md:text-base">
          {data.quote}
        </p>
        <div className="flex w-full flex-col items-center gap-2 break-all px-4 font-mono text-[10px] tracking-widest text-neutral-500 md:text-xs">
          <p>{data.date} {data.time}</p>
          <p className="mt-4">{data.signature}</p>
        </div>
        <p className="mt-16 text-[9px] uppercase tracking-[0.2em] text-neutral-700">
          This moment will never happen again.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-start text-left">
        <h2 className="mb-10 text-3xl font-light tracking-[0.2em] text-white/90 md:text-4xl">這一刻，被保存了。</h2>
        <div className="mb-16 space-y-4 text-sm font-light leading-relaxed tracking-widest text-neutral-400 md:text-base">
          <p>你可以讓它停留在這裡。</p>
          <p>或者。</p>
          <p>把它穿在身上。</p>
        </div>
        <div className="flex w-full flex-col gap-5">
          <button
            onClick={onTShirt}
            className="flex w-full items-center justify-center gap-3 bg-white px-8 py-4 text-sm tracking-[0.2em] text-black transition-colors hover:bg-neutral-200"
          >
            製作專屬 T 恤 <ArrowRight size={16} />
          </button>
          <button
            onClick={handleDownload}
            className="flex w-full items-center justify-center gap-3 border border-white/20 px-8 py-4 text-sm tracking-[0.2em] text-white transition-colors hover:bg-white/10"
          >
            <Download size={16} /> 下載紀錄卡
          </button>
          <button
            onClick={onReset}
            className="mt-4 w-full text-center text-xs tracking-[0.2em] text-neutral-500 transition-colors hover:text-white"
          >
            重新觀看
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const TShirtView = ({ data, onBack }) => {
  const [secretClicks, setSecretClicks] = useState(0);
  const factoryRef = useRef(null);

  useEffect(() => {
    if (secretClicks <= 0) return;
    const timer = setTimeout(() => setSecretClicks(0), 1500);
    return () => clearTimeout(timer);
  }, [secretClicks]);

  const handlePreorder = () => {
    const params = new URLSearchParams({
      usp: "pp_url",
      [FORM_ENTRY_DECK]: data.text,
      [FORM_ENTRY_SIGNATURE]: data.signature,
      [FORM_ENTRY_TIME]: `${data.date} ${data.time}`,
      [FORM_ENTRY_QUOTE]: data.quote || data.text,
      [FORM_ENTRY_SIZE]: "M",
      [FORM_ENTRY_COLOR]: "黑色", // 預設帶入顏色
      [FORM_ENTRY_CUSTOM_NOTICE]: "我了解本商品屬個人化客製商品，將依本人於網站生成之牌序與時空簽章專屬製作。訂單確認後即進入製作流程，除商品瑕疵、印刷錯誤或寄送錯誤外，恕不接受任意退換貨。若無故拒收導致商品無法再次銷售，營運方得保留請求相關製作與物流成本之權利。",
      [FORM_ENTRY_PRIVACY_NOTICE]: "本表單所蒐集之姓名、電話、Email 與收件地址，僅用於訂單聯繫、商品製作、物流寄送與售後服務，不作其他用途。"
    });
    window.open(`${GOOGLE_FORM_BASE_URL}?${params.toString()}`, "_blank");
  };

  const handleFactoryExport = async () => {
    const nextClicks = secretClicks + 1;
    setSecretClicks(nextClicks);
    if (nextClicks < 5) return;
    setSecretClicks(0);
    
    try {
      await exportElementAsPng(factoryRef.current, `FACTORY-PRINT-${data.signature}.png`, {
        scale: 4,
        backgroundColor: null
      });
      alert("已匯出工廠專用高解析透明印刷檔。");
    } catch (error) {
      console.error("工廠圖檔匯出失敗", error);
    }
  };

  return (
    <>
      <motion.div
        key="tshirt"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}
        className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-12"
      >
        <div className="grid w-full items-center gap-16 md:grid-cols-2">
          <div className="relative mx-auto flex aspect-[3/4] w-full max-w-sm items-center justify-center overflow-hidden border border-white/10 bg-[#111]">
            <img src="/tshirt-front.png.png" alt="T-shirt Mockup" className="absolute inset-0 h-full w-full object-cover opacity-30 grayscale mix-blend-screen" />
            <div className="relative z-10 mt-4 flex w-full flex-col items-center p-8 text-center">
              <p className="mb-1 font-mono text-[12px] tracking-widest text-neutral-300 md:text-sm">{data.signature}</p>
              <p className="mb-16 font-mono text-[8px] tracking-[0.2em] text-neutral-600 md:text-[10px]">SPACE-TIME SIGNATURE</p>
              <p className="mb-6 text-[10px] tracking-[0.3em] text-neutral-400 md:text-xs">此刻我看見</p>
              <p className="break-all px-2 text-3xl font-light leading-snug tracking-widest text-white/95 md:text-4xl">「{data.text}」</p>
            </div>
            <span
              onClick={handleFactoryExport}
              className="absolute right-4 top-4 cursor-pointer border border-neutral-800 px-2 py-1 text-[9px] tracking-widest text-neutral-600 transition-colors hover:bg-white/5"
            >
              BACK DESIGN
            </span>
          </div>

          <div className="flex flex-col items-start text-left">
            <h2 className="mb-8 text-2xl font-light tracking-[0.2em] md:text-3xl">把一個瞬間穿在身上。</h2>
            <div className="mb-12 space-y-3 text-sm font-light leading-relaxed tracking-wider text-neutral-400 md:text-base">
              <p>這不是潮流標語，不是品牌口號。</p>
              <p>它是你在某一刻，真正看見的事。</p>
              <div className="h-4" />
              <p className="text-xs text-neutral-500">* 點擊預購將前往訂製表單，您的專屬時空簽章與句子將會自動帶入。</p>
            </div>
            <button
              onClick={handlePreorder}
              className="mb-6 flex w-full items-center justify-center gap-3 bg-white px-12 py-4 text-sm tracking-[0.2em] text-black transition-colors hover:bg-neutral-200 md:w-auto"
            >
              前往預購 <ArrowRight size={16} />
            </button>
            <button
              onClick={onBack}
              className="text-xs tracking-[0.1em] text-neutral-500 transition-colors hover:text-white"
            >
              ← 返回觀看紀錄 
            </button>
          </div>
        </div>
      </motion.div>

      {/* 隱藏的工廠排版區塊，僅存在於 TShirtView 內 */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div
          ref={factoryRef}
          className="flex flex-col items-center justify-center font-sans text-[#FFFFFF]"
          style={{ width: "1200px", height: "1600px", backgroundColor: "transparent", padding: "100px" }}
        >
          <p style={{ fontSize: "32px", fontFamily: "monospace", letterSpacing: "0.2em", color: "#FFFFFF", marginBottom: "10px" }}>{data.signature}</p>
          <p style={{ fontSize: "24px", letterSpacing: "0.3em", color: "#888888", marginBottom: "160px" }}>SPACE-TIME SIGNATURE</p>
          <p style={{ fontSize: "32px", letterSpacing: "0.3em", marginBottom: "80px", color: "#FFFFFF" }}>此刻我看見</p>
          <p style={{ fontSize: "110px", fontWeight: 300, letterSpacing: "0.1em", marginBottom: "160px", color: "#FFFFFF", textAlign: "center", lineHeight: "1.4" }}>「{data.text}」</p>
        </div>
      </div>
    </>
  );
};

// ==========================================
// 頂層應用容器 (清爽、簡潔的流程控制)
// ==========================================

export default function App() {
  const [step, setStep] = useState("home");
  const [momentData, setMomentData] = useState(null);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#d4d4d4] selection:bg-white selection:text-black">
      <AnimatePresence mode="wait">
        {step === "home" && <HomeView onStart={() => setStep("look")} />}
        
        {step === "look" && (
          <LookView 
            onArchive={(data) => {
              setMomentData(data);
              setStep("archive");
            }} 
          />
        )}
        
        {step === "archive" && momentData && (
          <ArchiveView 
            data={momentData} 
            onTShirt={() => setStep("tshirt")} 
            onReset={() => {
              setMomentData(null);
              setStep("look");
            }} 
          />
        )}
        
        {step === "tshirt" && momentData && (
          <TShirtView 
            data={momentData} 
            onBack={() => setStep("archive")} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
