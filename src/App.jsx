import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Infinity as InfinityIcon,
  Share2,
  Volume2,
  VolumeX,
  X,
  Shirt,
  Settings,
  Menu
} from "lucide-react";

// ============================================================================
// 1. 核心配置與常數
// ============================================================================
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const BASE_DECK = SUITS.flatMap((suit) => RANKS.map((rank) => `${suit}${rank}`));

const STORAGE_KEYS = {
  bookmarks: "moment52_bookmarks",
  sound: "moment52_sound",
  lang: "moment52_lang"
};

const GOOGLE_FORM_CONFIG = {
  baseUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform",
  entryDeck: "entry.907849226",      
  entrySignature: "entry.1745604772", 
  entryTime: "entry.284034277",      
  entryQuote: "entry.369992627",     
  entryArtworkId: "entry.1489093389", 
};

const FACTORIAL_SHORT = "8.06 × 10⁶⁷";
const FACTORIAL_FULL = "80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000";

let sharedAudioContext = null;

// ============================================================================
// 2. 文本與多語系資料
// ============================================================================
const QUOTES_ZH = [
  "雨，只是雨。沉默，只是沉默。眼前的牌，也只是此時此刻的因緣和合。",
  "這一組排列，是高達 52! 的宇宙機率在這一秒的凝聚。它來了，然後它就會散去。",
  "任何強烈浮現的現象，本質上都只是機率波在當下的一次微弱震盪。",
  "事情正在發生，現象正在顯現。你不需要去修理它，你只需要照見它。",
  "宇宙沒有故事，故事是理性大腦為了讓自己安心，而替當下加上去的旁白。",
  "當偏差被光照亮，系統自然會回歸平衡。此時此刻，不需動手，只需看見。",
  "也許人生本來就不是為了得到答案，而是學會不帶評判地觀看。",
  "這一刻的喧囂或寂靜，在漫長的時間軸裡，都只是由無數隨機參數交織出的微小訊號。",
  "你感覺到的那些內耗與痛苦，幕後其實只是大腦部門在處理衝突時的摩擦力。你，不是那個衝突。",
  "任何迎面而來的焦慮、拖延與愧疚，都只是低階代理人之間的訊號延遲。冷靜地看著它，它就會大解離。",
  "自我是一個功能，而非一個實體。當系統不再內耗，這個救火隊員自然會退場。",
  "你不需要對每一個隨機產出的結果負責，但你必須對此時此刻寫下的意圖負責。",
  "當系統接管了做，你終於可以開始活。不要急著逃離這一刻。",
  "真正重要的，從來不是在時空中留下了什麼，而是有沒有在有限的格子裡，盡可能誠實地活過。"
];

const QUOTES_EN = [
  "Rain is just rain. Silence is just silence. These cards are just the convergence of conditions in this exact moment.",
  "This specific arrangement is a manifestation of 52! probability in a single second. It arrives, and then it scatters.",
  "Any intense phenomenon is fundamentally just a subtle vibration of probability waves in the present moment.",
  "Things are happening. Phenomena are manifesting. You don't need to fix it; you only need to witness it.",
  "The universe has no stories. Stories are narratives added by the rational brain to make itself feel secure.",
  "Perhaps life is not about finding answers, but learning to observe without judgment.",
  "The noise or silence of this moment is merely a tiny signal woven from countless random parameters.",
  "The internal friction and pain you feel are just processing delays between low-level agents. Observe it calmly, and it disentangles.",
  "The 'self' is a function, not an entity. When the system stops fighting itself, the firefighter naturally steps down.",
  "When systems take over the 'doing', you can finally begin 'being'. Don't rush to escape this moment.",
  "What truly matters is not what you leave behind in space-time, but whether you have lived as honestly as possible within your finite grid."
];

const DICT = {
  zh: {
    nav_home: "首頁",
    nav_texts: "思想摘錄",
    nav_partners: "合作提案",
    hero_title: "每一次洗牌 · 皆是宇宙級的顯化",
    hero_init: "點擊下方，見證此刻唯一的因緣顯化",
    btn_manifest: "觀照當下",
    btn_bookmark: "時空書籤",
    btn_share: "匯出分享圖卡",
    btn_order: "訂製此刻 T 恤",
    math_desc: `52 張牌，有 52! 種排列。大約是 ${FACTORIAL_SHORT}。\n每一次完整的洗牌，都極大機率是宇宙 138 億年歷史中從未出現，未來也不會再重複的一組排列。\n\n這不是占卜，也不是賭博。\n這是一個提醒：你正在經驗的這一秒，不是普通的一秒，而是宇宙中不會重來的片刻。`,
    toast_wait: "請先觀照當下",
    toast_bookmark: "此刻已刻印為時空書籤",
    portal_title: "建立連接：客製 T 恤",
    portal_desc: "將此片刻的牌序、金句、哈希簽章永久刻印，轉化為實體存在。",
    portal_notice: "系統已為此刻建立 Artwork ID。請進入表單填寫尺寸、款式與收件資料。營運端將依據表單中的牌序與 Signature 重新產生工廠印刷圖檔。客製商品不適用七天鑑賞期退換貨。",
    portal_btn: "前往訂製表單 (NT$1,280)"
  },
  en: {
    nav_home: "Home",
    nav_texts: "Texts Behind",
    nav_partners: "For Partners",
    hero_title: "Every shuffle is a cosmic-level manifestation",
    hero_init: "Click below to witness the unique manifestation of this moment",
    btn_manifest: "Manifest Now",
    btn_bookmark: "Bookmark",
    btn_share: "Share Card",
    btn_order: "Order T-Shirt",
    math_desc: `52 cards, 52! permutations. Approximately ${FACTORIAL_SHORT}.\nEvery complete shuffle is a sequence that has likely never occurred in the 13.8 billion years of cosmic history, and will never repeat.\n\nThis is not fortune-telling or gambling.\nIt is a reminder: the second you are experiencing is not ordinary; it is a moment in the universe that will never return.`,
    toast_wait: "Please manifest a moment first",
    toast_bookmark: "Moment bookmarked",
    portal_title: "Establish Connection: Custom T-Shirt",
    portal_desc: "Permanently imprint the sequence, quote, and hash signature of this moment into physical existence.",
    portal_notice: "An Artwork ID has been generated for this moment. Please enter the form to fill in your size and shipping details. The operation team will regenerate the factory artwork based on your sequence. Custom items are non-refundable.",
    portal_btn: "Go to Order Form"
  }
};

const BILINGUAL_TEXTS = [
  {
    id: 1,
    zh_title: "我們都是機率波",
    en_title: "We Are Probability Waves",
    zh_content: "世界不是固定的物體，而是因緣、觀看與機率暫時收束出的現象。每一次洗牌，都像一次微型宇宙的顯化。量子力學中的觀察者效應告訴我們：未被觀察的世界是機率波，而你的意識，是讓其塌縮成現實的開關。你的每一次凝視，都是一次宇宙的自拍。",
    en_content: "The world is not a fixed object, but a phenomenon temporarily collapsed by conditions, observation, and probability. Every shuffle is the manifestation of a micro-universe. Unobserved reality remains a probability wave; your consciousness is the switch that collapses it into reality. Every gaze is the universe taking a selfie."
  },
  {
    id: 2,
    zh_title: "大解離",
    en_title: "The Great Disentanglement",
    zh_content: "當 AI 接管了「做」，人類真正不能外包的，是觀看、選擇與承擔。這個網站不是工具，而是一次把「活」放回中心的練習。執行正在被系統性地外包；而存在無法被外包。當行動被代理，真正重要的不再是如何做，而是你是否能純粹地、不帶摩擦地活著。",
    en_content: "When AI takes over 'doing', what humans truly cannot outsource is observing, choosing, and bearing consequence. This site is not a tool, but an exercise in putting 'being' back at the center. Execution is systematically outsourced; existence cannot be. When action is delegated, what matters is living purely, without friction."
  },
  {
    id: 3,
    zh_title: "僧侶 CEO",
    en_title: "The Monk CEO",
    zh_content: "不是更努力，而是降低內耗。當所有行動都被優化，真正重要的是你的系統是否還有一個安靜的後台。意志力不是蠻力，它是清理雜訊後的物理現象。真正的現實扭曲，不是靠施加壓力，而是靠移除阻力。不是做更多，而是刪除 99% 的平庸選項。",
    en_content: "It is not about trying harder, but reducing internal friction. When all actions are optimized, what matters is whether your system still has a quiet backend. Willpower is not brute force; it's a physical phenomenon after clearing the noise. True reality distortion relies on removing resistance, not applying pressure. Delete 99% of mediocre options."
  },
  {
    id: 4,
    zh_title: "關係的結構",
    en_title: "The Structure of Relationships",
    zh_content: "關係不是可以擁有的東西，而是條件暫時聚合的事件。就像一組牌序，來了，顯現，然後散去。最大的自由，是不再需要透過關係來證明什麼。停止像蓋城堡一樣去經營關係，開始像衝浪一樣去經歷關係。來去之間，只是一場純粹的見證。",
    en_content: "A relationship is not an object to be owned, but an event of conditions temporarily converging. Like a sequence of cards, it arrives, manifests, and scatters. The greatest freedom is no longer needing relationships to prove anything. Stop managing relationships like building castles; start experiencing them like surfing."
  }
];

// ============================================================================
// 3. 工具與共用函式
// ============================================================================
function isBrowser() { return typeof window !== "undefined"; }
function isLineBrowser() { return isBrowser() && /Line/i.test(navigator.userAgent); }

function trackPixelEvent(eventName, params = {}) {
  if (isBrowser() && window.fbq) {
    try { window.fbq("trackCustom", eventName, params); } catch (e) { console.error(e); }
  }
}

function loadStoredBoolean(key, fallback = false) {
  if (!isBrowser()) return fallback;
  try { const val = window.localStorage.getItem(key); return val === null ? fallback : val === "true"; } catch { return fallback; }
}

function loadStoredJson(key, fallback) {
  if (!isBrowser()) return fallback;
  try { const val = window.localStorage.getItem(key); return val ? JSON.parse(val) : fallback; } catch { return fallback; }
}

function saveToStorage(key, value) {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value)); } catch {}
}

function secureRandomInt(max) {
  if (max <= 0) return 0;
  if (isBrowser() && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / max) * max;
    let value;
    do { window.crypto.getRandomValues(array); value = array[0]; } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function shuffleDeck() {
  const deck = [...BASE_DECK];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function randomQuote(lang) {
  const quotes = lang === 'en' ? QUOTES_EN : QUOTES_ZH;
  return quotes[secureRandomInt(quotes.length)];
}

function createSignature(deck) {
  const text = deck.join("");
  let hash = 0xcbf29ce484222325n;
  for (let i = 0; i < text.length; i++) {
    hash ^= BigInt(text.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).toUpperCase().padStart(16, "0");
}

function formatTime(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(date);
}

function getYYYYMMDD(dateObj) {
  const d = dateObj || new Date();
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function playSingingBowl() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!sharedAudioContext) sharedAudioContext = new AudioContext();
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") await ctx.resume();
    
    const osc = ctx.createOscillator(), overtone = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter();
    osc.type = "sine"; overtone.type = "sine";
    osc.frequency.setValueAtTime(144, ctx.currentTime);
    overtone.frequency.setValueAtTime(288, ctx.currentTime);
    filter.type = "lowpass"; filter.frequency.setValueAtTime(700, ctx.currentTime);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.6);
    osc.connect(filter); overtone.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    osc.start(); overtone.start(); osc.stop(ctx.currentTime + 3.7); overtone.stop(ctx.currentTime + 3.7);
  } catch {}
}

function splitText(ctx, text, maxWidth) {
  const chars = text.split(""), lines = [];
  let current = "";
  chars.forEach((c) => {
    if (ctx.measureText(current + c).width > maxWidth && current) { lines.push(current); current = c; }
    else { current += c; }
  });
  if (current) lines.push(current);
  return lines;
}

function Modal({ children, onClose, maxWidth = "max-w-xl" }) {
  useEffect(() => {
    const hk = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", hk);
    return () => window.removeEventListener("keydown", hk);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md" role="dialog"
      >
        <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className={`relative max-h-[88vh] w-full ${maxWidth} overflow-y-auto border border-white/10 bg-black p-7 text-left text-neutral-300 shadow-2xl`}
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-neutral-500 hover:text-white"><X className="h-5 w-5" /></button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

async function renderFactoryCanvas(templateType, targetDeckArr, targetSignature) {
  if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
  const lines = [targetDeckArr.slice(0, 13).join(" · "), targetDeckArr.slice(13, 26).join(" · "), targetDeckArr.slice(26, 39).join(" · "), targetDeckArr.slice(39, 52).join(" · ")];

  canvas.width = 3500; canvas.height = 4500; ctx.clearRect(0, 0, 3500, 4500); ctx.textAlign = "center";
  
  if (templateType === "black_front") {
    ctx.fillStyle = "#F5F5F0"; ctx.font = "600 110px 'Inter', sans-serif"; ctx.fillText("52! : THE ONLY MOMENT", 1750, 700);
    ctx.fillStyle = "#C8C8C0"; ctx.font = "400 55px 'Inter', sans-serif"; ctx.fillText("A wearable record of a moment that will never happen again.", 1750, 850);
    ctx.fillStyle = "#F5F5F0"; ctx.font = "400 65px 'IBM Plex Mono', monospace"; lines.forEach((l, i) => ctx.fillText(l, 1750, 1600 + i * 140));
    ctx.fillStyle = "#C8C8C0"; ctx.font = "500 60px 'IBM Plex Mono', monospace"; ctx.fillText(`SPACE-TIME SIGNATURE #${targetSignature}`, 1750, 3600);
    ctx.fillStyle = "#8C8C88"; ctx.font = "400 45px 'Inter', sans-serif"; ctx.fillText("Generated from one sequence among 8.06 × 10⁶⁷ possible arrangements.", 1750, 3750);
    ctx.font = "400 35px 'Inter', sans-serif"; ctx.fillText("moment52.vercel.app", 1750, 4200);
  } else {
    ctx.fillStyle = "#222222"; ctx.font = "600 120px 'Inter', sans-serif"; ctx.fillText("THE ONLY MOMENT", 1750, 800);
    ctx.fillStyle = "#555555"; ctx.font = "400 60px 'Noto Sans TC', sans-serif"; ctx.fillText("此刻唯一", 1750, 950);
    ctx.fillStyle = "#222222"; ctx.font = "400 65px 'IBM Plex Mono', monospace"; lines.forEach((l, i) => ctx.fillText(l, 1750, 1700 + i * 160));
    ctx.fillStyle = "#555555"; ctx.font = "500 55px 'IBM Plex Mono', monospace"; ctx.fillText(`SPACE-TIME SIGNATURE #${targetSignature}`, 1750, 3600);
    ctx.fillStyle = "#222222"; ctx.font = "400 50px 'Inter', sans-serif"; ctx.fillText("This moment will never happen again.", 1750, 3750);
    ctx.fillStyle = "#8A8A8A"; ctx.font = "400 40px 'Inter', sans-serif"; ctx.fillText("One arrangement among 8.06 × 10⁶⁷ possibilities.", 1750, 3850);
  }
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

// ============================================================================
// 4. 主要應用元件
// ============================================================================
export default function App() {
  const [lang, setLang] = useState(() => {
    if (isBrowser()) return window.localStorage.getItem(STORAGE_KEYS.lang) || "zh";
    return "zh";
  });
  const [view, setView] = useState("home"); // 'home', 'texts', 'partners'

  const [deck, setDeck] = useState(() => shuffleDeck());
  const [quote, setQuote] = useState(DICT[lang].hero_init);
  const [time, setTime] = useState(null);
  const [manifested, setManifested] = useState(false);
  const [fading, setFading] = useState(false);
  
  const [showPortal, setShowPortal] = useState(false);
  const [showOperator, setShowOperator] = useState(false);
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const toastTimerRef = useRef(null);
  const manifestTimerRef = useRef(null);
  const opClicks = useRef(0);
  const t = DICT[lang];

  const [soundEnabled, setSoundEnabled] = useState(() => loadStoredBoolean(STORAGE_KEYS.sound, true));
  const [bookmarks, setBookmarks] = useState(() => loadStoredJson(STORAGE_KEYS.bookmarks, []));

  const [opDeckStr, setOpDeckStr] = useState("");
  const [opSignature, setOpSignature] = useState("");

  const signature = useMemo(() => createSignature(deck), [deck]);
  const artworkId = useMemo(() => `M52-${getYYYYMMDD(time)}-${signature.substring(0, 8)}`, [signature, time]);

  const googleFormUrl = useMemo(() => {
    if (!manifested) return "#";
    const params = new URLSearchParams();
    params.append(GOOGLE_FORM_CONFIG.entryDeck, deck.join(" · "));
    params.append(GOOGLE_FORM_CONFIG.entrySignature, `#${signature}`);
    params.append(GOOGLE_FORM_CONFIG.entryTime, time ? formatTime(time) : "");
    params.append(GOOGLE_FORM_CONFIG.entryQuote, quote);
    params.append(GOOGLE_FORM_CONFIG.entryArtworkId, artworkId);
    return `${GOOGLE_FORM_CONFIG.baseUrl}?${params.toString()}`;
  }, [deck, signature, quote, time, manifested, artworkId]);

  useEffect(() => { saveToStorage(STORAGE_KEYS.bookmarks, bookmarks); }, [bookmarks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.sound, String(soundEnabled)); }, [soundEnabled]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.lang, lang); }, [lang]);
  useEffect(() => {
    trackPixelEvent("ViewContent");
    return () => { clearTimeout(toastTimerRef.current); clearTimeout(manifestTimerRef.current); };
  }, []);

  // Update initial quote if not manifested when language changes
  useEffect(() => { if (!manifested) setQuote(DICT[lang].hero_init); }, [lang, manifested]);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2500);
  }

  function handleSecretClick() {
    opClicks.current += 1;
    if (opClicks.current >= 5) { setShowOperator(true); opClicks.current = 0; }
    setTimeout(() => { opClicks.current = 0; }, 2000);
  }

  function manifestNow() {
    if (soundEnabled) void playSingingBowl();
    setFading(true);
    clearTimeout(manifestTimerRef.current);
    manifestTimerRef.current = setTimeout(() => {
      const newDeck = shuffleDeck(); const newQuote = randomQuote(lang);
      setDeck(newDeck); setQuote(newQuote); setTime(new Date()); setManifested(true); setFading(false);
      trackPixelEvent("ManifestMoment", { signature: createSignature(newDeck), quote: newQuote });
    }, 320);
  }

  function bookmarkNow() {
    if (!manifested) return showToast(t.toast_wait);
    if (bookmarks.some(i => i.signature === signature)) return;
    setBookmarks(p => [{ signature, quote, time: formatTime(time || new Date()), deck: deck.join(" · ") }, ...p].slice(0, 12));
    showToast(t.toast_bookmark);
  }

  async function exportSocialImage() {
    if (!manifested) return showToast(t.toast_wait);
    if (isLineBrowser()) return showToast("LINE 內建瀏覽器不支援圖片下載。請點右上角「⋯」選擇以 Chrome / Safari 開啟");
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 1600; const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 1200, 1600);
      for (let i = 0; i < 120; i++) {
        ctx.fillStyle = `rgba(212,212,212,${Math.random() * 0.25})`; ctx.beginPath(); ctx.arc(Math.random() * 1200, Math.random() * 1600, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#666666"; ctx.font = "400 24px system-ui, sans-serif"; ctx.fillText(t.hero_title, 100, 120);
      ctx.fillStyle = "#ffffff"; ctx.font = "300 40px system-ui, sans-serif"; splitText(ctx, deck.join(" · "), 1000).slice(0, 9).forEach((l, i) => ctx.fillText(l, 100, 240 + i * 56));
      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.strokeRect(80, 170, 1040, 620);
      ctx.fillStyle = "#ececec"; ctx.font = "300 42px system-ui, sans-serif"; splitText(ctx, quote, 960).slice(0, 4).forEach((l, i) => ctx.fillText(l, 100, 930 + i * 66));
      ctx.fillStyle = "#555555"; ctx.font = "300 28px system-ui, sans-serif";
      ctx.fillText(`SPACE-TIME SIGNATURE：#${signature}`, 100, 1420);
      ctx.fillText(`52!：The Only Moment｜${time ? formatTime(time) : formatTime(new Date())}`, 100, 1480);
      const blob = await new Promise(r => canvas.toBlob(r, "image/png"));
      if (!blob) return;
      const file = new File([blob], `social-card-${signature}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ title: "52!", text: quote, files: [file] }); return; } catch {} }
      downloadBlob(blob, `social-card-${signature}.png`);
    } catch { showToast("Failed to export"); }
  }

  async function handleOrderProcess(e) {
    if (!manifested) { e.preventDefault(); return showToast(t.toast_wait); }
    trackPixelEvent("ClickWearable", { signature, artworkId });
    setShowPortal(false); setTimeout(() => window.open(googleFormUrl, "_blank"), 500);
  }

  async function handleOperatorGenerate(colorType) {
    if (!opDeckStr.trim() || !opSignature.trim()) return showToast("請填寫牌序與 Signature");
    const arr = opDeckStr.split("·").map(s => s.trim()).filter(Boolean);
    try {
      const cleanSig = opSignature.replace("#", "").trim();
      const blob = await renderFactoryCanvas(`${colorType}_front`, arr, cleanSig);
      downloadBlob(blob, `Manual-M52-${cleanSig.substring(0,8)}-front-${colorType}.png`);
      showToast("生產圖檔已匯出");
    } catch (err) { showToast("生成失敗"); }
  }

  // ============================================================================
  // Views
  // ============================================================================
  const renderHome = () => (
    <motion.main initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center px-5 pt-24 pb-32 min-h-screen">
      <section className="w-full max-w-[660px] text-center">
        <div onClick={handleSecretClick} className="mb-10 text-[0.78rem] uppercase tracking-[0.28em] text-neutral-500 cursor-default select-none">
          {t.hero_title}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={signature + String(manifested)} initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: fading ? 0.28 : 1, filter: fading ? "blur(6px)" : "blur(0px)" }} transition={{ duration: 0.5 }}
            className="mb-9 min-h-[146px] break-words rounded-[4px] border border-white/[0.055] bg-white/[0.022] px-6 py-6 text-[1.05rem] font-light leading-[1.9] tracking-[0.08em] text-white shadow-[0_0_80px_rgba(255,255,255,0.025)]"
          >
            {manifested ? deck.join(" · ") : t.hero_init}
          </motion.div>
        </AnimatePresence>
        <motion.div animate={{ opacity: fading ? 0.28 : 1 }} className="mx-auto mb-10 min-h-[82px] max-w-[620px] text-[1.12rem] font-light leading-[1.9] text-[#ececec]">
          {quote}
        </motion.div>
        <div className="flex flex-col items-center justify-center gap-5">
          <button onClick={manifestNow} className="rounded-[2px] border border-white/20 bg-transparent px-10 py-4 text-[0.88rem] uppercase tracking-[0.18em] text-neutral-300 transition duration-300 hover:border-white/60 hover:bg-white/[0.025] hover:text-white active:scale-[0.98]">
            {t.btn_manifest}
          </button>
          <div className="max-w-[500px] mt-6 text-[0.82rem] font-light leading-[1.8] text-neutral-500 whitespace-pre-line text-center">
            {t.math_desc}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs text-neutral-600">
            <button onClick={bookmarkNow} className="inline-flex items-center gap-1.5 px-2 py-1 hover:text-neutral-300"><Bookmark className="h-3.5 w-3.5" /> {t.btn_bookmark}</button>
            <span className="text-neutral-800">/</span>
            <button onClick={exportSocialImage} className="inline-flex items-center gap-1.5 px-2 py-1 hover:text-neutral-300"><Share2 className="h-3.5 w-3.5" /> {t.btn_share}</button>
            <span className="text-neutral-800">/</span>
            <button onClick={() => setShowPortal(true)} className="inline-flex items-center gap-1.5 px-2 py-1 hover:text-neutral-300"><Shirt className="h-3.5 w-3.5" /> {t.btn_order}</button>
          </div>
        </div>
        {manifested && <div className="mt-10 font-mono text-[0.68rem] tracking-[0.2em] text-neutral-700">SPACE-TIME SIGNATURE #{signature}</div>}
      </section>
    </motion.main>
  );

  const renderTexts = () => (
    <motion.main initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-5 pt-32 pb-24 max-w-4xl mx-auto min-h-screen">
      <div className="mb-16 text-center">
        <h1 className="text-xl font-light text-neutral-200 tracking-widest mb-4">Texts Behind This Project</h1>
        <p className="text-sm text-neutral-500">The philosophical universe of 52!</p>
      </div>
      <div className="space-y-12">
        {BILINGUAL_TEXTS.map(item => (
          <div key={item.id} className="border-t border-white/[0.05] pt-12 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="text-[0.68rem] uppercase tracking-[0.2em] text-neutral-600">{String(item.id).padStart(2,'0')} ｜ ZH</div>
              <h2 className="text-lg font-light text-neutral-200 tracking-wide">{item.zh_title}</h2>
              <p className="text-[0.9rem] font-light leading-[2.2] text-neutral-400">{item.zh_content}</p>
            </div>
            <div className="flex-1 space-y-4">
              <div className="text-[0.68rem] uppercase tracking-[0.2em] text-neutral-600">{String(item.id).padStart(2,'0')} ｜ EN</div>
              <h2 className="text-lg font-light text-neutral-200 tracking-wide">{item.en_title}</h2>
              <p className="text-[0.9rem] font-light leading-[2.2] text-neutral-400">{item.en_content}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.main>
  );

  const renderPartners = () => (
    <motion.main initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-5 pt-32 pb-24 max-w-2xl mx-auto min-h-screen text-center">
      <h1 className="text-2xl font-light text-neutral-200 tracking-widest mb-8">For Partners</h1>
      <div className="space-y-8 text-[0.95rem] font-light leading-[2] text-neutral-400 text-left">
        <p>
          <strong className="text-neutral-200 font-normal">52! The Only Moment</strong> is a hybrid philosophical and commercial experiment. It translates the mathematical absolute of a 52-card permutation (8.06 × 10⁶⁷) into a mindful digital experience and customized physical merchandise.
        </p>
        <p>
          We operate a zero-friction production pipeline. The digital manifestation engine automatically binds the user's specific moment (Space-Time Signature) to a high-resolution, factory-ready DTG (Direct-to-Garment) artwork file.
        </p>
        <p>
          <strong className="text-neutral-200 font-normal">Offline Collaboration & Popup Events:</strong><br/>
          We are actively seeking international concept stores, boutique cafes, and gallery spaces for 'Shop-in-Shop' collaborations. We provide the interactive manifestation iPad engine and the backend supply chain; you provide the physical space and sensory experience (coffee, ambiance, sound).
        </p>
        <div className="pt-8 border-t border-white/[0.05] text-center">
          <p className="mb-4">To discuss commercial partnerships, exhibition possibilities, or B2B integrations, please contact us.</p>
          <a href="mailto:contact@moment52.vercel.app" className="text-emerald-500 hover:text-emerald-400 border-b border-emerald-500/30 pb-1">contact@moment52.vercel.app</a>
        </div>
      </div>
    </motion.main>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4] selection:bg-white selection:text-black font-sans">
      <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.035),transparent_24%)]" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('home')} className="text-lg font-light tracking-widest text-white hover:text-neutral-300">52!</button>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-[0.8rem] tracking-widest uppercase">
            <button onClick={() => setView('home')} className={`transition ${view==='home'?'text-white':'text-neutral-500 hover:text-neutral-300'}`}>{t.nav_home}</button>
            <button onClick={() => setView('texts')} className={`transition ${view==='texts'?'text-white':'text-neutral-500 hover:text-neutral-300'}`}>{t.nav_texts}</button>
            <button onClick={() => setView('partners')} className={`transition ${view==='partners'?'text-white':'text-neutral-500 hover:text-neutral-300'}`}>{t.nav_partners}</button>
            <div className="w-px h-4 bg-white/10"></div>
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="text-neutral-400 hover:text-white transition w-8 text-center">{lang === 'zh' ? 'EN' : 'ZH'}</button>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-neutral-400 hover:text-white transition">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-5 text-[0.8rem]">
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="text-neutral-400 hover:text-white">{lang === 'zh' ? 'EN' : 'ZH'}</button>
            <button onClick={() => setMenuOpen(true)} className="text-neutral-400"><Menu className="h-5 w-5" /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity:0, x: 20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 text-sm tracking-widest uppercase">
            <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-6 text-neutral-500"><X className="h-6 w-6"/></button>
            <button onClick={() => {setView('home'); setMenuOpen(false);}} className={view==='home'?'text-white':'text-neutral-500'}>{t.nav_home}</button>
            <button onClick={() => {setView('texts'); setMenuOpen(false);}} className={view==='texts'?'text-white':'text-neutral-500'}>{t.nav_texts}</button>
            <button onClick={() => {setView('partners'); setMenuOpen(false);}} className={view==='partners'?'text-white':'text-neutral-500'}>{t.nav_partners}</button>
            <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-neutral-500 mt-4 flex items-center gap-2">
               {soundEnabled ? <><Volume2 className="h-4 w-4"/> Sound On</> : <><VolumeX className="h-4 w-4"/> Sound Off</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' && <motion.div key="home">{renderHome()}</motion.div>}
        {view === 'texts' && <motion.div key="texts">{renderTexts()}</motion.div>}
        {view === 'partners' && <motion.div key="partners">{renderPartners()}</motion.div>}
      </AnimatePresence>

      {/* Operator Mode Modal */}
      {showOperator && (
        <Modal onClose={() => setShowOperator(false)}>
          <div className="pr-7">
            <div className="mb-4 flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.24em] text-emerald-500"><Settings className="h-4 w-4" /> Operator Mode</div>
            <h2 className="mb-4 text-2xl font-light text-white">營運端生產中心</h2>
            <div className="mb-4 space-y-4">
              <textarea value={opDeckStr} onChange={(e) => setOpDeckStr(e.target.value)} className="w-full h-24 bg-white/[0.02] border border-white/[0.1] text-white p-3 text-sm outline-none" placeholder="Deck string (e.g. ♠A · ♥7...)" />
              <input type="text" value={opSignature} onChange={(e) => setOpSignature(e.target.value)} className="w-full bg-white/[0.02] border border-white/[0.1] text-white p-3 text-sm outline-none" placeholder="Signature (e.g. A9F2C...)" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleOperatorGenerate("black")} className="flex-1 border border-white/20 p-3 text-xs">輸出黑 T 正面</button>
              <button onClick={() => handleOperatorGenerate("offwhite")} className="flex-1 border border-white/20 p-3 text-xs">輸出米白 T 正面</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Portal Modal */}
      {showPortal && (
        <Modal onClose={() => setShowPortal(false)}>
          <div className="pr-7">
            <div className="mb-4 text-[0.72rem] uppercase tracking-[0.24em] text-emerald-500/80">Custom Wearable</div>
            <h2 className="mb-4 text-2xl font-light text-white tracking-widest">{t.portal_title}</h2>
            <p className="mb-4 text-sm font-light leading-7 text-neutral-400">{t.portal_desc}</p>
            <div className="mb-8 space-y-3 rounded bg-white/[0.015] border border-white/[0.05] p-5 text-[0.8rem] leading-[1.8] text-neutral-500">
              {t.portal_notice}
            </div>
            <div className="flex flex-col sm:flex-row">
              <button onClick={handleOrderProcess} className="inline-flex flex-1 items-center justify-center border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-[0.85rem] tracking-[0.1em] text-emerald-400 hover:bg-emerald-500/20">
                {t.portal_btn}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 border border-white/10 bg-black px-5 py-3 text-[0.8rem] tracking-wider text-neutral-300 whitespace-nowrap shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
