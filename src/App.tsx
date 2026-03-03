import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  APPS_SCRIPT_URL:
    "https://script.google.com/macros/s/AKfycbyskWmGGiHqGGk8frH3sLakCFMm-MiHBz2m87FZCzJyaVg6CcCaCcDgghhsFtZzvDDmFA/exec",
  GOOGLE_FORM_URL:
    "https://docs.google.com/forms/d/e/1FAIpQLSfQaB8NeGIUHhAQaq40GeBE5ue6ra69o_THhaO7h7aY4gy0rg/viewform",
  DONATION_GOAL: 5_900_000,
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

function useCountUp(target: number, duration = 2200): number {
  const [value, setValue] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 5);
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

function AnimatedTotal({ amount }: { amount: number }) {
  const val = useCountUp(amount);
  return <span>{formatRp(val)}</span>;
}

// ─── STAR FIELD ───────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 6,
    duration: Math.random() * 4 + 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: 0,
            animation: `starTwinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── CRESCENT ─────────────────────────────────────────────────────
function Crescent({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M20 4a12 12 0 1 0 0 24 9 9 0 1 1 0-24z" fill="#A855F7" />
    </svg>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-5">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-28 rounded bg-white/10 animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

// ─── DONOR CARD ───────────────────────────────────────────────────
interface DonorCardProps {
  donor: Donation;
  rank: number;
  delay: number;
}

function DonorCard({ donor, rank, delay }: DonorCardProps) {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div
      className="group relative rounded-lg p-4 sm:p-5 transition-all duration-500 cursor-default"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        animation: "cardReveal 0.7s cubic-bezier(0.16,1,0.3,1) both",
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(168,85,247,0.35)";
        (e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.06)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLDivElement).style.background =
          "rgba(255,255,255,0.04)";
      }}
    >
      {/* top shimmer on hover */}
      <div
        className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), transparent)",
        }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {rank < 3 && (
              <span className="text-sm shrink-0">{medals[rank]}</span>
            )}
            <p className="font-medium text-stone-200 truncate text-sm leading-tight tracking-wide">
              {donor.name}
            </p>
          </div>
          <p className="text-[11px] text-stone-500 font-mono mt-0.5">
            {donor.timestamp}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p
            className="text-base sm:text-lg font-bold tabular-nums"
            style={{ color: "#c084fc" }}
          >
            {formatRp(donor.amount)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── COSMIC PROGRESS ──────────────────────────────────────────────
function CosmicProgress({ value }: { value: number }) {
  return (
    <div
      className="relative h-1.5 w-full rounded-full overflow-hidden"
      style={{ background: "rgba(255,255,255,0.08)" }}
    >
      <div
        className="h-full rounded-full relative transition-all duration-[1500ms] ease-out"
        style={{
          width: `${value}%`,
          background: "linear-gradient(90deg, #4a1d96, #a855f7, #d8b4fe)",
          boxShadow: "0 0 10px rgba(168,85,247,0.5)",
        }}
      >
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
          style={{
            background: "#d8b4fe",
            boxShadow: "0 0 8px 3px rgba(216,180,254,0.7)",
          }}
        />
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

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
    } catch {
      setError("Could not load donation data. Retrying automatically.");
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html, body {
          margin: 0; padding: 0;
          font-family: 'DM Sans', sans-serif;
          background-color: #09090f;
          color: #e2e8f0;
          min-height: 100vh;
        }

        .display { font-family: 'Cormorant Garamond', serif; }

        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(88,28,135,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 85% 55%,  rgba(15,23,50,0.5)   0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 10% 85%,  rgba(10,30,40,0.4)   0%, transparent 70%),
            #09090f;
        }

        @keyframes starTwinkle {
          0%, 100% { opacity: 0;   transform: scale(0.8); }
          50%       { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(28px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
        }
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(18px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbitGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(168,85,247,0.4)); }
          50%       { filter: drop-shadow(0 0 10px rgba(168,85,247,0.9)); }
        }

        .hero-block  { animation: heroReveal 1.2s cubic-bezier(0.16,1,0.3,1) both; }
        .stats-block { animation: fadeUp 0.8s ease both; }
        .crescent-glow { animation: orbitGlow 3s ease-in-out infinite; }

        .cosmic-sep {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(168,85,247,0.25), rgba(255,255,255,0.06), rgba(168,85,247,0.25), transparent);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.25); border-radius: 2px; }
      `}</style>

      <StarField />

      {/* Amber top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-px z-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, #a855f7, #d8b4fe, #a855f7, transparent)",
        }}
      />

      <div className="relative z-10 min-h-screen max-w-2xl mx-auto px-5 sm:px-8 pt-12 pb-20">
        {/* ── HEADER ── */}
        <header className="mb-14">
          <div
            className="flex items-center gap-3 mb-8 hero-block"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="crescent-glow">
              <Crescent size={26} />
            </div>
            <Badge
              variant="outline"
              className="font-normal text-[10px] tracking-[0.25em] uppercase px-3 py-0.5"
              style={{
                borderColor: "rgba(168,85,247,0.3)",
                background: "rgba(168,85,247,0.07)",
                color: "#c084fc",
              }}
            >
              Ramadan 1446 H
            </Badge>
          </div>

          <div className="hero-block" style={{ animationDelay: "0.25s" }}>
            <h1
              className="display font-semibold leading-none tracking-tight"
              style={{ fontSize: "clamp(2.8rem,8vw,4rem)" }}
            >
              <span style={{ color: "#f5f0e8" }}>Apollo Smansasi</span>
              <br />
              <span style={{ color: "#a855f7" }}>Ramadan Charity Event</span>
            </h1>
          </div>

          <p
            className="hero-block mt-5 text-stone-400 text-sm sm:text-base font-light max-w-sm leading-relaxed"
            style={{ animationDelay: "0.45s" }}
          >
            Every act of giving during Ramadan is multiplied. Your contribution
            reaches those who need it most.
          </p>
          <p
            className="hero-block text-stone-400 text-sm sm:text-base font-light max-w-sm leading-relaxed"
            style={{ animationDelay: "0.45s" }}
          >
            Donation Period: 2nd - 13th March 2026
          </p>

          <div className="hero-block mt-8" style={{ animationDelay: "0.65s" }}>
            <a
              href={CONFIG.GOOGLE_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="block sm:inline-block"
            >
              <button
                className="w-full sm:w-auto h-11 px-8 text-xs font-medium tracking-[0.2em] uppercase rounded-sm transition-all duration-300 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #4a1d96, #7c3aed)",
                  color: "#f3e8ff",
                  border: "1px solid rgba(168,85,247,0.3)",
                  boxShadow:
                    "0 0 24px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 40px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #7c3aed, #9333ea)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 0 24px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "linear-gradient(135deg, #4a1d96, #7c3aed)";
                }}
              >
                Donate Now
              </button>
            </a>
          </div>
        </header>

        <div className="cosmic-sep mb-10" />

        {/* ── ERROR ── */}
        {error && (
          <div
            className="mb-8 rounded-lg px-4 py-3 text-xs text-red-400"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* ── BENEFICIARY ── */}
        <section
          className="stats-block mb-10"
          style={{ animationDelay: "0.8s" }}
        >
          <h2 className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium mb-5">
            Proceeds Go To
          </h2>
          <a
            href="https://pantiyatim.or.id/"
            target="_blank"
            rel="noreferrer"
            className="group block rounded-lg overflow-hidden relative transition-all duration-500"
            style={{
              border: "1px solid rgba(168,85,247,0.2)",
              background: "rgba(255,255,255,0.03)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border =
                "1px solid rgba(168,85,247,0.45)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 30px rgba(168,85,247,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.border =
                "1px solid rgba(168,85,247,0.2)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            {/* Image */}
            <div
              className="relative overflow-hidden"
              style={{ height: "180px" }}
            >
              <img
                src="https://pantiyatim.or.id/wp-content/uploads/2020/09/pyi-logo-color.png"
                alt="Panti Asuhan PYI Yatim & Zakat"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ filter: "brightness(0.6) saturate(0.8)" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(9,9,15,0.95) 0%, rgba(9,9,15,0.3) 60%, transparent 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p
                  className="display text-xl font-semibold leading-tight"
                  style={{ color: "#f5f0e8" }}
                >
                  Panti Asuhan PYI
                </p>
                <p
                  className="display text-base italic"
                  style={{ color: "#c084fc" }}
                >
                  Yatim &amp; Zakat
                </p>
              </div>
            </div>

            {/* Text body */}
            <div className="p-4 sm:p-5">
              <p className="text-stone-400 text-sm font-light leading-relaxed mb-4">
                100% of all donations collected through Apollo Smansasi Ramadan Charity
                Event will be channelled directly to{" "}
                <span style={{ color: "#c084fc" }}>
                  Panti Asuhan PYI Yatim &amp; Zakat
                </span>{" "}
                — supporting orphans and those in need during this blessed month
                of Ramadan.
              </p>
              <div
                className="flex items-center gap-2"
                style={{ color: "#a855f7" }}
              >
                <span className="text-xs font-medium tracking-wider uppercase">
                  Visit pantiyatim.or.id
                </span>
                <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">
                  ↗
                </span>
              </div>
            </div>
          </a>
        </section>

        <div className="cosmic-sep mb-10" />

        {/* ── STATS ── */}
        <div className="stats-block" style={{ animationDelay: "0.95s" }}>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div
              className="rounded-lg p-5 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at top left, rgba(168,85,247,0.07), transparent 70%)",
                }}
              />
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2 font-medium">
                Total Raised
              </p>
              <p
                className="text-xl sm:text-2xl font-bold tabular-nums"
                style={{ color: "#d8b4fe" }}
              >
                {loading ? (
                  <span
                    className="inline-block w-32 h-6 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                ) : (
                  <AnimatedTotal amount={total} />
                )}
              </p>
            </div>

            <div
              className="rounded-lg p-5 relative overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at top right, rgba(56,189,248,0.05), transparent 70%)",
                }}
              />
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] mb-2 font-medium">
                Donors
              </p>
              <p className="text-xl sm:text-2xl font-bold text-stone-200">
                {loading ? (
                  <span
                    className="inline-block w-12 h-6 rounded animate-pulse"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                ) : (
                  sorted.length
                )}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-3 gap-1">
              <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] font-medium">
                Goal Progress
              </p>
              <p className="text-[11px] text-stone-500 tabular-nums">
                {formatRp(total)}{" "}
                <span style={{ color: "rgba(255,255,255,0.15)" }}>
                  / {formatRp(CONFIG.DONATION_GOAL)}
                </span>
              </p>
            </div>
            <CosmicProgress value={pct} />
            <p className="text-right text-[10px] text-stone-600 mt-2">{pct}%</p>
          </div>
        </div>

        {/* ── DONOR LIST ── */}
        <section className="stats-block" style={{ animationDelay: "1s" }}>
          <div className="flex items-center justify-between mb-6">
            <h2
              className="display text-xl font-semibold"
              style={{ color: "#f5f0e8" }}
            >
              Donors
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="rounded-lg py-16 text-center"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <Crescent size={36} />
              <p className="mt-4 text-stone-500 text-sm">
                No donations yet. Be the first to give.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sorted.map((d, i) => (
                <DonorCard key={i} donor={d} rank={i} delay={1000 + i * 80} />
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER ── */}
        <footer
          className="mt-16 pt-8 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-2">
            <Crescent size={14} />
            <span className="text-[10px] text-stone-600 font-medium tracking-widest uppercase">
              Apollo Smansasi Ramadan Charity Event 2026
            </span>
          </div>
          <p
            className="display text-sm italic"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            بركة رمضان
          </p>
        </footer>
      </div>

      {/* ── LIGHTBOX ── */}
      <Dialog open={!!lightboxSrc} onOpenChange={() => setLightboxSrc(null)}>
        <DialogContent
          className="w-[92vw] max-w-lg p-2 rounded-lg"
          style={{
            background: "#0f0f18",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          {lightboxSrc && (
            <img
              src={lightboxSrc}
              alt="Transfer Receipt"
              className="w-full rounded object-contain max-h-[78vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
