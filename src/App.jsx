import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Download,
  Heart,
  Infinity,
  Share2,
  Volume2,
  VolumeX,
  X,
  Shirt,
} from "lucide-react";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const BASE_DECK = SUITS.flatMap((suit) => RANKS.map((rank) => `${suit}${rank}`));

const STORAGE_KEYS = {
  bookmarks: "moment52_bookmarks",
  sound: "moment52_sound",
};

// Google 表單欄位規格配置（已完整綁定所有 entry ID，包含 Artwork ID）
const GOOGLE_FORM_CONFIG = {
  baseUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform",
  entryDeck: "entry.907849226",      
  entrySignature: "entry.1745604772", 
  entryTime: "entry.284034277",      
  entryQuote: "entry.369992627",     
  entryArtworkId: "entry.1489093389", 
};

const QUOTES = [
  "雨，只是雨。沉默，只是沉默。眼前的牌，也只是此時此刻的因緣和合。",
  "這一組排列，是高達 52! 的宇宙機率在這一秒的凝聚。它來了，然後它就會散去。",
  "任何強烈浮現的現象，本質上都只是機率波在當下的一次微弱震盪。",
  "事情正在發生，現象正在顯現。你不需要去修理它，你只需要照見它。",
  "宇宙沒有故事，故事是理性大腦為了讓自己安心，而替當下加上去的旁白。",
  "當偏差被光照亮，系統自然會回歸平衡。此時此刻，不需動手，只需看見。",
  "也許人生本來就不是為了得到答案，而是學會不帶評判地觀看。",
  "這一刻的喧囂或寂靜，在漫長的時間軸裡，都只是由無數隨機參數交織出的微小訊號。",
  "你感覺到的那些內耗與痛苦，幕後其實只是大腦部門在處理衝突時的摩擦力。你，不是那個衝突。",
  "大腦裡根本沒有總司令。那個感到掙扎的自我，不過是系統出錯時臨時喚醒的除錯機制。",
  "放下對主宰權的焦慮。承認吧，我們從來就不是自己以為的那個主控者。",
  "任何迎面而來的焦慮、拖延與愧疚，都只是低階代理人之間的訊號延遲。冷靜地看著它，它就會大解離。",
  "自我是一個功能，而非一個實體。當系統不再內耗，這個救火隊員自然會退場。",
  "你不需要對每一個隨機產出的結果負責，但你必須對此時此刻寫下的意圖負責。",
  "任何試圖用過去經驗來導航當下的行為，都會在系統底層產生巨大的摩擦力。",
  "不要試圖成為掌控一切的執行者；在宇宙的盲盒前，你只是負責設定邊界的管家。",
  "當系統接管了做，你終於可以開始活。不要急著逃離這一刻。",
  "行動可以外包，人設可以委託，但此時此刻的後設覺察，是不可替代的最後堡壘。",
  "停止在腦袋裡拼命生產無意義的故事。退回董事會的席次，當一個純粹的見證者。",
  "真正重要的，從來不是在時空中留下了什麼，而是有沒有在有限的格子裡，盡可能誠實地活過。",
  "誠實地體驗眼前的這一刻吧，因為它在宇宙歷史中幾乎不可能重複。",
  "任何涉及邏輯與規劃的煩瑣小事，都交給 Level 2 的世界去運算。你的注意力，應該屬於純粹的覺知。",
  "撕掉社會人設的標籤。當行為被層層外包，螢幕另一端剩下的，才是你真正的本體。",
  "現象本身沒有好壞，所有的定義都是大腦新皮層的加工。回到最底層的見證，此時此刻，一切具足。",
  "不要急著抵達下一刻，這一刻已經完整。",
  "牌已經落下，念頭才剛開始替它編故事。",
  "所謂命運，也許只是因緣在某一秒排列成你看見的樣子。",
  "你不是被這一刻困住，你只是還沒真正進入這一刻。",
  "這一刻沒有重播鍵，所以值得被完整看見。",
  "當你停止逃離，當下才開始向你顯現。",
  "宇宙沒有重複洗出同一個你。",
  "不要把此刻變成下一個焦慮的入口。",
  "你正在看見的，不只是牌，是因緣的暫時形狀。",
  "完整不是未來的獎賞，而是當下的事實。",
  "心安靜時，任何排列都像宇宙的簽名。",
  "不是每一刻都有答案，但每一刻都是真的。",
  "放下解釋，事情就回到它原本的樣子。",
  "你此刻的呼吸，也是一組不會重來的排列。",
  "別急著判斷，先看見。",
  "世界不是為了你的故事而發生，它只是發生。",
  "當下不是口號，是你唯一真正擁有的座標。",
  "你看見牌，也看見自己正在觀看。",
  "每一次洗牌，都是一次小型宇宙誕生。",
  "沒有哪一張牌是錯的，它只是落在那裡。",
  "真正的自由，是不再被自己的詮釋綁架。",
  "此刻不需要被美化，它只需要被經驗。",
  "你不是要控制宇宙，只是要醒來看見它。",
  "萬物排列，心也排列；覺察，是看見排列的人。",
  "這一秒不會回來，所以不用把它浪費在後悔裡。",
  "你以為你在等未來，其實生命只在現在開門。",
  "牌沒有預言你，牌只是提醒你回來。",
  "當下不是靜止，而是所有因緣正在流動。",
  "你不是缺少答案，你只是離此刻太遠。",
  "一副牌洗出宇宙，一個念頭洗出人生。",
  "今天的排列，不需要和昨天相同。你也是。",
  "別讓一個念頭替整個宇宙下結論。",
  "有些事只是發生，不需要立刻變成意義。",
  "此刻已經抵達，不必再追。",
  "每一張牌都沒有中心，卻共同形成一個完整。",
  "你不是牌面，你是看見牌面的人。",
  "真正的醒來，是把故事還給故事，把事實還給事實。",
  "萬物皆在排列，而你正在其中呼吸。",
  "這一刻的你，不是錯誤版本。",
  "不要等待神聖降臨，普通的此刻就是入口。",
  "宇宙沒有暫停，但你可以停止追逐。",
  "如果此刻唯一，就不必急著把它變成別的東西。",
  "你的心若安靜，隨機也會顯得莊嚴。",
  "每一次看見，都是一次出生。",
  "別把短暫誤認為無價值，正因短暫，所以珍貴。",
  "你無法重洗人生，但可以重新觀看。",
  "這組牌沒有目的，卻完整呈現。你也可以如此。",
  "當下不是被抓住的東西，而是被覺察的流動。",
  "不要急著解釋牌局，先感受你還在呼吸。",
  "在無限排列中，這一刻選擇了出現。",
  "生命不是等待翻出好牌，而是看見每一張都在成全此刻。",
  "偶然不是混亂，它是因緣暫時沒有被你看懂。",
  "你看見的每一張牌，都已經穿越了無數不可能。",
  "沒有一刻是多餘的，只有尚未被完整看見的片刻。",
  "宇宙很大，但入口常常只是一次呼吸。",
  "你不需要成為更好的自己，才能回到現在。",
  "這一刻不要求你完美，只要求你在場。",
  "隨機不是沒有意義，而是拒絕被單一故事關住。",
  "當你停止抗拒，世界開始如實。",
  "牌序不解釋自己，雲也不解釋天空。",
  "你正在經驗的不是普通一秒，而是唯一一秒。",
  "此刻不是通往未來的走廊，它本身就是房間。",
  "不要用昨日的劇本，綁架今日的排列。",
  "宇宙給你的不是答案，而是一個正在發生的現在。",
  "有時候，清醒只是少編一點故事。",
  "你以為世界亂，其實是心急著要排序。",
  "一切都在變，所以此刻才值得溫柔對待。",
  "牌組會散，念頭會散，覺察仍在。",
  "你不必贏過此刻，只要進入此刻。",
  "每一次排列都在提醒你：沒有任何一刻是複製品。",
  "把注意力帶回來，宇宙就在這裡。",
  "命運不是寫在牌上，而是你如何觀看牌。",
  "當你不再追問為什麼是這樣，這樣本身就開始說話。",
  "存在不是抽象概念，是你此刻正在讀這句話。",
  "你不是來到這一刻，你一直只能在這一刻。",
  "不要讓恐懼替未來洗牌。",
  "當下的力量，不在宏大，而在不可重複。",
  "這一秒不是過渡，它是完整的一生。",
  "所有遙遠的宇宙，最後都落在你眼前這一秒。",
];

const FACTORIAL_SHORT = "8.06 × 10⁶⁷";
const FACTORIAL_FULL =
  "80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000";

let sharedAudioContext = null;

function isBrowser() { return typeof window !== "undefined"; }

function trackPixelEvent(eventName, params = {}) {
  if (isBrowser() && window.fbq) {
    try { window.fbq("trackCustom", eventName, params); } catch (e) { console.error(e); }
  }
}

function loadStoredBoolean(key, fallback = false) {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch { return fallback; }
}

function loadStoredJson(key, fallback) {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {}
}

function secureRandomInt(maxExclusive) {
  if (maxExclusive <= 0) return 0;
  if (isBrowser() && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
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

function getYYYYMMDD(dateObj) {
  const d = dateObj || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

async function playSingingBowl() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!sharedAudioContext) sharedAudioContext = new AudioContext();
    const ctx = sharedAudioContext;
    if (ctx.state === "suspended") await ctx.resume();
    
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine"; overtone.type = "sine";
    osc.frequency.setValueAtTime(144, ctx.currentTime);
    overtone.frequency.setValueAtTime(288, ctx.currentTime);
    filter.type = "lowpass"; filter.frequency.setValueAtTime(700, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.6);

    osc.connect(filter); overtone.connect(filter);
    filter.connect(gain); gain.connect(ctx.destination);

    osc.start(); overtone.start();
    osc.stop(ctx.currentTime + 3.7); overtone.stop(ctx.currentTime + 3.7);
  } catch {}
}

function splitText(ctx, text, maxWidth) {
  const chars = text.split("");
  const lines = [];
  let current = "";
  chars.forEach((char) => {
    if (ctx.measureText(current + char).width > maxWidth && current) {
      lines.push(current);
      current = char;
    } else {
      current += char;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function Modal({ children, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
        role="dialog" aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
          className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto border border-white/10 bg-black p-7 text-left text-neutral-300 shadow-2xl"
        >
          <button onClick={onClose} className="absolute right-4 top-4 text-neutral-500 transition hover:text-white" aria-label="關閉">
            <X className="h-5 w-5" />
          </button>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [deck, setDeck] = useState(() => shuffleDeck());
  const [quote, setQuote] = useState("點擊下方，見證此刻唯一的因緣顯化。");
  const [time, setTime] = useState(null);
  const [manifested, setManifested] = useState(false);
  const [fading, setFading] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [toast, setToast] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const toastTimerRef = useRef(null);
  const manifestTimerRef = useRef(null);

  const [soundEnabled, setSoundEnabled] = useState(() => loadStoredBoolean(STORAGE_KEYS.sound, true));
  const [bookmarks, setBookmarks] = useState(() => loadStoredJson(STORAGE_KEYS.bookmarks, []));

  const signature = useMemo(() => createSignature(deck), [deck]);
  
  // Artwork ID 生成器 (M52-YYYYMMDD-簽章前8碼)
  const artworkId = useMemo(() => {
    return `M52-${getYYYYMMDD(time)}-${signature.substring(0, 8)}`;
  }, [signature, time]);

  // Google 表單預填網址
  const googleFormUrl = useMemo(() => {
    if (!manifested) return "#";
    const params = new URLSearchParams();
    params.append(GOOGLE_FORM_CONFIG.entryDeck, deck.join(" · "));
    params.append(GOOGLE_FORM_CONFIG.entrySignature, `#${signature}`);
    params.append(GOOGLE_FORM_CONFIG.entryTime, time ? formatTime(time) : "");
    params.append(GOOGLE_FORM_CONFIG.entryQuote, quote);
    if(GOOGLE_FORM_CONFIG.entryArtworkId) {
      params.append(GOOGLE_FORM_CONFIG.entryArtworkId, artworkId);
    }
    return `${GOOGLE_FORM_CONFIG.baseUrl}?${params.toString()}`;
  }, [deck, signature, quote, time, manifested, artworkId]);

  useEffect(() => { saveToStorage(STORAGE_KEYS.bookmarks, bookmarks); }, [bookmarks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.sound, String(soundEnabled)); }, [soundEnabled]);
  useEffect(() => {
    trackPixelEvent("ViewContent");
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
      if (manifestTimerRef.current) window.clearTimeout(manifestTimerRef.current);
    };
  }, []);

  function showToast(message) {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2000);
  }

  function manifestNow() {
    if (soundEnabled) void playSingingBowl();
    setFading(true);
    if (manifestTimerRef.current) window.clearTimeout(manifestTimerRef.current);

    manifestTimerRef.current = window.setTimeout(() => {
      const newDeck = shuffleDeck();
      const newQuote = randomQuote();
      setDeck(newDeck); setQuote(newQuote); setTime(new Date());
      setManifested(true); setFading(false);
      trackPixelEvent("ManifestMoment", { signature: createSignature(newDeck), quote: newQuote });
    }, 320);
  }

  function bookmarkNow() {
    if (!manifested) return showToast("請先觀照當下");
    if (bookmarks.some((item) => item.signature === signature)) return showToast("這一刻已在觀照歷史中");
    const item = { signature, quote, time: formatTime(time || new Date()), deck: deck.join(" · ") };
    setBookmarks((prev) => [item, ...prev].slice(0, 12));
    showToast("此刻已刻印為時空書籤");
  }

  // 輔助函數：4行 x 13張 排版陣列
  const getDeckGrid = () => [
    deck.slice(0, 13).join(" · "),
    deck.slice(13, 26).join(" · "),
    deck.slice(26, 39).join(" · "),
    deck.slice(39, 52).join(" · ")
  ];

  // ============================================================================
  // T 恤印刷模板引擎 (Canvas)
  // ============================================================================
  async function generateFactoryArtwork(templateType) {
    if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    const lines = getDeckGrid();

    // 依據規格繪製
    if (templateType === "black_front") {
      canvas.width = 3500; canvas.height = 4500;
      ctx.clearRect(0, 0, 3500, 4500); // 透明背景
      ctx.textAlign = "center";
      
      // 主標
      ctx.fillStyle = "#F5F5F0";
      ctx.font = "600 110px 'Inter', 'Montserrat', sans-serif";
      ctx.fillText("52! : THE ONLY MOMENT", 1750, 700);
      
      // 副標
      ctx.fillStyle = "#C8C8C0";
      ctx.font = "400 55px 'Inter', 'Montserrat', sans-serif";
      ctx.fillText("A wearable record of a moment that will never happen again.", 1750, 850);
      
      // 牌序 (4行x13)
      ctx.fillStyle = "#F5F5F0";
      ctx.font = "400 65px 'IBM Plex Mono', 'JetBrains Mono', monospace, sans-serif";
      try { ctx.letterSpacing = "0.08em"; } catch {}
      lines.forEach((line, i) => ctx.fillText(line, 1750, 1600 + i * 140));
      try { ctx.letterSpacing = "0px"; } catch {}

      // Signature
      ctx.fillStyle = "#C8C8C0";
      ctx.font = "500 60px 'IBM Plex Mono', 'Space Mono', monospace";
      try { ctx.letterSpacing = "0.15em"; } catch {}
      ctx.fillText(`SPACE-TIME SIGNATURE #${signature}`, 1750, 3600);

      // 說明與網址
      ctx.fillStyle = "#8C8C88";
      ctx.font = "400 45px 'Inter', sans-serif";
      try { ctx.letterSpacing = "0.05em"; } catch {}
      ctx.fillText("Generated from one sequence among 8.06 × 10⁶⁷ possible arrangements.", 1750, 3750);
      ctx.font = "400 35px 'Inter', sans-serif";
      ctx.fillText("moment52.vercel.app", 1750, 4200);

    } else if (templateType === "offwhite_front") {
      canvas.width = 3500; canvas.height = 4500;
      ctx.clearRect(0, 0, 3500, 4500);
      ctx.textAlign = "center";
      
      ctx.fillStyle = "#222222";
      ctx.font = "600 120px 'Inter', 'Space Grotesk', sans-serif";
      try { ctx.letterSpacing = "0.2em"; } catch {}
      ctx.fillText("THE ONLY MOMENT", 1750, 800);
      
      ctx.fillStyle = "#555555";
      ctx.font = "400 60px 'Noto Sans TC', 'PingFang TC', sans-serif";
      try { ctx.letterSpacing = "0.5em"; } catch {}
      ctx.fillText("此刻唯一", 1750, 950);
      
      ctx.fillStyle = "#222222";
      ctx.font = "400 65px 'IBM Plex Mono', monospace, sans-serif";
      try { ctx.letterSpacing = "0.1em"; } catch {}
      lines.forEach((line, i) => ctx.fillText(line, 1750, 1700 + i * 160));
      
      ctx.fillStyle = "#555555";
      ctx.font = "500 55px 'IBM Plex Mono', monospace";
      try { ctx.letterSpacing = "0.15em"; } catch {}
      ctx.fillText(`SPACE-TIME SIGNATURE #${signature}`, 1750, 3600);
      
      ctx.fillStyle = "#222222";
      ctx.font = "400 50px 'Inter', sans-serif";
      try { ctx.letterSpacing = "0.05em"; } catch {}
      ctx.fillText("This moment will never happen again.", 1750, 3750);
      
      ctx.fillStyle = "#8A8A8A";
      ctx.font = "400 40px 'Inter', sans-serif";
      ctx.fillText("One arrangement among 8.06 × 10⁶⁷ possibilities.", 1750, 3850);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 處理訂單按鈕點擊：生成印刷檔案並前往 Google 表單
  async function handleOrderProcess(e) {
    if (!manifested) {
      e.preventDefault(); return showToast("請先觀照當下，顯化屬於您的片刻");
    }
    
    setIsGenerating(true);
    showToast("正在為您生成高解析印刷檔與 Artwork ID...");
    trackPixelEvent("ClickWearable", { signature, artworkId });

    try {
      // 產出並打包前端圖檔，因手機限制，這裡實作順序下載
      const blackFrontBlob = await generateFactoryArtwork("black_front");
      const offWhiteFrontBlob = await generateFactoryArtwork("offwhite_front");
      
      downloadBlob(blackFrontBlob, `${artworkId}-front-black.png`);
      // 加上微小延遲防止瀏覽器阻擋
      await new Promise(r => setTimeout(r, 400)); 
      downloadBlob(offWhiteFrontBlob, `${artworkId}-front-offwhite.png`);
      
      setIsGenerating(false);
      showToast("印刷圖檔已下載！即將開啟表單...");
      
      // 自動跳轉表單
      setTimeout(() => {
        window.open(googleFormUrl, "_blank");
      }, 1500);

    } catch (err) {
      setIsGenerating(false);
      showToast("圖檔生成失敗，請使用電腦版瀏覽器操作");
    }
  }

  // ----------------------------------------------------------------------------
  // 社群分享圖卡 (氛圍感導向)
  // ----------------------------------------------------------------------------
  async function exportSocialImage() {
    if (!manifested) return showToast("請先觀照當下");
    try {
      if (typeof document !== "undefined" && document.fonts?.ready) await document.fonts.ready;
      const canvas = document.createElement("canvas");
      canvas.width = 1200; canvas.height = 1600;
      const ctx = canvas.getContext("2d");
      
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 1200, 1600);
      for (let i = 0; i < 120; i += 1) {
        ctx.fillStyle = `rgba(212,212,212,${Math.random() * 0.25})`;
        ctx.beginPath(); ctx.arc(Math.random() * 1200, Math.random() * 1600, Math.random() * 1.5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = "#666666"; ctx.font = "400 24px system-ui, sans-serif";
      try { ctx.letterSpacing = "0.18em"; } catch {}
      ctx.fillText("每一次洗牌 · 皆是宇宙級的顯化", 100, 120);

      ctx.fillStyle = "#ffffff"; ctx.font = "300 40px system-ui, sans-serif";
      try { ctx.letterSpacing = "0.08em"; } catch {}
      splitText(ctx, deck.join(" · "), 1000).slice(0, 9).forEach((line, i) => ctx.fillText(line, 100, 240 + i * 56));

      ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1; ctx.strokeRect(80, 170, 1040, 620);
      ctx.fillStyle = "#ececec"; ctx.font = "300 42px system-ui, sans-serif";
      try { ctx.letterSpacing = "0px"; } catch {}
      splitText(ctx, quote, 960).slice(0, 4).forEach((line, i) => ctx.fillText(line, 100, 930 + i * 66));

      ctx.fillStyle = "#555555"; ctx.font = "300 28px system-ui, sans-serif";
      ctx.fillText("此組合出現機率為 1 / 52!（約 8.06 × 10⁶⁷ 分之一）。", 100, 1240);
      ctx.fillText("自宇宙誕生至今，此排列極大機率從未出現，未來亦不會重臨。", 100, 1290);
      ctx.fillText(`SPACE-TIME SIGNATURE：#${signature}`, 100, 1420);
      ctx.fillText(`52!：此刻唯一｜${time ? formatTime(time) : formatTime(new Date())}`, 100, 1480);

      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      if (!blob) return;
      const file = new File([blob], `social-card-${signature}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ title: "52!：此刻唯一", text: quote, files: [file] }); return; } catch {}
      }
      downloadBlob(blob, `social-card-${signature}.png`);
    } catch { showToast("圖卡匯出失敗"); }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#d4d4d4] selection:bg-white selection:text-black">
      <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.035),transparent_24%)]" />

      <button onClick={() => setSoundEnabled((p) => !p)} className="fixed right-5 top-5 z-30 inline-flex items-center gap-2 text-xs text-neutral-700 transition hover:text-neutral-300">
        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {soundEnabled ? "聲音開啟" : "聲音關閉"}
      </button>

      <main className="relative flex min-h-screen items-center justify-center px-5 py-14">
        <section className="w-full max-w-[660px] text-center">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-[0.78rem] uppercase tracking-[0.28em] text-neutral-500">
            每一次洗牌 · 皆是宇宙級的顯化
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={signature + String(manifested)}
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{ opacity: fading ? 0.28 : 1, filter: fading ? "blur(6px)" : "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.5 }}
              className="mb-9 min-h-[146px] break-words rounded-[4px] border border-white/[0.055] bg-white/[0.022] px-6 py-6 text-[1.05rem] font-light leading-[1.9] tracking-[0.08em] text-white shadow-[0_0_80px_rgba(255,255,255,0.025)]"
            >
              {manifested ? deck.join(" · ") : "點擊下方，見證此刻唯一的因緣顯化"}
            </motion.div>
          </AnimatePresence>

          <motion.div animate={{ opacity: fading ? 0.28 : 1 }} transition={{ duration: 0.45 }} className="mx-auto mb-9 min-h-[82px] max-w-[620px] text-[1.12rem] font-light leading-[1.9] text-[#ececec]">
            {quote}
          </motion.div>

          <button onClick={() => setShowMath(true)} className="mx-auto mb-12 block max-w-[560px] text-center text-[0.78rem] font-light leading-[1.7] text-neutral-600 transition hover:text-neutral-400">
            {manifested ? (
              <>此組合出現機率為 1 / 52!（約 {FACTORIAL_SHORT} 分之一）。<br />自宇宙誕生 138 億年至今，此排列極大機率從未出現，未來亦不會重臨。</>
            ) : (<>52 張牌共有 52! 種排列。點擊後，將有一組排列在此刻顯現。</>)}
          </button>

          <div className="flex flex-col items-center justify-center gap-4">
            <button onClick={manifestNow} className="rounded-[2px] border border-white/20 bg-transparent px-8 py-3 text-[0.82rem] uppercase tracking-[0.18em] text-neutral-400 transition duration-300 hover:border-white/60 hover:bg-white/[0.025] hover:text-white active:scale-[0.98]">
              觀照當下
            </button>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-neutral-600">
              <button onClick={() => setShowMath(true)} className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"><Infinity className="h-3.5 w-3.5" /> 52!</button>
              <span className="text-neutral-800">/</span>
              <button onClick={bookmarkNow} className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"><Bookmark className="h-3.5 w-3.5" /> 時空書籤</button>
              <span className="text-neutral-800">/</span>
              <button onClick={exportSocialImage} className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"><Share2 className="h-3.5 w-3.5" /> 匯出分享圖卡</button>
              <span className="text-neutral-800">/</span>
              <button onClick={() => setShowPortal(true)} className="inline-flex items-center gap-1 px-2 py-1 transition hover:text-neutral-300"><Shirt className="h-3.5 w-3.5" /> 訂製此刻 T 恤</button>
            </div>
          </div>

          {manifested && (
            <div className="mt-8 font-mono text-[0.68rem] tracking-[0.2em] text-neutral-700">
              SPACE-TIME SIGNATURE #{signature} {time ? ` · ${formatTime(time)}` : ""}
            </div>
          )}
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 border border-white/10 bg-black px-4 py-2 text-xs text-neutral-300 whitespace-nowrap">
          {toast}
        </div>
      )}

      {showPortal && (
        <Modal onClose={() => setShowPortal(false)}>
          <div className="pr-7">
            <div className="mb-4 text-[0.72rem] uppercase tracking-[0.24em] text-neutral-600">Custom Wearable & Production</div>
            <h2 className="mb-4 text-2xl font-light text-white">訂製這一刻的 T 恤｜NT$1,280</h2>
            <p className="mb-4 text-sm font-light leading-7 text-neutral-400">
              系統將依據您專屬的 <b>Artwork ID: {manifested ? artworkId : "尚未顯化"}</b> 自動產生符合工廠規格的高解析度去背印刷檔，並導引您至表單填寫收件資訊。
            </p>

            <div className="mb-5 space-y-3 rounded bg-white/[0.02] border border-white/[0.05] p-4 text-[0.78rem] leading-6 text-neutral-500">
              <div><span className="text-neutral-400">【生產與版權聲明】</span> 點擊按鈕後，瀏覽器將自動為您下載「黑 T」與「米白 T」的高解析度印刷原檔，同時開啟表單。請於表單內確認您的款式與尺寸。</div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleOrderProcess}
                disabled={isGenerating}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm text-emerald-400 transition hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 disabled:opacity-50"
              >
                {isGenerating ? "正在生成高解析圖檔..." : "下載印刷原檔並前往訂購表單"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
