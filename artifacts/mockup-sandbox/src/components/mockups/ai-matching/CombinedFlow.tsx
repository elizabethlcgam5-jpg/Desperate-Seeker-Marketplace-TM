import { useState, useRef } from "react";

type Tab = "request" | "browse" | "seller";

const MOCK_RESULTS = [
  { id: 1, title: "Vintage Oak Dresser", price: "$120", location: "2.1 mi", match: 98, emoji: "🪵", condition: "Good" },
  { id: 2, title: "Mid-Century Sideboard", price: "$85", location: "3.4 mi", match: 84, emoji: "🪑", condition: "Fair" },
  { id: 3, title: "Wooden Chest of Drawers", price: "$65", location: "5.0 mi", match: 71, emoji: "📦", condition: "Good" },
];

const NOTIFICATIONS = [
  { id: 1, type: "exact", title: "Exact match", message: "A buyer 1.8 mi away is looking for a Vintage Oak Dresser — matches your listing.", time: "2 min ago", request: "Vintage oak dresser, 3 drawers, natural finish", read: false },
  { id: 2, type: "similar", title: "Similar match", message: "Buyer posted for mid-century wooden furniture. Your sideboard may be a fit.", time: "41 min ago", request: "Mid-century wooden furniture, any condition", read: false },
  { id: 3, type: "exact", title: "Exact match", message: "Someone needs a Levi's denim jacket size M — matches your listing.", time: "2 hr ago", request: "Levi's denim jacket, size M or L", read: true },
];

function BuyerRequestTab() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiDesc, setAiDesc] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setAnalyzing(true);
    setAiDesc("");
    setTimeout(() => {
      setAiDesc("Vintage oak dresser, mid-century style, 3 drawers, wooden knobs, light natural finish");
      setAnalyzing(false);
    }, 1800);
  };

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <p className="text-xs font-semibold text-[#0B3954] mb-0.5">Upload a photo</p>
        <p className="text-[11px] text-[#0B3954]/50 mb-2">AI will identify the item and auto-fill the description for you.</p>
        <div
          onClick={() => fileRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center p-5 ${photo ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#0B3954]/15 bg-[#FDF5E6] hover:border-[#D4AF37]/50"}`}
          style={{ minHeight: 130 }}
        >
          {photo ? (
            <img src={photo} alt="Uploaded" className="h-20 w-20 object-cover rounded-xl mb-2" />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[#0B3954]/35">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <span className="text-xs font-medium">Tap to upload a photo</span>
              <span className="text-[11px]">AI will identify what you're looking for</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </div>

      {(analyzing || aiDesc) && (
        <div className={`rounded-xl border px-3.5 py-3 flex items-start gap-2.5 ${analyzing ? "border-[#D4AF37]/30 bg-[#D4AF37]/5" : "border-emerald-200 bg-emerald-50"}`}>
          {analyzing ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#0B3954]">Analyzing your photo…</p>
                <p className="text-[11px] text-[#0B3954]/50 mt-0.5">Identifying item, style, and condition</p>
              </div>
            </>
          ) : (
            <>
              <span className="text-emerald-600 text-sm mt-0.5">✓</span>
              <div>
                <p className="text-[11px] font-semibold text-emerald-700">AI identified:</p>
                <p className="text-[11px] text-[#0B3954]/75 mt-0.5 leading-relaxed">{aiDesc}</p>
                <button className="text-[11px] text-[#0B3954] underline mt-1">Edit</button>
              </div>
            </>
          )}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#0B3954] mb-1.5">What do you need? *</label>
        <input
          className="w-full rounded-xl border border-[#0B3954]/15 bg-white px-3.5 py-2.5 text-sm text-[#0B3954] placeholder:text-[#0B3954]/35 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          placeholder="e.g. Vintage oak dresser"
          value={aiDesc}
          readOnly
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#0B3954] mb-1.5">Your ZIP code *</label>
        <input
          className="w-full rounded-xl border border-[#0B3954]/15 bg-white px-3.5 py-2.5 text-sm placeholder:text-[#0B3954]/35 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          placeholder="e.g. 90210"
        />
      </div>

      <div className="rounded-xl bg-[#0B3954]/5 border border-[#0B3954]/8 px-3.5 py-3 flex items-start gap-2">
        <svg className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-[11px] text-[#0B3954]/60 leading-relaxed">
          Matching sellers are <strong className="text-[#0B3954]">notified instantly</strong> — by app and by email — when you post.
        </p>
      </div>

      <button className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold py-3 text-sm hover:bg-[#c9a430] transition-colors">
        Post My Request
      </button>
    </div>
  );
}

function BuyerBrowseTab() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setQuery("Vintage oak dresser, 3 drawers");
    setSearching(true);
    setResults([]);
    setTimeout(() => { setSearching(false); setResults(MOCK_RESULTS); }, 1600);
  };

  const search = () => {
    if (!query.trim() && !photo) return;
    setSearching(true);
    setResults([]);
    setTimeout(() => { setSearching(false); setResults(MOCK_RESULTS); }, 1400);
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#0B3954]/15 shadow-sm">
            <svg className="h-4 w-4 text-[#0B3954]/30 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              className="flex-1 text-sm text-[#0B3954] placeholder:text-[#0B3954]/30 bg-transparent focus:outline-none"
              placeholder="Describe what you need…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
            />
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            title="Search by photo"
            className={`rounded-xl px-3 flex items-center justify-center border transition-colors ${photo ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-white border-[#0B3954]/15 text-[#0B3954]/50 hover:border-[#D4AF37]/50"}`}
          >
            {photo ? (
              <img src={photo} alt="" className="h-6 w-6 object-cover rounded-lg" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            )}
          </button>
          <button onClick={search} className="rounded-xl bg-[#D4AF37] text-[#0B3954] font-bold px-4 text-sm hover:bg-[#c9a430] transition-colors">Go</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        {photo && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#D4AF37] text-xs">✓</span>
            <span className="text-[11px] text-[#0B3954]/60">Searching by photo — exact &amp; similar matches ranked by AI</span>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 space-y-2.5">
        {searching ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="h-7 w-7 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
            <p className="text-xs text-[#0B3954]/50">Finding exact &amp; similar matches…</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-[#0B3954]">{results.length} matches found</p>
              <p className="text-[10px] text-[#0B3954]/40">Sorted by AI match score</p>
            </div>
            {results.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-[#e0e0e0] shadow-sm p-3.5 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#FDF5E6] flex items-center justify-center text-xl shrink-0">{r.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0B3954] text-sm truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">{r.condition} · {r.location}</p>
                  <p className="font-bold text-[#0B3954] text-sm">{r.price}</p>
                </div>
                <div className="text-center shrink-0">
                  <div className={`text-xs font-bold rounded-full px-2 py-0.5 ${r.match >= 90 ? "bg-emerald-100 text-emerald-700" : r.match >= 75 ? "bg-[#D4AF37]/15 text-[#0B3954]" : "bg-[#0B3954]/8 text-[#0B3954]/50"}`}>
                    {r.match}%
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">match</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-[#0B3954]/30">
            <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-xs">Type a description or tap the camera to search by photo</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SellerTab() {
  const [view, setView] = useState<"inapp" | "email">("inapp");
  const [notes, setNotes] = useState(NOTIFICATIONS);
  const unread = notes.filter(n => !n.read).length;

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-[#0B3954]/10 bg-white">
        <button onClick={() => setView("inapp")} className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${view === "inapp" ? "border-[#D4AF37] text-[#0B3954]" : "border-transparent text-[#0B3954]/40"}`}>
          In-app {unread > 0 && <span className="ml-1 bg-[#D4AF37] text-[#0B3954] rounded-full px-1.5 py-0.5 text-[9px] font-bold">{unread}</span>}
        </button>
        <button onClick={() => setView("email")} className={`flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors ${view === "email" ? "border-[#D4AF37] text-[#0B3954]" : "border-transparent text-[#0B3954]/40"}`}>
          Email alert
        </button>
      </div>

      {view === "inapp" && (
        <div className="px-4 py-4 space-y-3">
          {notes.map(n => (
            <div
              key={n.id}
              onClick={() => setNotes(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}
              className={`rounded-xl border p-4 cursor-pointer transition-all ${n.read ? "bg-white border-[#e0e0e0] opacity-60" : "bg-white border-[#D4AF37]/40 shadow-sm"}`}
            >
              <div className="flex items-start gap-3">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${n.type === "exact" ? "bg-emerald-100 text-emerald-700" : "bg-[#D4AF37]/15 text-[#0B3954]"}`}>
                  {n.type === "exact" ? "✓✓" : "~"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${n.type === "exact" ? "text-emerald-700" : "text-[#0B3954]"}`}>{n.title}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-[#0B3954]/35">{n.time}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-[#0B3954]/65 mt-1 leading-relaxed">{n.message}</p>
                  <div className="mt-2 bg-[#FDF5E6] rounded-lg px-2.5 py-1.5">
                    <p className="text-[10px] text-[#0B3954]/40 font-medium">Buyer's request:</p>
                    <p className="text-[10px] text-[#0B3954]/70 italic mt-0.5">"{n.request}"</p>
                  </div>
                  <button className="mt-2 text-xs font-semibold text-[#D4AF37]">Respond →</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "email" && (
        <div className="px-4 py-4">
          <div className="bg-white rounded-2xl border border-[#e0e0e0] shadow-sm overflow-hidden">
            <div className="bg-[#f5f5f5] border-b border-[#e0e0e0] px-4 py-3 space-y-1">
              <div className="flex gap-2 text-[11px] text-[#0B3954]/50"><span className="font-medium w-8">From:</span><span>matches@desperatelyseeking.com</span></div>
              <div className="flex gap-2 text-[11px] text-[#0B3954]/50"><span className="font-medium w-8">To:</span><span>you@email.com</span></div>
              <div className="flex gap-2 text-[11px]"><span className="font-medium w-8 text-[#0B3954]/50">Re:</span><span className="font-bold text-[#0B3954]">🔔 Exact match — someone needs your oak dresser</span></div>
            </div>
            <div className="px-5 py-5 space-y-4">
              <p className="font-serif font-bold text-[#0B3954]">Desperately Seeking</p>
              <div className="h-px bg-[#e0e0e0]" />
              <p className="text-sm font-semibold text-[#0B3954]">Hi Sarah,</p>
              <p className="text-sm text-[#0B3954]/70 leading-relaxed">A buyer <strong className="text-[#0B3954]">1.8 miles from you</strong> is looking for a <strong className="text-[#0B3954]">Vintage Oak Dresser</strong> — an exact match for one of your listings.</p>
              <div className="bg-[#FDF5E6] border border-[#D4AF37]/25 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-[#D4AF37] uppercase tracking-wide mb-1.5">Their request</p>
                <p className="text-sm text-[#0B3954]/80 italic">"Vintage oak dresser, 3 drawers, natural finish — good or fair condition ok"</p>
              </div>
              <p className="text-sm text-[#0B3954]/70 leading-relaxed">Be the first to respond — buyers typically choose the first seller who reaches out.</p>
              <button className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold py-3 text-sm">Respond to this buyer →</button>
              <p className="text-[10px] text-[#0B3954]/35 text-center">You're getting this because you have an active matching listing. <span className="underline cursor-pointer">Unsubscribe</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CombinedFlow() {
  const [tab, setTab] = useState<Tab>("request");
  const [notifCount] = useState(2);

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "request", label: "Post a Request" },
    { id: "browse", label: "Browse" },
    { id: "seller", label: "Seller Alerts", badge: notifCount },
  ];

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col">
      {/* Nav */}
      <div className="bg-[#0B3954] px-4 py-3 flex items-center justify-between shrink-0">
        <span className="font-serif font-bold text-[#D4AF37] text-sm">Desperately Seeking</span>
        <div className="relative">
          <svg className="h-5 w-5 text-white/70" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-[#D4AF37] text-[#0B3954] text-[9px] font-bold flex items-center justify-center">{notifCount}</span>
        </div>
      </div>

      {/* Tab strip */}
      <div className="bg-[#0B3954] px-4 pb-0 shrink-0">
        <div className="flex gap-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === t.id ? "border-[#D4AF37] text-[#D4AF37]" : "border-transparent text-white/45 hover:text-white/70"}`}
            >
              {t.label}
              {t.badge && tab !== t.id && (
                <span className="bg-[#D4AF37] text-[#0B3954] rounded-full px-1.5 text-[9px] font-bold">{t.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "request" && <BuyerRequestTab />}
        {tab === "browse" && <BuyerBrowseTab />}
        {tab === "seller" && <SellerTab />}
      </div>
    </div>
  );
}
