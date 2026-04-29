import { useState, useRef } from "react";

export function PhotoRequestForm() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    setAnalyzing(true);
    setAiDescription("");
    setTimeout(() => {
      setAiDescription("Vintage oak dresser, mid-century style, 3 drawers, wooden knobs, light natural finish");
      setAnalyzing(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#FDF5E6] flex flex-col">
      {/* Header */}
      <div className="bg-[#0B3954] px-5 py-4">
        <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-1">Post a Request</p>
        <h1 className="font-serif text-xl font-bold text-white">What are you looking for?</h1>
        <p className="text-white/60 text-xs mt-0.5">Upload a photo and AI will describe it — or type it yourself.</p>
      </div>

      <div className="flex-1 px-5 py-6 space-y-5">

        {/* Photo upload zone */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center p-6 ${
            photo ? "border-[#D4AF37] bg-[#D4AF37]/5" : "border-[#0B3954]/20 bg-white hover:border-[#D4AF37]/50"
          }`}
          style={{ minHeight: 160 }}
        >
          {photo ? (
            <img src={photo} alt="Uploaded" className="h-28 w-28 object-cover rounded-xl mb-3" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#0B3954]/40">
              <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-sm font-medium text-[#0B3954]/60">Tap to upload a photo</span>
              <span className="text-xs text-[#0B3954]/40">AI will identify what you're looking for</span>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* AI description result */}
        {(analyzing || aiDescription) && (
          <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 transition-all ${analyzing ? "border-[#D4AF37]/30 bg-[#D4AF37]/5" : "border-emerald-200 bg-emerald-50"}`}>
            {analyzing ? (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#0B3954]">AI is analyzing your photo…</p>
                  <p className="text-xs text-[#0B3954]/50 mt-0.5">Identifying item, style, and condition</p>
                </div>
              </>
            ) : (
              <>
                <span className="text-emerald-600 text-base mt-0.5">✓</span>
                <div>
                  <p className="text-xs font-semibold text-emerald-700">AI identified:</p>
                  <p className="text-xs text-[#0B3954]/75 mt-0.5 leading-relaxed">{aiDescription}</p>
                  <button className="text-xs text-[#0B3954] underline mt-1">Edit description</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#0B3954] mb-1.5">What do you need? *</label>
          <input
            className="w-full rounded-xl border border-[#0B3954]/15 bg-white px-3.5 py-2.5 text-sm text-[#0B3954] placeholder:text-[#0B3954]/35 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            placeholder={aiDescription || "e.g. Vintage oak dresser"}
            defaultValue={aiDescription}
          />
        </div>

        {/* ZIP */}
        <div>
          <label className="block text-xs font-semibold text-[#0B3954] mb-1.5">Your ZIP code *</label>
          <input
            className="w-full rounded-xl border border-[#0B3954]/15 bg-white px-3.5 py-2.5 text-sm text-[#0B3954] placeholder:text-[#0B3954]/35 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            placeholder="e.g. 90210"
          />
        </div>

        {/* Match info */}
        <div className="rounded-xl bg-[#0B3954]/5 border border-[#0B3954]/10 px-4 py-3 flex items-start gap-2.5">
          <svg className="h-4 w-4 text-[#D4AF37] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <p className="text-xs text-[#0B3954]/65 leading-relaxed">
            Sellers with matching items will be <strong className="text-[#0B3954]">notified instantly</strong> when you post. Exact and similar matches both get alerted.
          </p>
        </div>

        <button className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold py-3 text-sm hover:bg-[#c9a430] transition-colors">
          Post My Request
        </button>
      </div>
    </div>
  );
}
