import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArrowRight,
  Camera,
  Copy,
  Download,
  Eye,
  Lock,
  Menu,
  Mic,
  RotateCcw,
  Share2,
  Shirt,
  ShoppingBag,
  Volume2,
  VolumeX,
  X
} from "lucide-react";

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const BASE_DECK = SUITS.flatMap((suit) => RANKS.map((rank) => `${suit}${rank}`));

const FACTORIAL_SHORT = "8.06 × 10⁶⁷";
const TSHIRT_IMAGES = {
  blackSet: "/images/tshirt-black-gothic-set.png.png",
  blackBack: "/images/tshirt-black-gothic-back.png.png",
  creamSet: "/images/tshirt-cream-renaissance-set.png.png"
};
const STORAGE_KEYS = {
  sound: "m52_sound_enabled",
  archive: "m52_look_archive_private"
};

const GOOGLE_FORM_CONFIG = {
  baseUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform",
  entryDeck: "entry.907849226",
  entrySignature: "entry.1745604772",
  entryTime: "entry.284034277",
  entryLookText: "entry.936038985",
  entryQuote: "entry.369992627"
};

let sharedAudioContext = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function loadBoolean(key, fallback = true) {
  if (!isBrowser()) return fallback;
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return fallback;
    return value === "true";
  } catch {
    return fallback;
  }
}

function loadJson(key, fallback) {
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

function saveJson(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function saveString(key, value) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, String(value));
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

function createSignature(text, deck, isoTime) {
  const raw = `${text}|${deck.join("")}|${isoTime}`;
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;

  for (let i = 0; i < raw.length; i += 1) {
    hash ^= BigInt(raw.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }

  return hash.toString(16).toUpperCase().padStart(16, "0");
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function formatTimeLabel(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function formatFullTimeLabel(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function compactDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
}

function compactTime(date) {
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ].join("");
}

function deckLines(deck) {
  return [
    deck.slice(0, 13).join(" · "),
    deck.slice(13, 26).join(" · "),
    deck.slice(26, 39).join(" · "),
    deck.slice(39, 52).join(" · ")
  ];
}

function splitCanvasText(ctx, text, maxWidth) {
  const chars = Array.from(text);
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

async function playMuseumTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!sharedAudioContext) sharedAudioContext = new AudioContext();
    const ctx = sharedAudioContext;

    if (ctx.state === "suspended") await ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(196, ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, ctx.currentTime);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.45);
  } catch {}
}

function buildOrderUrl(moment) {
  if (!moment) return GOOGLE_FORM_CONFIG.baseUrl;

  const params = new URLSearchParams();

  params.append(GOOGLE_FORM_CONFIG.entryDeck, moment.deck.join(" · "));
  params.append(GOOGLE_FORM_CONFIG.entrySignature, `#${moment.signature}`);
  params.append(GOOGLE_FORM_CONFIG.entryTime, moment.fullTimeLabel);
  params.append(GOOGLE_FORM_CONFIG.entryLookText, moment.text);
  params.append(GOOGLE_FORM_CONFIG.entryQuote, "LOOK. / TEXT ARCHIVE");

  return `${GOOGLE_FORM_CONFIG.baseUrl}?${params.toString()}`;
}

async function copyText(text) {
  if (!isBrowser()) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function renderMomentCard(moment) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = 1400;
  canvas.height = 1800;

  ctx.fillStyle = "#F3F1EA";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 3;
  ctx.strokeRect(72, 72, canvas.width - 144, canvas.height - 144);

  ctx.fillStyle = "#171717";
  ctx.textAlign = "left";
  ctx.font = "500 34px Inter, Helvetica, Arial, sans-serif";
  ctx.fillText("52!", 120, 150);

  ctx.font = "400 20px Inter, Helvetica, Arial, sans-serif";
  ctx.fillText("THE MUSEUM OF THE ONLY MOMENT", 120, 190);

  ctx.textAlign = "right";
  ctx.font = "400 18px Inter, Helvetica, Arial, sans-serif";
  ctx.fillText("EXHIBITION 01", 1280, 150);
  ctx.fillText("LOOK. / TEXT ARCHIVE", 1280, 182);

  ctx.textAlign = "center";
  ctx.font = "400 28px 'Noto Sans TC', 'PingFang TC', sans-serif";
  ctx.fillStyle = "#55514A";
  ctx.fillText("此刻我看見", 700, 430);

  ctx.fillStyle = "#171717";
  ctx.font = "500 58px 'Noto Sans TC', 'PingFang TC', sans-serif";
  const lines = splitCanvasText(ctx, `「${moment.text}」`, 980);
  const startY = 540;
  lines.slice(0, 6).forEach((line, index) => {
    ctx.fillText(line, 700, startY + index * 82);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "#171717";
  ctx.font = "500 22px Inter, Helvetica, Arial, sans-serif";

  const metaTop = 1150;
  const leftX = 120;
  const rightX = 670;

  ctx.fillText("DATE", leftX, metaTop);
  ctx.fillText("TIME", rightX, metaTop);
  ctx.fillText("SPACE-TIME SIGNATURE", leftX, metaTop + 140);
  ctx.fillText("ARCHIVE ID", leftX, metaTop + 280);

  ctx.fillStyle = "#55514A";
  ctx.font = "400 34px 'IBM Plex Mono', 'Space Mono', monospace";
  ctx.fillText(moment.dateLabel, leftX, metaTop + 46);
  ctx.fillText(moment.timeLabel, rightX, metaTop + 46);
  ctx.fillText(`#${moment.signature}`, leftX, metaTop + 186);
  ctx.fillText(moment.id, leftX, metaTop + 326);

  ctx.fillStyle = "#171717";
  ctx.textAlign = "center";
  ctx.font = "400 24px Inter, Helvetica, Arial, sans-serif";
  ctx.fillText("This moment will never happen again.", 700, 1630);

  ctx.fillStyle = "#77736C";
  ctx.font = "400 18px Inter, Helvetica, Arial, sans-serif";
  ctx.fillText(`One arrangement among ${FACTORIAL_SHORT} possible 52-card sequences.`, 700, 1672);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to render PNG"));
      else resolve(blob);
    }, "image/png");
  });
}

function Button({ children, onClick, variant = "primary", disabled = false, href, target }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-40";

  const variants = {
    primary: "bg-neutral-950 text-[#F3F1EA] hover:bg-neutral-800",
    secondary: "border border-neutral-950/20 text-neutral-950 hover:border-neutral-950/60 hover:bg-neutral-950/5",
    ghost: "text-neutral-600 hover:text-neutral-950"
  };

  const className = `${base} ${variants[variant]}`;

  if (href) {
    return (
      <a className={className} href={href} target={target} rel={target ? "noreferrer" : undefined}>
        {children}
      </a>
    );
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function MuseumTag({ children }) {
  return (
    <span className="inline-flex border border-neutral-950/20 px-3 py-1 text-[0.65rem] tracking-[0.22em] text-neutral-600 uppercase">
      {children}
    </span>
  );
}

function MetadataRow({ label, value }) {
  return (
    <div className="border-t border-neutral-950/15 py-4">
      <div className="mb-1 text-[0.65rem] tracking-[0.22em] text-neutral-500 uppercase">{label}</div>
      <div className="break-all font-mono text-sm text-neutral-950">{value}</div>
    </div>
  );
}

function Modal({ children, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto border border-neutral-950 bg-[#F3F1EA] p-6 shadow-2xl md:p-10"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 14, scale: 0.98 }}
      >
        <button
          className="absolute right-4 top-4 text-neutral-500 transition hover:text-neutral-950"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function MomentCardPreview({ moment }) {
  if (!moment) return null;

  return (
    <div className="mx-auto w-full max-w-[430px] border border-neutral-950 bg-[#F3F1EA] p-6 shadow-[10px_10px_0_rgba(20,20,20,0.12)]">
      <div className="mb-14 flex items-start justify-between gap-6 border-b border-neutral-950 pb-5">
        <div>
          <div className="text-2xl font-medium tracking-[-0.04em]">52!</div>
          <div className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] text-neutral-600">
            The Museum of the Only Moment
          </div>
        </div>

        <div className="text-right text-[0.62rem] uppercase leading-relaxed tracking-[0.2em] text-neutral-600">
          Exhibition 01
          <br />
          Look. / Text Archive
        </div>
      </div>

      <div className="min-h-[240px] py-8 text-center">
        <div className="mb-8 text-sm tracking-[0.24em] text-neutral-500">此刻我看見</div>
        <div className="text-3xl font-medium leading-[1.45] tracking-[-0.04em] text-neutral-950">
          「{moment.text}」
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-5 border-t border-neutral-950 pt-5">
        <div>
          <div className="mb-1 text-[0.6rem] tracking-[0.2em] text-neutral-500">DATE</div>
          <div className="font-mono text-sm">{moment.dateLabel}</div>
        </div>
        <div>
          <div className="mb-1 text-[0.6rem] tracking-[0.2em] text-neutral-500">TIME</div>
          <div className="font-mono text-sm">{moment.timeLabel}</div>
        </div>
      </div>

      <div className="mt-5 border-t border-neutral-950/20 pt-5">
        <div className="mb-1 text-[0.6rem] tracking-[0.2em] text-neutral-500">SPACE-TIME SIGNATURE</div>
        <div className="font-mono text-sm">#{moment.signature}</div>
      </div>

      <div className="mt-10 border-t border-neutral-950 pt-5 text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-neutral-700">
          This moment will never happen again.
        </div>
      </div>
    </div>
  );
}

function ShirtMockup({ moment }) {
  const text = moment?.text || "此刻看見";
  const signature = moment?.signature || "CD1F734769A8DA3A";

  return (
    <div className="mx-auto w-full max-w-[620px]">
      <div className="overflow-hidden border border-neutral-950 bg-[#F3F1EA]">
        <img
          src={TSHIRT_IMAGES.blackSet}
          alt="Look. Archive T-shirt mockup"
          className="block h-auto w-full object-cover"
        />
      </div>

      <div className="mt-5 border border-neutral-950 bg-[#F3F1EA] p-5">
        <div className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
          Look. / Text Archive Preview
        </div>

        <div className="mt-5 text-2xl font-medium leading-[1.45] tracking-[-0.05em]">
          「{text}」
        </div>

        <div className="mt-5 break-all font-mono text-xs leading-relaxed text-neutral-500">
          SPACE-TIME SIGNATURE
          <br />
          {"#" + signature}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="border border-neutral-950/20 bg-[#F3F1EA] p-3">
          <img
            src={TSHIRT_IMAGES.blackSet}
            alt="Black T-shirt set"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Black / Set
          </div>
        </div>

        <div className="border border-neutral-950/20 bg-[#F3F1EA] p-3">
          <img
            src={TSHIRT_IMAGES.blackBack}
            alt="Black T-shirt back"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Black / Back
          </div>
        </div>

        <div className="border border-neutral-950/20 bg-[#F3F1EA] p-3">
          <img
            src={TSHIRT_IMAGES.creamSet}
            alt="Cream T-shirt set"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="mt-3 text-[0.62rem] uppercase tracking-[0.18em] text-neutral-500">
            Cream / Set
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => loadBoolean(STORAGE_KEYS.sound, true));

  const [now, setNow] = useState(() => new Date());
  const [inputVisible, setInputVisible] = useState(false);
  const [lookText, setLookText] = useState("");
  const [moment, setMoment] = useState(null);
  const [archive, setArchive] = useState(() => loadJson(STORAGE_KEYS.archive, []));
  const [toast, setToast] = useState("");
  const [deckOpen, setDeckOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const toastTimerRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    saveString(STORAGE_KEYS.sound, soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    saveJson(STORAGE_KEYS.archive, archive);
  }, [archive]);

  useEffect(() => {
    if (view !== "look") return;

    setInputVisible(false);
    const timer = window.setTimeout(() => setInputVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [view]);

  const orderUrl = useMemo(() => buildOrderUrl(moment), [moment]);

  function showToast(message) {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 2200);
  }

  async function handleArchiveMoment() {
    const cleanText = lookText.trim();

    if (!cleanText) {
      showToast("請先寫下你此刻看見的事。");
      return;
    }

    if (soundEnabled) void playMuseumTone();

    const generatedDeck = shuffleDeck();
    const createdAt = new Date();
    const signature = createSignature(cleanText, generatedDeck, createdAt.toISOString());

    const newMoment = {
      id: `LOOK-${compactDate(createdAt)}-${compactTime(createdAt)}-${signature.slice(0, 6)}`,
      text: cleanText,
      deck: generatedDeck,
      signature,
      dateLabel: formatDateLabel(createdAt),
      timeLabel: formatTimeLabel(createdAt),
      fullTimeLabel: formatFullTimeLabel(createdAt),
      timeIso: createdAt.toISOString()
    };

    setMoment(newMoment);
    setArchive((prev) => [newMoment, ...prev].slice(0, 24));
    setView("result");
    setDeckOpen(false);
  }

  async function handleDownload() {
    if (!moment) {
      showToast("目前沒有可下載的 Moment Card。");
      return;
    }

    try {
      const blob = await renderMomentCard(moment);
      downloadBlob(blob, `${moment.id}.png`);
      showToast("Moment Card 已下載。");
    } catch {
      showToast("圖卡產生失敗，請再試一次。");
    }
  }

  async function handleShare() {
    if (!moment) return;

    const shareText = `52! / Look.\n此刻我看見：「${moment.text}」\n${moment.id}\nSpace-Time Signature #${moment.signature}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "52! / Look.",
          text: shareText,
          url: "https://moment52.vercel.app/"
        });
        return;
      } catch {}
    }

    const copied = await copyText(shareText);
    showToast(copied ? "分享文字已複製。" : "無法複製分享文字。");
  }

  function resetLook() {
    setLookText("");
    setInputVisible(false);
    setDeckOpen(false);
    setView("look");
  }

  function goTo(target) {
    setView(target);
    setMenuOpen(false);
  }

  const navItems = [
    ["home", "Museum"],
    ["look", "Look."],
    ["archive", "Archive"],
    ["shop", "Shop"],
    ["about", "About"]
  ];

  return (
    <div className="min-h-screen bg-[#F3F1EA] text-neutral-950 selection:bg-neutral-950 selection:text-[#F3F1EA]">
      <div className="pointer-events-none fixed inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] [background-size:54px_54px]" />

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-neutral-950/15 bg-[#F3F1EA]/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <button
            className="flex items-baseline gap-3 text-left"
            onClick={() => goTo("home")}
            aria-label="Go to museum entrance"
          >
            <span className="text-2xl font-medium tracking-[-0.06em]">52!</span>
            <span className="hidden text-[0.62rem] uppercase tracking-[0.26em] text-neutral-500 sm:inline">
              The Museum of the Only Moment
            </span>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map(([key, label]) => (
              <button
                key={key}
                onClick={() => goTo(key)}
                className={`text-[0.68rem] uppercase tracking-[0.2em] transition ${
                  view === key ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
                }`}
              >
                {label}
              </button>
            ))}

            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="text-neutral-500 transition hover:text-neutral-950"
              aria-label={soundEnabled ? "Sound on" : "Sound off"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </nav>

          <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <Modal onClose={() => setMenuOpen(false)}>
            <div className="space-y-6 pt-8">
              {navItems.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => goTo(key)}
                  className="block w-full border-b border-neutral-950/15 pb-4 text-left text-2xl tracking-[-0.04em]"
                >
                  {label}
                </button>
              ))}

              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="inline-flex items-center gap-3 text-sm text-neutral-600"
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                {soundEnabled ? "Sound on" : "Sound off"}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-16">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.section
              key="home"
              className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-14 md:px-8 md:py-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="grid min-h-[72vh] items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <MuseumTag>52! / Main Institution</MuseumTag>

                  <h1 className="mt-8 max-w-4xl text-[4.8rem] font-medium leading-[0.85] tracking-[-0.1em] md:text-[8rem] lg:text-[10rem]">
                    52!
                  </h1>

                  <div className="mt-8 max-w-3xl border-t border-neutral-950 pt-6">
                    <p className="text-sm uppercase tracking-[0.24em] text-neutral-600">
                      The Museum of the Only Moment
                    </p>
                    <p className="mt-3 text-3xl font-medium tracking-[-0.06em] md:text-5xl">
                      此刻唯一的當下博物館
                    </p>
                  </div>

                  <p className="mt-8 max-w-2xl text-lg font-light leading-[1.9] text-neutral-700">
                    No prophecy. No guidance. No comfort.
                    <br />
                    Only the record of a moment that will never happen again.
                  </p>

                  <div className="mt-10 flex flex-wrap gap-3">
                    <Button onClick={() => goTo("look")}>
                      Enter Look. <ArrowRight size={16} />
                    </Button>
                    <Button variant="secondary" onClick={() => goTo("about")}>
                      View Museum Map
                    </Button>
                  </div>
                </div>

                <div className="border border-neutral-950 bg-[#ECE8DC] p-5 md:p-8">
                  <div className="mb-12 flex items-start justify-between border-b border-neutral-950 pb-5">
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                        Now Showing
                      </div>
                      <div className="mt-2 text-4xl font-medium tracking-[-0.08em]">Look.</div>
                    </div>
                    <Eye size={28} />
                  </div>

                  <div className="space-y-8">
                    <div>
                      <div className="mb-2 text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                        Exhibition 01
                      </div>
                      <h2 className="text-2xl font-medium tracking-[-0.05em]">
                        Text Archive of This Moment
                      </h2>
                      <p className="mt-4 leading-[1.9] text-neutral-700">
                        寫下「此刻我看見」，生成一張 Moment Card，並將這一秒封存為可下載、可分享、可製作成實體物件的時空紀錄。
                      </p>
                    </div>

                    <div className="grid gap-3 border-t border-neutral-950/15 pt-6 sm:grid-cols-2">
                      <div className="border border-neutral-950/15 p-4">
                        <Mic className="mb-5 text-neutral-400" size={22} />
                        <div className="text-lg">Listen.</div>
                        <div className="mt-2 text-sm leading-relaxed text-neutral-600">
                          環境音的時空簽章
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-neutral-400">
                          <Lock size={12} /> Coming later
                        </div>
                      </div>

                      <div className="border border-neutral-950/15 p-4">
                        <Camera className="mb-5 text-neutral-400" size={22} />
                        <div className="text-lg">Click.</div>
                        <div className="mt-2 text-sm leading-relaxed text-neutral-600">
                          影像瞬間的絕對孤獨隨機化
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.18em] text-neutral-400">
                          <Lock size={12} /> Coming later
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {view === "look" && (
            <motion.section
              key="look"
              className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-5 py-14 md:px-8 md:py-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="mb-10 flex flex-wrap items-center justify-between gap-5 border-b border-neutral-950 pb-5">
                <div>
                  <MuseumTag>Exhibition 01</MuseumTag>
                  <h1 className="mt-5 text-5xl font-medium tracking-[-0.09em] md:text-7xl">
                    Look.
                  </h1>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xl">{formatDateLabel(now)}</div>
                  <div className="mt-1 text-4xl tracking-[-0.08em]">{formatTimeLabel(now)}</div>
                </div>
              </div>

              <div className="mx-auto max-w-3xl py-10 text-center">
                <div className="text-[0.72rem] uppercase tracking-[0.26em] text-neutral-500">
                  Text Archive of This Moment
                </div>

                <p className="mt-8 text-3xl font-light leading-[1.7] tracking-[-0.06em] md:text-5xl">
                  Before you explain it,
                  <br />
                  record what is already here.
                </p>

                <p className="mx-auto mt-8 max-w-xl leading-[2] text-neutral-600">
                  這不是創作。不是願望。不是名言。
                  <br />
                  只是誠實寫下：你此刻看見了什麼。
                </p>

                <AnimatePresence>
                  {inputVisible && (
                    <motion.div
                      className="mt-14"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                    >
                      <label className="mb-4 block text-left text-[0.68rem] uppercase tracking-[0.24em] text-neutral-500">
                        此刻我看見
                      </label>

                      <textarea
                        value={lookText}
                        onChange={(event) => setLookText(event.target.value)}
                        placeholder="例如：窗外的雨、媽媽老了、我還活著、自己又在編故事、這一刻其實沒有問題"
                        className="min-h-[180px] w-full resize-none border border-neutral-950 bg-transparent p-5 text-2xl leading-[1.6] tracking-[-0.04em] outline-none placeholder:text-neutral-400 focus:bg-[#ECE8DC] md:text-3xl"
                        maxLength={80}
                      />

                      <div className="mt-4 flex items-center justify-between gap-4 text-sm text-neutral-500">
                        <span>{lookText.trim().length}/80</span>
                        <span>Private by default. Stored locally on this device.</span>
                      </div>

                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Button onClick={handleArchiveMoment}>
                          Archive This Moment <Archive size={16} />
                        </Button>
                        <Button variant="secondary" onClick={() => setLookText("")}>
                          Clear
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          )}

          {view === "result" && moment && (
            <motion.section
              key="result"
              className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-14 md:px-8 md:py-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="mb-12 border-b border-neutral-950 pb-6">
                <MuseumTag>Archive Object Generated</MuseumTag>
                <h1 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.05] tracking-[-0.08em] md:text-6xl">
                  A moment has entered the museum.
                </h1>
              </div>

              <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                <MomentCardPreview moment={moment} />

                <div>
                  <div className="mb-8 grid gap-4 md:grid-cols-2">
                    <MetadataRow label="Object Type" value="LOOK. / TEXT ARCHIVE" />
                    <MetadataRow label="Archive ID" value={moment.id} />
                    <MetadataRow label="Date" value={moment.dateLabel} />
                    <MetadataRow label="Time" value={moment.timeLabel} />
                    <MetadataRow label="Space-Time Signature" value={`#${moment.signature}`} />
                    <MetadataRow label="52-card sequence" value={`${FACTORIAL_SHORT} possible arrangements`} />
                  </div>

                  <div className="border border-neutral-950 bg-[#ECE8DC] p-5 md:p-7">
                    <div className="mb-3 text-[0.68rem] uppercase tracking-[0.24em] text-neutral-500">
                      Recorded Text
                    </div>
                    <div className="text-3xl font-medium leading-[1.5] tracking-[-0.05em]">
                      「{moment.text}」
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button onClick={handleDownload}>
                      <Download size={16} /> Download PNG
                    </Button>
                    <Button variant="secondary" onClick={handleShare}>
                      <Share2 size={16} /> Share
                    </Button>
                    <Button variant="secondary" onClick={() => goTo("shop")}>
                      <Shirt size={16} /> Museum Shop
                    </Button>
                    <Button variant="ghost" onClick={resetLook}>
                      <RotateCcw size={16} /> Re-enter Look.
                    </Button>
                  </div>

                  <div className="mt-10">
                    <button
                      onClick={() => setDeckOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between border-t border-neutral-950 py-4 text-left"
                    >
                      <span className="text-[0.72rem] uppercase tracking-[0.24em] text-neutral-600">
                        View 52-card arrangement
                      </span>
                      <span>{deckOpen ? "−" : "+"}</span>
                    </button>

                    <AnimatePresence>
                      {deckOpen && (
                        <motion.div
                          className="space-y-3 border-b border-neutral-950 pb-5 font-mono text-xs leading-relaxed text-neutral-700"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {deckLines(moment.deck).map((line, index) => (
                            <div key={index}>{line}</div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {view === "archive" && (
            <motion.section
              key="archive"
              className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-5 py-14 md:px-8 md:py-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="mb-12 border-b border-neutral-950 pb-6">
                <MuseumTag>Private Archive</MuseumTag>
                <h1 className="mt-5 text-5xl font-medium tracking-[-0.09em] md:text-7xl">
                  Look Archive
                </h1>
                <p className="mt-6 max-w-2xl leading-[1.9] text-neutral-600">
                  這裡只顯示儲存在此瀏覽器裡的紀錄。第一版預設不公開，不建立社群牆，不把使用者的句子送到後台。
                </p>
              </div>

              {archive.length === 0 ? (
                <div className="border border-neutral-950/20 p-8 text-neutral-600">
                  尚未封存任何文字。進入 Look.，寫下你此刻看見的事。
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {archive.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMoment(item);
                        setView("result");
                      }}
                      className="border border-neutral-950/20 bg-[#ECE8DC] p-5 text-left transition hover:border-neutral-950 hover:bg-[#E4DFD1]"
                    >
                      <div className="mb-12 flex items-start justify-between gap-4">
                        <div className="text-[0.62rem] uppercase tracking-[0.22em] text-neutral-500">
                          LOOK. / TEXT ARCHIVE
                        </div>
                        <Archive size={16} className="text-neutral-500" />
                      </div>

                      <div className="text-2xl font-medium leading-[1.45] tracking-[-0.05em]">
                        「{item.text}」
                      </div>

                      <div className="mt-8 border-t border-neutral-950/15 pt-4 font-mono text-xs text-neutral-500">
                        {item.id}
                        <br />#{item.signature}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.section>
          )}

          {view === "shop" && (
            <motion.section
              key="shop"
              className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-14 md:px-8 md:py-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <MuseumTag>Museum Shop</MuseumTag>
                  <h1 className="mt-5 text-5xl font-medium leading-[0.95] tracking-[-0.09em] md:text-7xl">
                    Wearable
                    <br />
                    Record.
                  </h1>

                  <p className="mt-8 max-w-xl text-xl leading-[1.9] text-neutral-700">
                    把一個瞬間穿在身上。
                  </p>

                  <p className="mt-6 max-w-xl leading-[2] text-neutral-600">
                    這不是潮流標語，不是品牌口號。它是你在某一刻真正看見的事，被轉化成一件可穿戴的館藏物件。
                  </p>

                  <div className="mt-10 space-y-4 border-y border-neutral-950 py-6">
                    <MetadataRow label="Object Type" value="MUSEUM SHOP / WEARABLE RECORD" />
                    <MetadataRow label="Source Exhibition" value="LOOK. / TEXT ARCHIVE" />
                    <MetadataRow
                      label="Production Status"
                      value={moment ? "Ready for pre-order form" : "Generate a Look. archive first"}
                    />
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {moment ? (
                      <Button href={orderUrl} target="_blank">
                        <ShoppingBag size={16} /> Open Pre-order Form
                      </Button>
                    ) : (
                      <Button onClick={() => goTo("look")}>
                        Enter Look. First <ArrowRight size={16} />
                      </Button>
                    )}

                    <Button variant="secondary" onClick={() => setAboutOpen(true)}>
                      Product Note
                    </Button>
                  </div>
                </div>

                <div className="border border-neutral-950 bg-[#ECE8DC] p-5 md:p-8">
                  <div className="mb-8 flex items-center justify-between border-b border-neutral-950 pb-5">
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                        Preview
                      </div>
                      <div className="mt-2 text-2xl font-medium tracking-[-0.05em]">
                        Look. Archive T-shirt
                      </div>
                    </div>
                    <Shirt size={28} />
                  </div>

                  <ShirtMockup moment={moment} />

                  <div className="mt-8 border-t border-neutral-950 pt-5 text-sm leading-[1.9] text-neutral-600">
                    第一版可先採「填表預購 / 人工確認 / 轉帳後製作」流程。商品頁不要做成一般電商，而要維持 Museum Shop 的館藏延伸物氣質。
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {view === "about" && (
            <motion.section
              key="about"
              className="mx-auto min-h-[calc(100vh-4rem)] max-w-6xl px-5 py-14 md:px-8 md:py-20"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
            >
              <div className="mb-14 border-b border-neutral-950 pb-6">
                <MuseumTag>Museum Map</MuseumTag>
                <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[1] tracking-[-0.09em] md:text-7xl">
                  52! is not a shuffle tool.
                  <br />
                  It is a museum.
                </h1>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="border border-neutral-950 bg-[#ECE8DC] p-6 md:p-8">
                  <div className="mb-20 text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                    Main Institution
                  </div>
                  <h2 className="text-5xl font-medium tracking-[-0.09em]">52!</h2>
                  <p className="mt-6 leading-[2] text-neutral-700">
                    52! 是一座冷靜的當下博物館。它不占卜、不勵志、不灌雞湯、不解釋人生。
                    它只保存那些再也不會重來的瞬間。
                  </p>
                  <p className="mt-6 leading-[2] text-neutral-700">
                    一副 52 張牌完整排列共有約 {FACTORIAL_SHORT} 種可能。每一次排列，都幾乎是宇宙第一次出現。
                    這是 52! 的數學底層，也是「此刻唯一」的理性支撐。
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="border border-neutral-950 p-6">
                    <Eye className="mb-8" size={28} />
                    <div className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                      Permanent Exhibition 01
                    </div>
                    <h3 className="mt-3 text-4xl font-medium tracking-[-0.08em]">Look.</h3>
                    <p className="mt-5 leading-[1.9] text-neutral-700">
                      看見。此刻文字的時空封存。
                      使用者寫下「此刻我看見」，生成一張 Moment Card。
                    </p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="border border-neutral-950/20 p-6 opacity-70">
                      <Mic className="mb-8" size={24} />
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                        Future Wing
                      </div>
                      <h3 className="mt-3 text-3xl font-medium tracking-[-0.08em]">Listen.</h3>
                      <p className="mt-5 text-sm leading-[1.9] text-neutral-700">
                        聆聽。封存這一刻環境音的時空簽章。
                      </p>
                    </div>

                    <div className="border border-neutral-950/20 p-6 opacity-70">
                      <Camera className="mb-8" size={24} />
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-neutral-500">
                        Future Wing
                      </div>
                      <h3 className="mt-3 text-3xl font-medium tracking-[-0.08em]">Click.</h3>
                      <p className="mt-5 text-sm leading-[1.9] text-neutral-700">
                        捕捉。某一瞬間影像的絕對孤獨隨機化。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-neutral-950 bg-[#F3F1EA] px-5 py-3 text-sm shadow-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aboutOpen && (
          <Modal onClose={() => setAboutOpen(false)}>
            <div className="pr-8">
              <MuseumTag>Museum Shop Note</MuseumTag>
              <h2 className="mt-5 text-4xl font-medium tracking-[-0.08em]">
                This is not a normal custom T-shirt.
              </h2>
              <p className="mt-6 leading-[2] text-neutral-700">
                本商品印有使用者專屬的 Space-Time Signature 與 Look. 文字紀錄。
                它不是一般圖案商品，而是依照某一秒生成的個人化館藏物件。
              </p>
              <p className="mt-5 leading-[2] text-neutral-700">
                第一版建議維持人工確認與接單後製作，不急著導入購物車或金流。
                這樣能保留品牌的冷靜感，也能降低衝動購物、退貨與生產浪費。
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <footer className="relative z-10 border-t border-neutral-950/15 px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-[0.65rem] uppercase tracking-[0.18em] text-neutral-500 md:flex-row md:items-center md:justify-between">
          <div>52! / The Museum of the Only Moment</div>
          <div>Look. / Text Archive of This Moment</div>
        </div>
      </footer>
    </div>
  );
}
