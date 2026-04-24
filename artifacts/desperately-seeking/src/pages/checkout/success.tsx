import { useEffect, useState } from "react";
import { useSearch, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function CheckoutSuccess() {
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session_id");
  const qc = useQueryClient();
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setSynced(true);
      return;
    }

    // Tell the API to sync the subscription from Stripe to our users table
    fetch(`/api/stripe/success?session_id=${encodeURIComponent(sessionId)}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then(() => {
        qc.invalidateQueries(); // Refresh current user + any cached queries
        setSynced(true);
      })
      .catch((err) => {
        console.error("Sync error:", err);
        setSynced(true); // Still show success — webhook will eventually sync
      });
  }, [sessionId]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center px-6">
          {!synced ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#D4AF37]" />
              <p className="text-[#0B3954] font-medium">Confirming your subscription…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <div>
                <h1 className="font-serif text-3xl font-bold text-[#0B3954] mb-2">
                  You're all set!
                </h1>
                <p className="text-muted-foreground">
                  Your seller subscription is now active. You can start responding
                  to buyer requests and listing your inventory right away.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button
                  asChild
                  className="flex-1 rounded-full bg-[#0B3954] text-white hover:bg-[#0B3954]/90"
                >
                  <Link href="/me/dashboard">Go to Dashboard</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 rounded-full border-[#0B3954]/20 text-[#0B3954]"
                >
                  <Link href="/">Browse Requests</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
