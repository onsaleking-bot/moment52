import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { ArrowRight, Download } from "lucide-react";
import { QUOTES } from "./quotes";

// --- Google Form ---
const GOOGLE_FORM_BASE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfE-sw4nrw64otfKxOqrTo_LV4sWqIsz0I8P58i9RPlrFyucA/viewform";

// 已確認欄位
const FORM_ENTRY_DECK = "entry.907849226";
const FORM_ENTRY_SIGNATURE = "entry.1745604772";
const FORM_ENTRY_TIME = "entry.284034277";
const FORM_ENTRY_MOMENT_TEXT = "entry.936038985";
const FORM_ENTRY_QUOTE = "entry.369992627";

const FORM_ENTRY_SIZE = "entry.508788419";
const FORM_ENTRY_COLOR = "entry.1607852062";
const FORM_ENTRY_CUSTOM_NOTICE = "entry.1535842643";
const FORM_ENTRY_PRIVACY_NOTICE = "entry.1560257946";

// 目前 GitHub 實際檔名是 .png.png
const TSHIRT_IMAGES = {
  blackSet: "/images/tshirt-black-gothic-set.png.png",
  blackBack: "/images/tshirt-black-gothic-back.png.png",
  creamSet: "/images/tshirt-cream-renaissance-set.png.png"
};

const FACTORIAL_52 =
  "80,658,175,170,943,878,571,660,636,856,403,766,975,289,505,440,883,277,824,000,000,000,000";

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
  "今天的風很舒服",
  "我不知道",
  "我正在等待"
];

const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const ARTICLES = {
  about: {
    eyebrow: "About 52!",
    title: "為什麼是 52!",
    cta: "看見此刻",
    blocks: [
      { type: "p", text: "一副撲克牌共有 52 張。" },
      { type: "p", text: "完全隨機洗牌後，可能產生 52! 種排列。" },
      { type: "p", text: "這個數量遠遠超過宇宙中的恆星數量。" },
      { type: "factorial" },
      { type: "p", text: "因此，你看到的排列，幾乎不會再次出現。" },
      { type: "p", text: "正如這個瞬間。" },
      { type: "p", text: "它正在發生。" },
      { type: "p", text: "然後永遠消失。" }
    ]
  },
  look: {
    eyebrow: "Look.",
    title: "為什麼不是 See？",
    cta: "開始觀看",
    blocks: [
      { type: "p", text: "因為 See 是被動的。" },
      { type: "p", text: "你看見下雨。" },
      { type: "p", text: "你看見訊息未回。" },
      { type: "p", text: "你看見事情發生。" },
      { type: "space" },
      { type: "p", text: "而 Look 是主動的。" },
      { type: "p", text: "看看這一刻。" },
      { type: "p", text: "看看自己正在想什麼。" },
      { type: "p", text: "看看自己是否正在替事情編造故事。" },
      { type: "p", text: "看看自己是否正在害怕。" },
      { type: "p", text: "看看自己是否正在期待。" },
      { type: "space" },
      { type: "p", text: "52! 不是為了給你答案。" },
      { type: "p", text: "而是邀請你停下來觀看。" },
      { type: "p", text: "Look.", highlight: true }
    ]
  },
  solitude: {
    eyebrow: "Essay",
    title: "關於孤獨",
    cta: "看見此刻",
    blocks: [
      { type: "p", text: "多數人活在自己的內心。" },
      { type: "p", text: "讀著自己的劇本。" },
      { type: "space" },
      { type: "p", text: "於是孤獨並不是沒有人陪伴。" },
      { type: "p", text: "而是很少有人願意一起觀看。" },
      { type: "space" },
      { type: "p", text: "看見事實。" },
      { type: "p", text: "看見恐懼。" },
      { type: "p", text: "看見期待。" },
      { type: "p", text: "看見自己。" },
      { type: "space" },
      { type: "p", text: "真正的觀看無法被說服。" },
      { type: "p", text: "只能被發現。" },
      { type: "p", text: "Look.", highlight: true }
    ]
  }
};

const createDeck = () =>
  SUITS.flatMap((suit) => RANKS.map((rank) => `${suit}${rank}`));

const getRandomInt = (maxExclusive) => {
  if (maxExclusive <= 0) return 0;

  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const range = 0xffffffff + 1;
    const limit = Math.floor(range / maxExclusive) * maxExclusive;
    const array = new Uint32Array(1);

    do {
      window.crypto.getRandomValues(array);
    } while (array[0] >= limit);

    return array[0] % maxExclusive;
  }

  return Math.floor(Math.random() * maxExclusive);
};

const shuffleDeck = () => {
  const deck = createDeck();

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = getRandomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

const chunkArray = (array, size) => {
  const chunks = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
};

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
    for (let i = 0; i < 16; i += 1) {
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

const appendFormValue = (params, key, value) => {
  if (!key) return;
  params.set(key, value ?? "");
};

const getEditionMeta = (selectedColor) => {
  if (selectedColor === "cream") {
    return {
      label: "米白",
      formValue: "米白",
      title: "Renaissance Manuscript",
      description: "米白款以 Renaissance Manuscript 為主視覺，像一頁被穿在身上的古書扉頁。",
      setImage: TSHIRT_IMAGES.creamSet,
      artworkImage: TSHIRT_IMAGES.creamSet,
      factoryInk: "#4A3A2F",
      factoryMuted: "#7A6756",
      factoryLine: "rgba(74,58,47,0.55)"
    };
  }

  return {
    label: "黑色",
    formValue: "黑色",
    title: "Gothic Archive",
    description: "黑色款以 Gothic Archive 為主視覺，正面極簡，背面保存完整觀看紀錄。",
    setImage: TSHIRT_IMAGES.blackSet,
    artworkImage: TSHIRT_IMAGES.blackBack,
    factoryInk: "#FFFFFF",
    factoryMuted: "#888888",
    factoryLine: "rgba(255,255,255,0.75)"
  };
};

const TextButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="text-xs tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
  >
    {children}
  </button>
);

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mt-12 text-xs tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
  >
    ← 返回
  </button>
);

const HomeView = ({ onStart, onAbout, onLookArticle, onSolitude }) => (
  <motion.div
    key="home"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.4 }}
    className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center"
  >
    <h1 className="mb-4 text-5xl font-bold tracking-[0.22em] md:text-7xl">
      52!
    </h1>

    <p className="mb-14 text-xl font-light tracking-widest text-neutral-400 md:text-2xl">
      此刻唯一。
    </p>

    <div className="mb-14 space-y-4 text-sm font-light leading-relaxed tracking-wider text-neutral-400 md:text-base">
      <p>每一次洗牌，</p>
      <p>都會產生一個幾乎不可能再次出現的排列。</p>
      <p className="text-neutral-300">就像此刻的你。</p>
    </div>

    <div className="mb-14 max-w-xl border-y border-white/10 py-8 text-sm font-light leading-loose tracking-wider text-neutral-500 md:text-base">
      <p>一副撲克牌共有 52 張。</p>
      <p>完全隨機洗牌後，可能產生 52! 種排列。</p>
      <p>這個數字遠遠超過宇宙中的恆星數量。</p>
      <p className="mt-6 text-neutral-400">
        因此，你即將看到的排列，很可能是宇宙歷史上第一次出現。
      </p>
      <p className="text-neutral-300">而此刻也是。</p>
    </div>

    <button
      onClick={onStart}
      className="mb-12 border border-white/20 px-10 py-4 text-sm uppercase tracking-[0.2em] text-white/80 transition-all duration-500 hover:bg-white hover:text-black"
    >
      Look.
    </button>

    <div className="mb-16 flex flex-wrap items-center justify-center gap-6">
      <TextButton onClick={onAbout}>為什麼是 52!</TextButton>
      <TextButton onClick={onLookArticle}>為什麼是 Look</TextButton>
      <TextButton onClick={onSolitude}>關於孤獨</TextButton>
    </div>

    <div className="max-w-xl text-center">
      <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-neutral-700">
        Why 52!
      </p>
      <p className="break-words font-mono text-[10px] leading-relaxed tracking-wider text-neutral-600">
        {FACTORIAL_52}
      </p>
      <p className="mt-5 text-xs font-light leading-relaxed tracking-wider text-neutral-600">
        這是一副撲克牌所有可能排列的數量。大到難以想像。
        你看到的排列幾乎不會再次出現。正如這個瞬間。
      </p>
    </div>
  </motion.div>
);

const ArticleView = ({ article, onBack, onStart }) => (
  <motion.div
    key="article"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1 }}
    className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center"
  >
    <p className="mb-8 text-[10px] uppercase tracking-[0.45em] text-neutral-700">
      {article.eyebrow}
    </p>

    <h2 className="mb-12 text-3xl font-light tracking-[0.2em] text-white/90 md:text-4xl">
      {article.title}
    </h2>

    <div className="space-y-5 text-sm font-light leading-loose tracking-wider text-neutral-400 md:text-base">
      {article.blocks.map((block, index) => {
        if (block.type === "space") {
          return <div key={`space-${index}`} className="h-4" />;
        }

        if (block.type === "factorial") {
          return (
            <div key={`factorial-${index}`} className="py-8">
              <p className="break-words font-mono text-[10px] leading-relaxed tracking-wider text-neutral-600">
                {FACTORIAL_52}
              </p>
            </div>
          );
        }

        return (
          <p
            key={`p-${index}`}
            className={block.highlight ? "pt-4 text-white/80" : undefined}
          >
            {block.text}
          </p>
        );
      })}
    </div>

    <button
      onClick={onStart}
      className="mt-14 border border-white/20 px-10 py-4 text-sm uppercase tracking-[0.2em] text-white/80 transition-all duration-500 hover:bg-white hover:text-black"
    >
      {article.cta}
    </button>

    <BackButton onClick={onBack} />
  </motion.div>
);

const LookView = ({ onArchive }) => {
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowInput(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showInput) return undefined;

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
        deck: shuffleDeck(),
        quote: QUOTES[Math.floor(Math.random() * QUOTES.length)]
      });
    }, 1200);
  };

  return (
    <motion.div
      key="look"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.4 }}
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16"
    >
      <div
        className={`text-center transition-all duration-1000 ${
          showInput ? "mb-10 opacity-30" : "mb-0 opacity-100"
        }`}
      >
        <p className="mb-2 font-mono text-lg tracking-widest text-neutral-400">
          {formatDate(currentTime)}
        </p>
        <p className="font-mono text-4xl tracking-widest text-white/90">
          {formatTime(currentTime)}
        </p>

        {!showInput && (
          <p className="mt-10 animate-pulse font-light tracking-widest text-neutral-500">
            這一刻，不會再重來。
          </p>
        )}
      </div>

      <AnimatePresence>
        {showInput && (
          <motion.div
            key="input-box"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="flex w-full flex-col items-center"
          >
            <div className="mb-10 flex flex-col items-center text-center text-sm font-light leading-relaxed tracking-[0.15em] text-neutral-500">
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
              onChange={(event) => setInput(event.target.value)}
              maxLength={40}
              disabled={isArchiving}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="w-full border-b border-white/20 bg-transparent pb-4 text-center text-2xl font-light tracking-wide text-white placeholder-neutral-800 transition-colors focus:border-white/60 focus:outline-none disabled:opacity-50 md:text-3xl"
              autoFocus
            />

            <p className="mt-5 text-center text-xs font-light tracking-wider text-neutral-700">
              例如：我有點累／窗外在下雨／我不知道
            </p>

            <button
              onClick={handleAction}
              disabled={!input.trim() || isArchiving}
              className="mt-14 bg-white px-12 py-4 text-sm tracking-[0.3em] text-black transition-all duration-700 hover:bg-neutral-200 disabled:opacity-0"
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
  const deckText = data.deck?.join(" ") || "";

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-16 px-6 py-12 md:flex-row md:gap-24"
    >
      <div
        ref={cardRef}
        className="relative flex w-full max-w-sm flex-shrink-0 flex-col items-center overflow-hidden border border-white/10 bg-[#0E0E0E] p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <h2 className="mb-16 text-2xl font-bold tracking-[0.3em] text-white/90">
          52!
        </h2>

        <p className="mb-8 text-xs tracking-[0.3em] text-neutral-600">
          此刻我看見
        </p>

        <p className="mb-10 break-words px-2 text-2xl font-light leading-relaxed tracking-wider text-white/95 md:text-3xl">
          「{data.text}」
        </p>

        <p className="mb-12 px-4 text-sm font-light leading-relaxed tracking-wider text-neutral-400 md:text-base">
          {data.quote}
        </p>

        {deckText && (
          <div className="mb-12 w-full border-y border-white/10 py-5">
            <p className="mb-3 text-[8px] uppercase tracking-[0.35em] text-neutral-700">
              Deck Sequence
            </p>
            <p className="break-words font-mono text-[9px] leading-relaxed tracking-wider text-neutral-600">
              {deckText}
            </p>
          </div>
        )}

        <div className="flex w-full flex-col items-center gap-2 break-all px-4 font-mono text-[10px] tracking-widest text-neutral-500 md:text-xs">
          <p>
            {data.date} {data.time}
          </p>
          <p className="mt-4">{data.signature}</p>
        </div>

        <p className="mt-16 text-[9px] uppercase tracking-[0.2em] text-neutral-700">
          This moment will never happen again.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-start text-left">
        <h2 className="mb-10 text-3xl font-light tracking-[0.2em] text-white/90 md:text-4xl">
          這一刻，被保存了。
        </h2>

        <div className="mb-12 space-y-4 text-sm font-light leading-relaxed tracking-widest text-neutral-400 md:text-base">
          <p>這不是占卜結果。</p>
          <p>它只是宇宙在這一刻留下的一個座標。</p>
          <p>而你留下了自己的觀察。</p>
        </div>

        <div className="mb-14 space-y-4 text-sm font-light leading-relaxed tracking-widest text-neutral-500 md:text-base">
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

const EditionButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`border px-5 py-3 text-xs tracking-[0.2em] transition-colors ${
      active
        ? "border-white bg-white text-black"
        : "border-white/15 text-neutral-500 hover:border-white/40 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const ProductMockup = ({ selectedColor, onSelectColor }) => {
  const edition = getEditionMeta(selectedColor);

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-neutral-700">
        The Garment
      </p>

      <div className="relative flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden border border-white/10 bg-[#111]">
        <img
          src={edition.setImage}
          alt={`52! ${edition.label} T-shirt mockup`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-5 flex gap-3">
        <EditionButton active={selectedColor === "black"} onClick={() => onSelectColor("black")}>
          黑色
        </EditionButton>
        <EditionButton active={selectedColor === "cream"} onClick={() => onSelectColor("cream")}>
          米白
        </EditionButton>
      </div>

      <p className="mt-5 text-xs font-light leading-relaxed tracking-wider text-neutral-600">
        {edition.description}
      </p>
    </div>
  );
};

const ArtworkPreview = ({ data, selectedColor }) => {
  const edition = getEditionMeta(selectedColor);

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-neutral-700">
        Your Moment
      </p>

      <div className="relative flex aspect-[4/5] w-full max-w-sm items-center justify-center overflow-hidden border border-white/10 bg-[#0E0E0E]">
        <img
          src={edition.artworkImage}
          alt={`52! ${edition.label} artwork preview`}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-5 space-y-3 text-xs font-light leading-relaxed tracking-wider text-neutral-600">
        <p>
          圖案中的 <span className="text-neutral-400">YOUR MOMENT</span> 區域，
          會替換成你在 Look 頁面寫下的那句話。
        </p>

        <p className="text-neutral-400">
          此刻我看見：「{data.text}」
        </p>

        <p>
          當下金句：<span className="text-neutral-400">{data.quote}</span>
        </p>
      </div>
    </div>
  );
};

const HiddenFactoryArtwork = React.forwardRef(({ data, deckRows, selectedColor }, ref) => {
  const edition = getEditionMeta(selectedColor);

  return (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      <div
        ref={ref}
        className="flex flex-col items-center justify-between font-sans"
        style={{
          width: "1200px",
          height: "1600px",
          backgroundColor: "transparent",
          padding: "110px",
          color: edition.factoryInk
        }}
      >
        <div style={{ width: "100%", textAlign: "center" }}>
          <p
            style={{
              fontSize: "86px",
              fontWeight: 700,
              letterSpacing: "0.35em",
              color: edition.factoryInk,
              marginBottom: "110px"
            }}
          >
            52!
          </p>

          <div
            style={{
              width: "100%",
              border: `2px solid ${edition.factoryLine}`,
              padding: "110px 70px",
              marginBottom: "90px"
            }}
          >
            <p
              style={{
                fontSize: "72px",
                fontWeight: 300,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: edition.factoryInk,
                marginBottom: "50px"
              }}
            >
              LOOK.
            </p>

            <p
              style={{
                fontSize: "24px",
                letterSpacing: "0.25em",
                color: edition.factoryMuted,
                marginBottom: "38px"
              }}
            >
              YOUR MOMENT
            </p>

            <p
              style={{
                fontSize: "86px",
                fontWeight: 300,
                letterSpacing: "0.08em",
                color: edition.factoryInk,
                textAlign: "center",
                lineHeight: "1.35",
                margin: 0
              }}
            >
              「{data.text}」
            </p>
          </div>

          <p
            style={{
              fontSize: "24px",
              letterSpacing: "0.35em",
              color: edition.factoryMuted,
              marginBottom: "20px"
            }}
          >
            SPACE-TIME SIGNATURE
          </p>

          <p
            style={{
              fontSize: "34px",
              fontFamily: "monospace",
              letterSpacing: "0.18em",
              color: edition.factoryInk,
              marginBottom: "90px"
            }}
          >
            {data.signature}
          </p>

          {deckRows.length > 0 && (
            <div
              style={{
                width: "100%",
                marginBottom: "90px",
                fontFamily: "monospace",
                fontSize: "24px",
                letterSpacing: "0.12em",
                lineHeight: "1.8",
                color: edition.factoryInk,
                textAlign: "center"
              }}
            >
              {deckRows.map((row, index) => (
                <p key={`factory-row-${index}`} style={{ margin: 0 }}>
                  {row.join(" ")}
                </p>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: "100%", textAlign: "center" }}>
          <div
            style={{
              width: "260px",
              height: "1px",
              backgroundColor: edition.factoryLine,
              margin: "0 auto 70px"
            }}
          />

          <p
            style={{
              fontSize: "26px",
              letterSpacing: "0.25em",
              color: edition.factoryMuted,
              margin: 0
            }}
          >
            THIS MOMENT WILL NEVER HAPPEN AGAIN
          </p>
        </div>
      </div>
    </div>
  );
});

HiddenFactoryArtwork.displayName = "HiddenFactoryArtwork";

const TShirtView = ({ data, onBack }) => {
  const [selectedColor, setSelectedColor] = useState("black");
  const factoryRef = useRef(null);
  const deckRows = chunkArray(data.deck || [], 13);
  const edition = getEditionMeta(selectedColor);

  const handlePreorder = () => {
    const params = new URLSearchParams();
    const deckText = data.deck?.join(" ") || "";

    appendFormValue(params, "usp", "pp_url");
    appendFormValue(params, FORM_ENTRY_DECK, deckText);
    appendFormValue(params, FORM_ENTRY_SIGNATURE, data.signature);
    appendFormValue(params, FORM_ENTRY_TIME, `${data.date} ${data.time}`);
    appendFormValue(params, FORM_ENTRY_MOMENT_TEXT, data.text);
    appendFormValue(params, FORM_ENTRY_QUOTE, data.quote || "");

    appendFormValue(params, FORM_ENTRY_SIZE, "M");
    appendFormValue(params, FORM_ENTRY_COLOR, edition.formValue);

    appendFormValue(
      params,
      FORM_ENTRY_CUSTOM_NOTICE,
      "我了解本商品屬個人化客製商品，將依本人於網站生成之牌序、時空簽章與此刻文字專屬製作。訂單確認後即進入製作流程，除商品瑕疵、印刷錯誤或寄送錯誤外，恕不接受任意退換貨。若無故拒收導致商品無法再次銷售，營運方得保留請求相關製作與物流成本之權利。"
    );

    appendFormValue(
      params,
      FORM_ENTRY_PRIVACY_NOTICE,
      "本表單所蒐集之姓名、電話、Line 帳號或 Email 與收件地址，僅用於訂單聯繫、商品製作、物流寄送與售後服務，不作其他用途。"
    );

    window.open(
      `${GOOGLE_FORM_BASE_URL}?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleFactoryExport = async () => {
    try {
      await exportElementAsPng(factoryRef.current, `FACTORY-PRINT-${data.signature}.png`, {
        scale: 4,
        backgroundColor: null
      });

      alert("已匯出客製化圖案預覽檔。");
    } catch (error) {
      console.error("圖檔匯出失敗", error);
    }
  };

  return (
    <>
      <motion.div
        key="tshirt"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-12"
      >
        <div className="mb-14 text-center">
          <p className="mb-4 text-[10px] uppercase tracking-[0.45em] text-neutral-700">
            T-Shirt
          </p>

          <h2 className="mb-6 text-3xl font-light tracking-[0.2em] text-white/90 md:text-4xl">
            把一個瞬間穿在身上。
          </h2>

          <p className="mx-auto max-w-2xl text-sm font-light leading-relaxed tracking-wider text-neutral-500 md:text-base">
            選擇黑色 Gothic Archive 或米白 Renaissance Manuscript。
            圖案中的 YOUR MOMENT 區域，會替換成你剛剛寫下的那句話。
          </p>
        </div>

        <div className="grid w-full gap-10 lg:grid-cols-[1fr_1fr_0.85fr]">
          <ProductMockup selectedColor={selectedColor} onSelectColor={setSelectedColor} />

          <ArtworkPreview data={data} selectedColor={selectedColor} />

          <div className="flex flex-col justify-center text-left">
            <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-neutral-700">
              The Order
            </p>

            <h3 className="mb-8 text-2xl font-light leading-relaxed tracking-[0.18em] text-white/90">
              這不是一句標語。
              <br />
              是一個被看見的瞬間。
            </h3>

            <div className="mb-10 space-y-4 text-sm font-light leading-relaxed tracking-wider text-neutral-400 md:text-base">
              <p>目前選擇：{edition.label}｜{edition.title}</p>
              <p>正面保留 52! 與 Look. 的極簡識別。</p>
              <p>背面保存牌序、時空簽章與此刻文字。</p>
              <p>每一件都來自一次不可重複的生成。</p>
            </div>

            <div className="mb-10 border-y border-white/10 py-6 text-xs font-light leading-relaxed tracking-wider text-neutral-600">
              <p>Space-Time Signature</p>
              <p className="mt-2 font-mono text-neutral-400">{data.signature}</p>

              <p className="mt-5">Your Moment</p>
              <p className="mt-2 text-neutral-400">「{data.text}」</p>

              <p className="mt-5">當下金句</p>
              <p className="mt-2 text-neutral-400">{data.quote}</p>

              <p className="mt-5">Color</p>
              <p className="mt-2 text-neutral-400">{edition.formValue}</p>
            </div>

            <button
              onClick={handlePreorder}
              className="mb-5 flex w-full items-center justify-center gap-3 bg-white px-12 py-4 text-sm tracking-[0.2em] text-black transition-colors hover:bg-neutral-200"
            >
              前往預購 <ArrowRight size={16} />
            </button>

            <button
              onClick={handleFactoryExport}
              className="mb-6 flex w-full items-center justify-center gap-3 border border-white/15 px-12 py-4 text-xs tracking-[0.2em] text-neutral-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              匯出客製圖案預覽
            </button>

            <button
              onClick={onBack}
              className="text-xs tracking-[0.1em] text-neutral-500 transition-colors hover:text-white"
            >
              ← 返回觀看紀錄
            </button>

            <p className="mt-8 text-xs font-light leading-relaxed tracking-wider text-neutral-600">
              * 點擊預購將前往訂製表單，專屬牌序、時空簽章、此刻文字與當下金句會自動帶入。
            </p>
          </div>
        </div>
      </motion.div>

      <HiddenFactoryArtwork
        ref={factoryRef}
        data={data}
        deckRows={deckRows}
        selectedColor={selectedColor}
      />
    </>
  );
};

export default function App() {
  const [step, setStep] = useState("home");
  const [articleId, setArticleId] = useState(null);
  const [momentData, setMomentData] = useState(null);

  const openArticle = (id) => {
    setArticleId(id);
    setStep("article");
  };

  const startLooking = () => {
    setStep("look");
  };

  const backHome = () => {
    setArticleId(null);
    setStep("home");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] text-[#d4d4d4] selection:bg-white selection:text-black">
      <AnimatePresence mode="wait">
        {step === "home" && (
          <HomeView
            onStart={startLooking}
            onAbout={() => openArticle("about")}
            onLookArticle={() => openArticle("look")}
            onSolitude={() => openArticle("solitude")}
          />
        )}

        {step === "article" && articleId && ARTICLES[articleId] && (
          <ArticleView
            article={ARTICLES[articleId]}
            onBack={backHome}
            onStart={startLooking}
          />
        )}

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
          <TShirtView data={momentData} onBack={() => setStep("archive")} />
        )}
      </AnimatePresence>
    </div>
  );
}
