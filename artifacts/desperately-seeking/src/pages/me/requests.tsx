import { Layout } from "@/components/layout";
import { useListRequests, useGetCurrentUser } from "@workspace/api-client-react";
import { RequestCard } from "@/components/request-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/lib/api";
import { toast } from "sonner";

export default function MyRequests() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: requests, isLoading } = useListRequests(
    { buyerId: currentUser?.id },
    { query: { enabled: !!currentUser?.id } }
  );

  const [instantMatch, setInstantMatch] = useState<boolean | null>(null);
  const [instantMatchLoading, setInstantMatchLoading] = useState(false);

  useEffect(() => {
    if (currentUser) setInstantMatch((currentUser as any).instantMatch ?? false);
  }, [currentUser]);

  const handleInstantMatchToggle = async () => {
    if (instantMatchLoading) return;
    const next = !instantMatch;
    setInstantMatch(next);
    setInstantMatchLoading(true);
    try {
      const res = await fetch(getApiUrl("me/instant-match"), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = await res.json();
      setInstantMatch(data.instantMatch);
      toast.success(data.instantMatch ? "InstantMatch turned on." : "InstantMatch turned off.");
    } catch {
      setInstantMatch(!next);
      toast.error("Couldn't update InstantMatch. Please try again.");
    } finally {
      setInstantMatchLoading(false);
    }
  };

  const openRequests = requests?.filter(r => r.status === 'open') || [];
  const pastRequests = requests?.filter(r => r.status !== 'open') || [];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-secondary/10 rounded-2xl">
            <ClipboardList className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">Manage everything you're looking for</p>
          </div>
        </div>

        {/* InstantMatch toggle for buyers */}
        {instantMatch !== null && (
          <div
            className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 mb-8 transition-colors ${
              instantMatch
                ? "border-[#0B3954]/20 bg-[#0B3954]/5"
                : "border-border bg-white"
            }`}
          >
            <div
              className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                instantMatch ? "bg-[#0B3954]/10" : "bg-muted"
              }`}
            >
              <Zap className={`h-5 w-5 ${instantMatch ? "text-[#0B3954]" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-serif font-semibold text-[#0B3954]">InstantMatch</p>
                {instantMatch && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#0B3954]/10 text-[#0B3954] border border-[#0B3954]/15 font-medium">
                    <Zap className="h-3 w-3" /> On
                  </span>
                )}
              </div>
              <p className="text-sm text-[#0B3954]/60 leading-relaxed">
                {instantMatch
                  ? "You'll be notified the moment a seller lists something that matches your open requests."
                  : "Turn on to get instant alerts when a seller posts something that matches what you're looking for."}
              </p>
            </div>
            <button
              onClick={handleInstantMatchToggle}
              disabled={instantMatchLoading}
              className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors focus:outline-none disabled:opacity-60 cursor-pointer ${
                instantMatch
                  ? "bg-[#0B3954] border-[#0B3954]"
                  : "bg-muted border-border"
              }`}
              aria-label="Toggle InstantMatch"
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  instantMatch ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="open">Open ({openRequests.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastRequests.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="open" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            ) : openRequests.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                <p className="text-lg font-medium mb-2">No open requests</p>
                <p className="text-muted-foreground">You aren't looking for anything right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {openRequests.map(req => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            ) : pastRequests.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No past requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pastRequests.map(req => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
