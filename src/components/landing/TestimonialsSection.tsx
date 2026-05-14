import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

/* ─── Types ─── */
interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  text: string;
  returns: string;
  since: string;
  verified: boolean;
}

/* ─── Constants ─── */
const SLATE = "#0d1421";
const SLATE2 = "#17212d";
const BORDER = "#1a2535";
const TEXT = "#eaecef";
const MUTED = "#8a919e";
const BLUE = "#3861fb";
const UP = "#16c784";

/* ─── Data ─── */
const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Marcus Chen",
    role: "Software Engineer",
    location: "San Francisco, USA",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Marcus&backgroundColor=b6e3f4",
    rating: 5,
    text: "I've tried five different crypto platforms and nothing comes close. The real-time analytics helped me time my BTC entry perfectly. Up 340% since joining — this platform genuinely changed my financial trajectory.",
    returns: "+340%",
    since: "2022",
    verified: true,
  },
  {
    id: 2,
    name: "Aisha Reeves",
    role: "Financial Analyst",
    location: "Texas, USA",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Aisha&backgroundColor=ffdfbf",
    rating: 5,
    text: "The market intelligence tools here are institutional-grade. I track 30+ coins effortlessly, and the watchlist alerts are incredibly precise. My portfolio has grown 2.8x in 18 months purely through informed decisions.",
    returns: "+180%",
    since: "2023",
    verified: true,
  },
  {
    id: 3,
    name: "James Whitfield",
    role: "Retired Teacher",
    location: "London, UK",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=James&backgroundColor=c0aede",
    rating: 5,
    text: "I was skeptical about crypto at 58 years old. The educational resources and clean interface made it accessible. Started with £5,000 and it's now worth £23,000. The security features gave me the confidence to invest.",
    returns: "+360%",
    since: "2021",
    verified: true,
  },
  {
    id: 4,
    name: "Sofia Ramirez",
    role: "Startup Founder",
    location: "Mexico City, Mexico",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Sofia&backgroundColor=d1f4d0",
    rating: 5,
    text: "Managing treasury in volatile markets is stressful. This platform's portfolio tools let me hedge company funds smartly. The candlestick charts and technical indicators are everything a serious investor needs.",
    returns: "+215%",
    since: "2022",
    verified: true,
  },
  {
    id: 5,
    name: "Kenji Nakamura",
    role: "Day Trader",
    location: "Tokyo, Japan",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Kenji&backgroundColor=ffd5dc",
    rating: 5,
    text: "Speed matters in day trading. The live candlestick charts update faster than any competitor I've tested. The BTC/ETH/SOL pairs I trade most have zero lag. My monthly returns jumped 40% after switching here.",
    returns: "+890%",
    since: "2021",
    verified: true,
  },
  {
    id: 6,
    name: "Priya Sharma",
    role: "Investment Banker",
    location: "Mumbai, India",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Priya&backgroundColor=b6e3f4",
    rating: 5,
    text: "Coming from traditional finance, I demanded institutional-grade tools. The market cap rankings, Fear & Greed index integration, and multi-asset comparison views rival Bloomberg terminals. Remarkable for a retail platform.",
    returns: "+127%",
    since: "2023",
    verified: true,
  },
  {
    id: 7,
    name: "David Osei",
    role: "Medical Doctor",
    location: "Accra, Ghana",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=David&backgroundColor=c0aede",
    rating: 5,
    text: "Busy schedule means I need automation. The watchlist alerts and portfolio summaries keep me informed without constant monitoring. My crypto allocation now outperforms my pension fund. Never expected to say that.",
    returns: "+290%",
    since: "2022",
    verified: true,
  },
  {
    id: 8,
    name: "Emma Johansson",
    role: "UX Designer",
    location: "Stockholm, Sweden",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Emma&backgroundColor=ffdfbf",
    rating: 5,
    text: "As a designer, I notice everything. This platform is the only one where the UX didn't get in my way. Dark mode is gorgeous, charts are crisp, and every interaction feels deliberate. Doubled my ETH position with full confidence.",
    returns: "+198%",
    since: "2023",
    verified: true,
  },
  {
    id: 9,
    name: "Carlos Mendoza",
    role: "Real Estate Investor",
    location: "Miami, USA",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Carlos&backgroundColor=d1f4d0",
    rating: 5,
    text: "I diversify across asset classes and wanted crypto exposure without complexity. The platform's clean market rankings and performance metrics made allocation decisions straightforward. 18-month ROI beats my Miami properties.",
    returns: "+445%",
    since: "2022",
    verified: true,
  },
  {
    id: 10,
    name: "Fatima Al-Hassan",
    role: "University Professor",
    location: "Dubai, UAE",
    avatar: "https://api.dicebear.com/8.x/notionists/svg?seed=Fatima&backgroundColor=ffd5dc",
    rating: 5,
    text: "I research fintech academically and use this platform personally. The data transparency, live volume metrics, and BTC dominance indicators are research-grade. My students use screenshots from here in their thesis work.",
    returns: "+162%",
    since: "2023",
    verified: true,
  },
];

/* ─── StarRating ─── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          style={{
            fill: i < rating ? "#f59e0b" : "transparent",
            color: i < rating ? "#f59e0b" : "#3a4a5c",
          }}
        />
      ))}
    </div>
  );
}

/* ─── TestimonialCard ─── */
function TestimonialCard({
  t,
  isActive,
}: {
  t: Testimonial;
  isActive: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 h-full transition-all duration-500"
      style={{
        background: isActive ? "#1a2d45" : SLATE2,
        border: `1px solid ${isActive ? BLUE + "55" : BORDER}`,
        boxShadow: isActive ? `0 0 40px rgba(56,97,251,0.12)` : "none",
      }}
    >
      {/* Quote icon */}
      <Quote
        className="w-8 h-8 shrink-0"
        style={{ color: isActive ? BLUE : "#253047", opacity: 0.8 }}
      />

      {/* Text */}
      <p className="text-sm leading-relaxed flex-1" style={{ color: isActive ? TEXT : MUTED }}>
        "{t.text}"
      </p>

      {/* Returns badge */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-fit"
        style={{ background: "rgba(22,199,132,0.1)", color: UP, border: "1px solid rgba(22,199,132,0.2)" }}
      >
        <span style={{ fontSize: 10 }}>▲</span>
        {t.returns} portfolio returns
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${BORDER}` }} />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: "#253047", border: `2px solid ${isActive ? BLUE + "66" : BORDER}` }}
        >
          <img
            src={t.avatar}
            alt={t.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent) {
                parent.textContent = t.name[0];
                parent.style.color = TEXT;
                parent.style.fontWeight = "700";
                parent.style.fontSize = "18px";
              }
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold truncate" style={{ color: TEXT }}>
              {t.name}
            </span>
            {t.verified && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: "rgba(56,97,251,0.15)", color: "#7da3ff", fontSize: 9 }}
              >
                ✓ Verified
              </span>
            )}
          </div>
          <div className="text-xs truncate" style={{ color: MUTED }}>
            {t.role} · {t.location}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={t.rating} />
            <span className="text-xs" style={{ color: MUTED }}>since {t.since}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
/* ─── Main Component (Fixed & Responsive) ─── */
export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const total = TESTIMONIALS.length;

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const visibleIndices = Array.from({ length: visibleCount }, (_, i) =>
    (current + i) % total
  );

  return (
    <section
      style={{ background: SLATE, borderTop: `1px solid ${BORDER}` }}
      className="py-12 md:py-20 overflow-hidden" // Added overflow-hidden
    >
      <div className="max-w-screen-xl mx-auto px-4 relative">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span
            className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(56,97,251,0.12)", color: "#7da3ff", border: "1px solid rgba(56,97,251,0.25)" }}
          >
            Investor Stories
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold mb-3 px-2" style={{ color: TEXT }}>
            Trusted by <span style={{ color: "#10b981" }}>Thousands</span>
          </h2>
          
          {/* Social proof bar - Made Wrap on Mobile */}
          <div
            className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-6 px-4 md:px-6 py-3 rounded-2xl mx-auto"
            style={{ background: SLATE2, border: `1px solid ${BORDER}` }}
          >
            <div className="flex flex-col items-center">
              <div className="text-lg md:text-xl font-extrabold" style={{ color: TEXT }}>4.9</div>
              <StarRating rating={5} />
            </div>
            <div className="hidden sm:block" style={{ width: 1, height: 30, background: BORDER }} />
            <div className="flex flex-col items-center">
              <div className="text-lg md:text-xl font-extrabold" style={{ color: TEXT }}>127K+</div>
              <div className="text-[10px] uppercase tracking-tighter" style={{ color: MUTED }}>Users</div>
            </div>
            <div className="hidden sm:block" style={{ width: 1, height: 30, background: BORDER }} />
            <div className="flex flex-col items-center">
              <div className="text-lg md:text-xl font-extrabold" style={{ color: UP }}>$2.4B+</div>
              <div className="text-[10px] uppercase tracking-tighter" style={{ color: MUTED }}>Volume</div>
            </div>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          className="relative group px-2 md:px-0"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards Grid - Use min-w-0 to prevent layout breaking */}
          <div
            className="grid gap-4 md:gap-5 transition-all duration-500"
            style={{
              gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
            }}
          >
            {visibleIndices.map((idx, pos) => (
              <div key={`${idx}-${pos}`} className="w-full">
                <TestimonialCard
                  t={TESTIMONIALS[idx]}
                  isActive={visibleCount > 1 ? pos === Math.floor(visibleCount / 2) : true}
                />
              </div>
            ))}
          </div>

          {/* Navigation Buttons - Adjusted for Mobile to stay inside screen */}
          <button
            onClick={prev}
            className="absolute left-0 md:-left-5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all bg-[#17212d] border border-[#1a2535] hover:bg-[#1e2d3d] z-20 shadow-xl"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: TEXT }} />
          </button>
          
          <button
            onClick={next}
            className="absolute right-0 md:-right-5 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all bg-[#17212d] border border-[#1a2535] hover:bg-[#1e2d3d] z-20 shadow-xl"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" style={{ color: TEXT }} />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex flex-col items-center mt-10">
          <div className="flex justify-center gap-1.5 md:gap-2 mb-4">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  background: i === current ? BLUE : "#253047",
                }}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest" style={{ color: MUTED }}>
            Story {current + 1} / {total}
          </p>
        </div>
      </div>
    </section>
  );
}