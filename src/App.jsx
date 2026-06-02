import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Download, Heart, LockKeyhole, Share2, Volume2, VolumeX, X, Shirt, Infinity } from "lucide-react";

// --- 配置區 ---
const GOOGLE_FORM_CONFIG = {
  baseUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform",
  entryDeck: "entry.907849226",
  entrySignature: "entry.1745604772",
  entryTime: "entry.284034277",
  entryQuote: "entry.369992627",
};

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const BASE_DECK = SUITS.flatMap((suit) => RANKS.map((rank) => `${suit}${rank}`));

const STORAGE_KEYS = {
  bookmarks: "moment52_bookmarks",
  sound: "moment52_sound",
};

// --- 擴充後的核心金句庫 ---
const QUOTES = [
  // 【時空排列與唯一】
  "這副牌的排列，宇宙可能從未見過。",
  "如果此刻只能發生一次，那麼此刻就值得珍惜。",
  "52! 不是機率，而是提醒。",
  "宇宙不會重複今天。這一刻的排列，只屬於現在。",
  "今天從未來過，也不會再來。",
  "此刻沒有複製品。生命真正擁有的，從來只有此刻。",
  "你正在經歷的，是宇宙歷史上唯一的一次現在。",
  "這一刻不會重來，這個版本的你也不會重來。",
  "宇宙沒有重複洗出同一個你。",
  "每一次洗牌，都是一次小型宇宙誕生。",
  
  // 【觀看與宇宙】
  "我們研究宇宙研究了幾千年，後來才發現，研究者本身就是宇宙。",
  "你不是宇宙裡的人，你是宇宙的一部分。",
  "宇宙或許沒有答案，但它有提問。",
  "宇宙最大的奇蹟，也許不是存在，而是存在開始觀看自己。",
  "一個角度是圓的一部分。",
  "此刻，是宇宙第一次從這個角度看見自己。",
  
  // 【生死與存在】
  "死亡帶走的，或許只是故事。",
  "生命不是永恆，生命是曾經。",
  "有一天你會離開，但今天還在。",
  "死亡不是生命的對立面，它是生命的一部分。",
  "你終將消失，所以此刻更值得存在。",
  
  // 【放過、當下與解釋】
  "未來尚未到來，你卻已經替它痛苦。",
  "報告還沒出來，剩下的都是故事。",
  "恐懼常常不是來自事情，而是來自想像。",
  "雨只是雨，剩下的是解釋。",
  "有時候放下的不是事情，而是劇本。",
  "允許一切發生。然後好好活完今天。",
  "你以為人生正在等待開始。其實人生正在發生。",
  "不要等待未來的獎賞，完整的自己已經在這裡。",
  "所有的未來，最後都落在你眼前這一秒。",
  
  // 【無常與有限】
  "花會凋謝，所以花開才值得被看見。",
  "一切都會消失，包括這句話。",
  "無常不是生命的缺陷，無常就是生命。",
  "正因為有限，一切才顯得珍貴。",
  "夕陽之所以美，是因為它正在離開。",
  
  // 【普通與獨特】
  "宇宙從來沒有要求一朵花改變春天。",
  "你不必特別，你已經獨一無二。",
  "普通不是缺陷，普通是大多數生命的樣子。",
  "不是每顆星星都是北極星，但每顆星星都在發光。",
  "你很普通，而這並不妨礙你珍貴。"
];

const FACTORIAL_SHORT = "8.06 × 10⁶⁷";
const FACTORIAL_FULL = "80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000";

let sharedAudioContext = null;

// --- 工具函數 ---
function isBrowser() {
  return typeof window !== "undefined";
}

function loadStoredBoolean(key, fallback = false) {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;
    return value === "true";
  } catch {
    return fallback;
  }
}

function loadStoredJson(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (!isBrowser()) return;
  try {
    const storedValue = typeof value === "string" ? value : JSON.stringify(value);
    window.localStorage.setItem(key, storedValue);
  } catch {}
}

function secureRandomInt(maxExclusive) {
  if (maxExclusive <= 0) return 0;
  if (isBrowser() && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const maxUint = 0xffffffff;
    const limit = Math.floor(maxUint / maxExclusive) * maxExclusive;
    let value;
    do {
      window.crypto.getRandomValues(array);
      value = array[0];
    } while (value >= limit);
    return value % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

function shuffleDeck() {
  const deck = [...BASE_DECK];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function randomQuote() {
  return QUOTES[secureRandomInt(QUOTES.length)];
}

function createSignature(deck) {
  const text = deck.join("");
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return hash.toString(16).toUpperCase().padStart(16, "0");
}

function formatTime(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(date);
}

function formatDateShort(date) {
  const d = date || new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

async function playSingingBowl() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContext();
    }
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.type = "sine";
    overtone.type = "sine";
    osc.frequency.setValueAtTime(144, ctx.currentTime);
    overtone.frequency.setValueAtTime(288, ctx.currentTime);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.6);
    
    osc.connect(filter);
    overtone.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    overtone.start();
    osc.stop(ctx.currentTime + 3.7);
    overtone.stop(ctx.currentTime + 3.7);
  } catch {}
}

function splitText(ctx, text, maxWidth) {
  const chars = text.split("");
  const lines = [];
  let current = "";
  chars.forEach((char) => {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function formatDeckForShirt(deck) {
  const lines = [];
  for (let i = 0; i < 52; i += 13) {
    lines.push(deck.slice(i, i + 13).join(" · "));
  }
  return lines;
}

function Modal({ children, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto border border-white/10 bg-black p-7 text-left text-neutral-300 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 transition hover:text-white"
          aria-label="關閉"
        >
          <X size={20} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const [deck, setDeck] = useState(() => shuffleDeck());
  const [quote, setQuote] = useState("點擊下方，生成屬於此刻的宇宙排列。");
  const [time, setTime] = useState(null);
  const [manifested, setManifested] = useState(false);
  const [fading, setFading] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);
  const manifestTimerRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(() =>
    loadStoredBoolean(STORAGE_KEYS.sound, true)
  );
  const [bookmarks, setBookmarks] = useState(() =>
    loadStoredJson(STORAGE_KEYS.bookmarks, [])
  );

  const signature = useMemo(() => createSignature(deck), [deck]);
  const shortSignature = signature.substring(0, 8);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.bookmarks, bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.sound, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (manifestTimerRef.current) window.clearTimeout(manifestTimerRef.current);
    };
  }, []);

  const googleFormUrl = useMemo(() => {
    if (!manifested) return GOOGLE_FORM_CONFIG.baseUrl;
    const params = new URLSearchParams();
    params.append(GOOGLE_FORM_CONFIG.entryDeck, deck.join(" · "));
    params.append(GOOGLE_FORM_CONFIG.entrySignature, `#${signature}`);
    params.append(GOOGLE_FORM_CONFIG.entryTime, time ? formatTime(time) : "");
    params.append(GOOGLE_FORM_CONFIG.entryQuote, quote);
    return `${GOOGLE_FORM_CONFIG.baseUrl}?${params.toString()}`;
  }, [deck, signature, time, quote, manifested]);

  function showToast(message) {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2000);
  }

  function manifestNow() {
    if (soundEnabled) void playSingingBowl();
    setFading(true);
    if (manifestTimerRef.current) {
      window.clearTimeout(manifestTimerRef.current);
    }
    manifestTimerRef.current = window.setTimeout(() => {
      setDeck(shuffleDeck());
      setQuote(randomQuote());
      setTime(new Date());
      setManifested(true);
      setFading(false);
    }, 320);
  }

  function bookmarkNow() {
    if (!manifested) {
      showToast("請先生成今日排列");
      return;
    }
    if (bookmarks.some((item) => item.signature === signature)) {
      showToast("這一刻已在觀照歷史中");
      return;
    }
    const item = {
      signature,
      quote,
      time: formatTime(time || new Date()),
      deck: deck.join(" · "),
    };
    setBookmarks((prev) => [item, ...prev].slice(0, 12));
    showToast("此刻已刻印為時空書籤");
  }

  async function exportShareImage() {
    if (!manifested) {
      showToast("請先生成今日排列");
      return;
    }
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        showToast("目前瀏覽器不支援圖卡匯出");
        return;
      }
      
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, 1200, 1600);
      
      // 星空微粒
      for (let i = 0; i < 120; i += 1) {
        ctx.fillStyle = `rgba(212,212,212,${Math.random() * 0.25})`;
        ctx.beginPath();
        ctx.arc(Math.random() * 1200, Math.random() * 1600, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.fillStyle = "#666666";
      ctx.font = "400 24px system-ui, -apple-system, sans-serif";
      try { ctx.letterSpacing = "0.18em"; } catch {}
      ctx.fillText("每一次洗牌 · 都是一個不會重來的瞬間", 100, 120);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "300 40px system-ui, -apple-system, sans-serif";
      try { ctx.letterSpacing = "0.08em"; } catch {}
      splitText(ctx, deck.join(" · "), 1000).slice(0, 9).forEach((line, index) => {
        ctx.fillText(line, 100, 240 + index * 56);
      });
      
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(80, 170, 1040, 620);
      
      ctx.fillStyle = "#ececec";
      ctx.font = "300 42px system-ui, -apple-system, sans-serif";
      try { ctx.letterSpacing = "0px"; } catch {}
      splitText(ctx, quote, 960).slice(0, 4).forEach((line, index) => {
        ctx.fillText(line, 100, 930 + index * 66);
      });
      
      ctx.fillStyle = "#555555";
      ctx.font = "300 28px system-ui, -apple-system, sans-serif";
      ctx.fillText("此組合出現機率為 1 / 52!（約 8.06 × 10⁶⁷ 分之一）。", 100, 1240);
      ctx.fillText("自宇宙誕生至今，此排列極大機率從未出現，未來亦不會重臨。", 100, 1290);
      ctx.fillText(`SPACE-TIME SIGNATURE：#${signature}`, 100, 1420);
      ctx.fillText(`52!：此刻唯一｜${time ? formatTime(time) : formatTime(new Date())}`, 100, 1480);
      
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) {
        showToast("圖卡產生失敗");
        return;
      }
      
      const file = new File([blob], `social-card-${shortSignature}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: "52!：此刻唯一", text: quote, files: [file] });
          return;
        } catch {}
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `social-card-${shortSignature}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast("圖卡匯出失敗");
    }
  }

  async function generateFactoryArtwork(type) {
    if (!manifested) {
      showToast("請先生成今日排列");
      return;
    }
    showToast(`正在產生${type === 'black' ? '黑 T' : '米白 T'}生產圖檔...`);
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      const canvas = document.createElement("canvas");
      canvas.width = 3500;
      canvas.height = 4500;
      const ctx = canvas.getContext("2d");
      
      ctx.clearRect(0, 0, 3500, 4500);
      const isBlackT = type === "black";
      ctx.fillStyle = isBlackT ? "#ffffff" : "#222222"; 
      ctx.textAlign = "center";
      
      const primaryFont = "600 120px system-ui, -apple-system, sans-serif";
      const secondaryFont = "400 65px system-ui, -apple-system, sans-serif";
      const deckFont = "400 80px 'JetBrains Mono', 'Space Mono', monospace, system-ui";
      const signatureFont = "500 70px 'JetBrains Mono', 'Space Mono', monospace, system-ui";
      const mathFont = "400 55px system-ui, -apple-system, sans-serif";
      
      ctx.font = primaryFont;
      try { ctx.letterSpacing = "0.05em"; } catch {}
      ctx.fillText(isBlackT ? "52! : THE ONLY MOMENT" : "THE ONLY MOMENT", 1750, 600);
      
      ctx.font = secondaryFont;
      ctx.fillStyle = isBlackT ? "#C8C8C0" : "#555555";
      try { ctx.letterSpacing = "0.02em"; } catch {}
      ctx.fillText(
        isBlackT ? "A wearable record of a moment that will never happen again." : "此刻唯一",
        1750, 800
      );
      
      ctx.font = deckFont;
      ctx.fillStyle = isBlackT ? "#ffffff" : "#222222";
      try { ctx.letterSpacing = "0.1em"; } catch {}
      const deckLines = formatDeckForShirt(deck);
      deckLines.forEach((line, index) => {
        ctx.fillText(line, 1750, 1400 + index * 160);
      });
      
      ctx.font = signatureFont;
      ctx.fillStyle = isBlackT ? "#C8C8C0" : "#555555";
      try { ctx.letterSpacing = "0.05em"; } catch {}
      ctx.fillText(`SPACE-TIME SIGNATURE #${signature}`, 1750, 2400);
      
      ctx.font = mathFont;
      ctx.fillStyle = isBlackT ? "#8C8C88" : "#8A8A8A";
      try { ctx.letterSpacing = "0.02em"; } catch {}
      if (isBlackT) {
        ctx.fillText("Generated from one sequence among 8.06 × 10^67 possible arrangements.", 1750, 2600);
        ctx.fillText("moment52.vercel.app", 1750, 4200); 
      } else {
        ctx.fillText("This moment will never happen again.", 1750, 2600);
        ctx.fillText("One arrangement among 8.06 × 10^67 possibilities.", 1750, 2750);
      }
      
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("圖檔生成失敗");
      const dateStr = formatDateShort();
      const filename = `M52-${dateStr}-${shortSignature}-front-${isBlackT ? "black" : "offwhite"}.png`;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showToast("生產圖檔匯出失敗");
    }
  }

  function handleOrderClick() {
    if (!manifested) {
      showToast("請先生成屬於您的今日排列");
      return;
    }
    const tShirtSection = document.getElementById("tshirt-section");
    if (tShirtSection) {
      tShirtSection.scrollIntoView({ behavior: "smooth" });
    } else {
      setShowPortal(true);
    }
  }

  return (
    <>
      <button
        onClick={() => setSoundEnabled((prev) => !prev)}
        className="fixed right-5 top-5 z-30 inline-flex items-center gap-2 text-xs text-neutral-700 transition hover:text-neutral-300"
        aria-label={soundEnabled ? "關閉聲音" : "開啟聲音"}
      >
        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        {soundEnabled ? "聲音開啟" : "聲音關閉"}
      </button>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-16"
        >
          <h1 className="mb-5 text-[2.5rem] font-extralight tracking-[0.2em] text-white sm:text-[3.5rem]">
            此刻唯一
          </h1>
          <p className="text-[0.9rem] font-light tracking-[0.1em] text-neutral-500 sm:text-[1rem]">
            Every moment is the only moment.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={signature + String(manifested)}
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{
                opacity: fading ? 0.28 : 1,
                filter: fading ? "blur(6px)" : "blur(0px)",
              }}
              exit={{ opacity: 0, filter: "blur(8px)" }}
              transition={{ duration: 0.5 }}
              className="mb-9 min-h-[146px] break-words rounded-[4px] border border-white/[0.055] bg-white/[0.022] px-6 py-6 text-[1.05rem] font-light leading-[1.9] tracking-[0.08em] text-white shadow-[0_0_80px_rgba(255,255,255,0.025)]"
            >
              {manifested ? deck.join(" · ") : "點擊下方，生成屬於此刻的宇宙排列。"}
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={{ opacity: fading ? 0.28 : 1 }}
            transition={{ duration: 0.45 }}
            className="mx-auto mb-9 min-h-[82px] max-w-[620px] text-[1.12rem] font-light leading-[1.9] text-[#ececec]"
          >
            {quote}
          </motion.div>

          <button
            onClick={() => setShowMath(true)}
            className="mx-auto mb-12 block max-w-[560px] text-center text-[0.78rem] font-light leading-[1.7] text-neutral-600 transition hover:text-neutral-400"
          >
            {manifested ? (
              <>
                此組合出現機率為 1 / 52!（約 {FACTORIAL_SHORT} 分之一）。
                <br />
                自宇宙誕生 138 億年至今，此排列極大機率從未出現，未來亦不會重臨。
              </>
            ) : (
              <>52 張牌共有 52! 種排列。點擊後，將有一組排列在此刻顯現。</>
            )}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[0.85rem] text-neutral-500">
            <button
              onClick={manifestNow}
              className="inline-flex items-center gap-2 border border-white/20 px-8 py-3 text-white transition hover:bg-white hover:text-black"
            >
              <Infinity size={18} />
              查看今天的宇宙排列
            </button>

            <button
              onClick={bookmarkNow}
              className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"
            >
              <Bookmark size={16} /> 時空書籤
            </button>

            <button
              onClick={exportShareImage}
              className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"
            >
              <Share2 size={16} /> 匯出圖卡
            </button>

            <button
              onClick={handleOrderClick}
              className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"
            >
              <Shirt size={16} /> 支持 & 訂製
            </button>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center gap-8 text-[0.7rem] tracking-[0.1em] text-neutral-600">
          {manifested && (
            <div className="text-center">
              SPACE-TIME SIGNATURE #{signature}
              <br />
              {time ? `· ${formatTime(time)}` : ""}
            </div>
          )}

          {bookmarks.length > 0 && (
            <div className="w-full max-w-md text-left">
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-2 text-[0.75rem] text-neutral-400">
                <Bookmark size={14} /> 觀照歷史
              </div>
              {bookmarks.slice(0, 3).map((item) => (
                <div
                  key={`${item.signature}-${item.time}`}
                  className="mb-3 border border-white/[0.05] bg-white/[0.018] p-3 text-xs leading-6 text-neutral-500"
                >
                  <span className="text-neutral-400">
                    #{item.signature} · {item.time}
                  </span>
                  <br />
                  {item.quote}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* T-Shirt Product Section */}
      <div id="tshirt-section" className="mx-auto mt-24 mb-32 max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
          
          {/* 左側：真實商品攝影照片 */}
          <div className="flex flex-col gap-4">
            <img 
              src="/tshirt-front.png" 
              alt="52! 此刻唯一 T 恤平面照" 
              className="w-full rounded-[4px] border border-white/10 bg-[#0a0a0a] object-cover shadow-2xl"
            />
            <img 
              src="/tshirt-detail.png" 
              alt="52! 此刻唯一 T 恤細節照" 
              className="w-full rounded-[4px] border border-white/10 bg-[#0a0a0a] object-cover shadow-2xl"
            />
            <p className="text-center text-[0.7rem] text-neutral-600">
              * 實體商品攝影，黑色極簡款
            </p>
          </div>

          {/* 右側：商品資訊與訂製入口 */}
          <div className="text-left">
            <h3 className="mb-6 text-2xl font-light text-white">把這一刻做成 T 恤</h3>
            <p className="mb-8 text-[0.95rem] leading-[1.8] text-neutral-400">
              每一次洗牌，都會產生一組專屬牌序與 Space-Time Signature。
              這不是大量生產的圖案，而是你在這一刻生成的唯一排列。<br /><br />
              你可以把它轉化為一件只屬於自己的客製 T 恤。
            </p>
            
            <div className="mb-8 rounded-[4px] bg-white/[0.02] p-6 border border-white/[0.05]">
              <ul className="space-y-3 text-[0.85rem] text-neutral-400">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neutral-500"></span>
                  正面印製專屬牌序與 Space-Time Signature
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neutral-500"></span>
                  黑色極簡款，100% 精梳棉
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neutral-500"></span>
                  接單後製作，約 7–14 個工作天出貨
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-neutral-500"></span>
                  客製商品恕不適用七天鑑賞期退換貨
                </li>
              </ul>
              <div className="mt-6 border-t border-white/[0.05] pt-4 text-xl font-light text-white">
                NT$1,280
              </div>
            </div>

            <button 
              onClick={() => setShowPortal(true)} 
              className="w-full rounded-[4px] border border-white/20 bg-transparent px-6 py-4 text-sm tracking-widest text-white transition hover:bg-white hover:text-black"
            >
              訂製我的此刻 T 恤
            </button>
            {!manifested && (
              <p className="mt-3 text-center text-[0.75rem] text-neutral-600">
                請先於上方生成今日排列，再進入訂製。
              </p>
            )}
          </div>
          
        </div>
      </div>

      {/* Toast 提示 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap bg-white px-5 py-3 text-sm text-black shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 彈窗：52! 數學數據 */}
      <AnimatePresence>
        {showMath && (
          <Modal onClose={() => setShowMath(false)}>
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Infinity size={20} className="text-neutral-400" />
              <h2 className="text-lg tracking-widest text-white">The Mathematical Shock</h2>
            </div>
            <h3 className="mb-4 text-sm font-medium text-neutral-200">52! 的冷數據</h3>
            <p className="mb-6 text-sm leading-relaxed text-neutral-400">
              52 張不同的牌排成一列，第一張有 52 種可能，第二張剩 51 種，第三張剩 50 種，直到最後一張。全部相乘，就是 52!。
            </p>
            <div className="break-all rounded bg-white/[0.03] p-4 font-mono text-[0.75rem] leading-relaxed text-neutral-500">
              {FACTORIAL_FULL}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-neutral-400">
              <div className="flex justify-between">
                <span>宇宙年齡</span>
                <span className="text-white">約 138 億年</span>
              </div>
              <div className="flex justify-between">
                <span>宇宙誕生至今秒數</span>
                <span className="text-white">約 4.35 × 10¹⁷ 秒</span>
              </div>
              <div className="flex justify-between font-medium text-white">
                <span>52 張牌完整排列</span>
                <span>約 8.06 × 10⁶診 種</span>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* 彈窗：訂製與生產入口 */}
      <AnimatePresence>
        {showPortal && (
          <Modal onClose={() => setShowPortal(false)}>
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Shirt size={20} className="text-neutral-400" />
              <h2 className="text-lg tracking-widest text-white">The Portal</h2>
            </div>
            <h3 className="mb-4 text-sm font-medium text-neutral-200">訂製此刻唯一 T 恤（NT$1,280）</h3>
            <div className="mb-6 space-y-3 text-sm leading-relaxed text-neutral-400">
              <p>不是因為這件衣服特殊。而是因為今天的你不會再出現一次。</p>
              <p>點擊進入表單，系統會自動帶入您當下的牌序、簽章與金句。我們將為您將這一刻轉化為可穿戴的實體紀念。</p>
              <div className="mt-4 rounded bg-white/[0.02] p-4 text-[0.8rem] border border-white/5">
                <strong className="text-neutral-300 mb-1 block">客製化商品聲明與個資保護告知</strong>
                依據消費者保護法第 19 條規定，此商品屬於「依消費者要求所為之客製化給付」，不適用七天鑑賞期退換貨規定。
                您填寫的姓名、電話、地址等資訊，僅供生產寄送與客服核對使用，絕不挪作他用。
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => generateFactoryArtwork('black')}
                  className="inline-flex w-full items-center justify-center gap-2 border border-white/10 px-4 py-2 text-xs text-neutral-500 transition hover:border-white/40 hover:text-neutral-200"
                >
                  <Download size={14} /> 產生「黑 T」生產圖檔
                </button>
                <button
                  onClick={() => generateFactoryArtwork('offwhite')}
                  className="inline-flex w-full items-center justify-center gap-2 border border-white/10 px-4 py-2 text-xs text-neutral-500 transition hover:border-white/40 hover:text-neutral-200"
                >
                  <Download size={14} /> 產生「米白 T」生產圖檔
                </button>
              </div>
              <a
                href={googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-neutral-200 sm:w-auto mt-4 sm:mt-0 self-end"
                onClick={() => setShowPortal(false)}
              >
                進入訂製表單
              </a>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
