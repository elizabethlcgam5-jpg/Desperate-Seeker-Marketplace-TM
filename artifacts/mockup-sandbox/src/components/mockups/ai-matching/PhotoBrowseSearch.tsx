import { useState, useRef } from "react";

const MOCK_RESULTS = [
  { id: 1, title: "Vintage Oak Dresser", price: "$120", location: "2.1 mi", match: 98, image: "🪵", condition: "Good" },
  { id: 2, title: "Mid-Century Sideboard", price: "$85", location: "3.4 mi", match: 84, image: "🪑", condition: "Fair" },
  { id: 3, title: "Wooden Chest of Drawers", price: "$65", location: "5.0 mi", match: 71, image: "📦", condition: "Good" },
];

export function PhotoBrowseSearch() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setQuery("Vintage oak dresser, 3 drawers");
    triggerSearch();
  };

  const triggerSearch = () => {
    setSearching(true);
    setResults([]);
    setTimeout(() => {
      setSearching(false);
      setResults(MOCK_RESULTS);
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col">
      {/* Nav */}
      <div className="bg-[#0B3954] px-4 py-3 flex items-center gap-2">
        <span className="text-[#D4AF37] font-serif font-bold text-sm">Desperately Seeking</span>
        <span className="ml-auto text-white/50 text-xs">Browse</span>
      </div>

      {/* Search bar */}
      <div className="bg-[#0B3954] px-4 pb-5">
        <p className="text-white/70 text-xs mb-3">Search by text or upload a photo to find exact & similar matches.</p>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 border border-[#D4AF37]/30">
            <svg className="h-4 w-4 text-[#0B3954]/40 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              className="flex-1 text-sm text-[#0B3954] placeholder:text-[#0B3954]/35 bg-transparent focus:outline-none"
              placeholder="Describe what you need…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileRef.current?.click()}
            className={`rounded-xl px-3 flex items-center justify-center transition-colors ${photo ? "bg-[#D4AF37] text-[#0B3954]" : "bg-white/10 text-white hover:bg-white/20"}`}
          >
            {photo ? (
              <img src={photo} alt="" className="h-7 w-7 object-cover rounded-lg" />
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <button
            onClick={triggerSearch}
            className="rounded-xl bg-[#D4AF37] text-[#0B3954] font-bold px-4 text-sm hover:bg-[#c9a430] transition-colors"
          >
            Search
          </button>
        </div>
        {photo && (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-[#D4AF37] text-xs">✓</span>
            <span className="text-white/60 text-xs">Searching by photo — showing exact &amp; similar matches</span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4 space-y-3">
        {searching ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
            <p className="text-sm text-[#0B3954]/60">AI is finding matches…</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-[#0B3954]">{results.length} matches found</p>
              <p className="text-xs text-[#0B3954]/50">Sorted by match %</p>
            </div>
            {results.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-[#e0e0e0] shadow-sm p-4 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-[#FDF5E6] flex items-center justify-center text-2xl shrink-0">
                  {r.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0B3954] text-sm truncate">{r.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.condition} · {r.location}</p>
                  <p className="font-bold text-[#0B3954] text-sm mt-1">{r.price}</p>
                </div>
                <div className="shrink-0 text-center">
                  <div className={`text-sm font-bold rounded-full px-2 py-0.5 ${r.match >= 90 ? "bg-emerald-100 text-emerald-700" : r.match >= 75 ? "bg-[#D4AF37]/15 text-[#0B3954]" : "bg-[#0B3954]/8 text-[#0B3954]/60"}`}>
                    {r.match}%
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">match</p>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-3 text-[#0B3954]/40">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-sm">Search by text or upload a photo above</p>
          </div>
        )}
      </div>
    </div>
  );
}
