import { useState, useEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ─── TYPES ────────────────────────────────────────────────────────
interface Donation {
  name: string;
  amount: number;
  timestamp: string;
  receiptUrl: string;
}

interface ApiResponse {
  success: boolean;
  donations: Donation[];
  error?: string;
}

interface Config {
  APPS_SCRIPT_URL: string;
  GOOGLE_FORM_URL: string;
  DONATION_GOAL: number;
  REFRESH_MS: number;
}

// ─── CONFIG ──────────────────────────────────────────────────────
const CONFIG: Config = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyskWmGGiHqGGk8frH3sLakCFMm-MiHBz2m87FZCzJyaVg6CcCaCcDgghhsFtZzvDDmFA/exec",
  GOOGLE_FORM_URL: "https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit",
  DONATION_GOAL: 15_000_000,
  REFRESH_MS: 30_000,
};

// ─── DEMO DATA ────────────────────────────────────────────────────
const DEMO: Donation[] = [
  {
    name: "Ahmad Fauzi",
    amount: 1_000_000,
    timestamp: "01 Mar 2025, 10:22",
    receiptUrl: "",
  },
  {
    name: "Siti Rahayu",
    amount: 500_000,
    timestamp: "01 Mar 2025, 11:05",
    receiptUrl: "",
  },
  {
    name: "Budi Santoso",
    amount: 250_000,
    timestamp: "01 Mar 2025, 12:14",
    receiptUrl: "",
  },
  {
    name: "Anonymous",
    amount: 150_000,
    timestamp: "01 Mar 2025, 13:30",
    receiptUrl: "",
  },
  {
    name: "Dewi Lestari",
    amount: 750_000,
    timestamp: "01 Mar 2025, 14:01",
    receiptUrl: "",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────
const formatRp = (n: number): string =>
  "Rp\u00A0" + Number(n).toLocaleString("id-ID");

function useCountUp(target: number, duration = 1800): number {
  const [value, setValue] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}

// ─── CRESCENT SVG ─────────────────────────────────────────────────
function Crescent({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M20 4a12 12 0 1 0 0 24 9 9 0 1 1 0-24z"
        fill="currentColor"
        className="text-amber-500"
      />
    </svg>
  );
}

// ─── ANIMATED TOTAL ───────────────────────────────────────────────
function AnimatedTotal({ amount }: { amount: number }) {
  const val = useCountUp(amount);
  return <span>{formatRp(val)}</span>;
}

// ─── SKELETON CARD ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Card className="border-stone-200 bg-white">
      <CardContent className="p-4 sm:p-5">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-3.5 w-28 bg-stone-100 rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-stone-100 rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── DONOR CARD ───────────────────────────────────────────────────
interface DonorCardProps {
  donor: Donation;
  rank: number;
  onReceiptClick: (url: string) => void;
  delay: number;
}

function DonorCard({ donor, rank, onReceiptClick, delay }: DonorCardProps) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <Card
      className="group border-stone-200/80 bg-white/80 backdrop-blur-sm hover:border-amber-300 hover:shadow-md transition-all duration-300"
      style={{
        animation: "fadeSlideUp 0.5s ease both",
        animationDelay: `${delay}ms`,
      }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {rank < 3 && (
                <span className="text-sm shrink-0">{medals[rank]}</span>
              )}
              <p className="font-semibold text-stone-800 truncate text-sm leading-tight">
                {donor.name}
              </p>
            </div>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              {donor.timestamp}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-base sm:text-lg font-bold text-amber-600 tabular-nums">
              {formatRp(donor.amount)}
            </p>
          </div>
        </div>

        {donor.receiptUrl && (
          <button
            onClick={() => onReceiptClick(donor.receiptUrl)}
            className="mt-3 w-full rounded overflow-hidden block group/img text-left"
          >
            <img
              src={donor.receiptUrl}
              alt="Receipt"
              className="w-full h-20 object-cover opacity-70 group-hover/img:opacity-100 transition-opacity duration-200"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Tap to view receipt ↗
            </p>
          </button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [dark, setDark] = useState<boolean>(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const isDemo = CONFIG.APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL";

  async function fetchDonations(): Promise<void> {
    if (isDemo) {
      setDonations(DEMO);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(CONFIG.APPS_SCRIPT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      setDonations(data.donations ?? []);
      setError(null);
    } catch (e) {
      setError("Could not load donation data. Will retry automatically.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDonations();
    const timer = setInterval(fetchDonations, CONFIG.REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const sorted = [...donations].sort((a, b) => b.amount - a.amount);
  const total = sorted.reduce((s, d) => s + d.amount, 0);
  const pct = Math.min(100, Math.round((total / CONFIG.DONATION_GOAL) * 100));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        body {
          font-family: 'DM Sans', sans-serif;
          background-color: #FAFAF8;
          color: #1c1917;
        }

        .serif { font-family: 'Lora', serif; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .page-enter { animation: fadeSlideUp 0.7s ease both; }

        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 50; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="grain" />
      <div className="h-0.5 w-full bg-linear-to-r from-amber-300 via-orange-400 to-amber-300" />

      {/* CHANGED: Adjusted horizontal and vertical padding for mobile screens */}
      <div className="min-h-screen max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-14 page-enter">
        {/* ── HEADER ── */}
        <header className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* CHANGED: Made crescent slightly smaller on very small screens */}
              <div className="hidden sm:block">
                <Crescent size={28} />
              </div>
              <div className="block sm:hidden">
                <Crescent size={24} />
              </div>

              <Badge
                variant="outline"
                className="text-amber-700 border-amber-300 bg-amber-50 font-normal text-[10px] sm:text-xs tracking-widest uppercase"
              >
                Ramadan 1446 H
              </Badge>
            </div>
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          {/* CHANGED: Responsive text sizing (text-4xl to md:text-5xl) */}
          <h1 className="serif text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight leading-none mb-3 md:mb-4">
            Apollo Smansasi Berbagi
          </h1>
          <p className="text-stone-500 text-sm sm:text-base font-light max-w-md leading-relaxed">
            Every act of giving during Ramadan is multiplied. Your contribution
            reaches those who need it most.
          </p>

          <div className="mt-6 md:mt-8">
            <a
              href={CONFIG.GOOGLE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="block sm:inline-block"
            >
              {/* CHANGED: Button is full-width on mobile, auto-width on larger screens */}
              <Button className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-sm px-8 h-12 sm:h-10 text-sm tracking-wide transition-colors">
                Donate Now
              </Button>
            </a>
          </div>
        </header>

        <Separator className="mb-8 md:mb-10 bg-stone-200" />

        {/* ── SETUP NOTICE ── */}
        {isDemo && (
          <Alert className="mb-8 border-amber-200 bg-amber-50 text-amber-800">
            <AlertDescription className="text-xs leading-relaxed">
              <strong>Demo mode</strong> — Replace{" "}
              <code className="bg-amber-100 px-1 rounded break-all">
                YOUR_APPS_SCRIPT_URL
              </code>{" "}
              and{" "}
              <code className="bg-amber-100 px-1 rounded break-all">
                YOUR_GOOGLE_FORM_URL
              </code>{" "}
              in the config to go live. See <strong>SETUP_GUIDE.md</strong> for
              full instructions.
            </AlertDescription>
          </Alert>
        )}

        {/* ── ERROR ── */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50 text-red-700">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* ── STATS ROW ── */}
        {/* CHANGED: Stacks into 1 column on small screens to prevent text overlap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
          <Card className="border-stone-200 bg-white">
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-widest mb-1 sm:mb-2 font-medium">
                Total Raised
              </p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900 tabular-nums">
                {loading ? (
                  <span className="inline-block w-32 h-6 bg-stone-100 rounded animate-pulse" />
                ) : (
                  <AnimatedTotal amount={total} />
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-200 bg-white">
            <CardContent className="p-4 sm:p-5">
              <p className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-widest mb-1 sm:mb-2 font-medium">
                Donors
              </p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900">
                {loading ? (
                  <span className="inline-block w-12 h-6 bg-stone-100 rounded animate-pulse" />
                ) : (
                  sorted.length
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── PROGRESS ── */}
        <div className="mb-8 md:mb-10">
          {/* CHANGED: Flex layout allows stacking if text gets too wide on narrow screens */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 gap-1 sm:gap-0">
            <p className="text-xs text-stone-500 font-medium uppercase tracking-widest">
              Goal Progress
            </p>
            <p className="text-xs text-stone-500 tabular-nums">
              {formatRp(total)}{" "}
              <span className="text-stone-300">
                / {formatRp(CONFIG.DONATION_GOAL)}
              </span>
            </p>
          </div>
          <Progress
            value={pct}
            className="h-2 sm:h-1.5 bg-stone-100 [&>div]:bg-amber-400 [&>div]:transition-all [&>div]:duration-1000"
          />
          <p className="text-right text-[10px] sm:text-xs text-stone-400 mt-1.5">
            {pct}%
          </p>
        </div>

        <Separator className="mb-8 bg-stone-100" />

        {/* ── DONOR LIST ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-1 sm:gap-0">
            <h2 className="serif text-lg font-semibold text-stone-800">
              Donors
            </h2>
            <p className="text-[10px] sm:text-xs text-stone-400 font-mono">
              Auto-refreshes every 30s
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <Card className="border-stone-200 bg-white">
              <CardContent className="py-12 sm:py-16 text-center">
                <Crescent size={36} />
                <p className="mt-4 text-stone-400 text-sm">
                  No donations yet. Be the first to give.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sorted.map((d, i) => (
                <DonorCard
                  key={i}
                  donor={d}
                  rank={i}
                  onReceiptClick={setLightboxSrc}
                  delay={i * 60}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER ── */}
        <footer className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 text-stone-400">
            <Crescent size={16} />
            <span className="text-[10px] sm:text-xs font-medium">
              Apollo Berbagi
            </span>
          </div>
          <p className="serif text-xs text-stone-300 font-light italic">
            بركة رمضان
          </p>
        </footer>
      </div>

      {/* ── RECEIPT LIGHTBOX ── */}
      <Dialog open={!!lightboxSrc} onOpenChange={() => setLightboxSrc(null)}>
        {/* CHANGED: Adjusted dialog width and padding for mobile */}
        <DialogContent className="w-[90vw] max-w-xl p-2 sm:p-4 bg-white border-stone-200 rounded-lg">
          {lightboxSrc && (
            <img
              src={lightboxSrc}
              alt="Transfer Receipt"
              className="w-full rounded object-contain max-h-[75vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
