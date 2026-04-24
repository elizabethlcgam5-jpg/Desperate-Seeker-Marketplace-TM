import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCurrentUser, useSubmitSellerFeedback } from "@workspace/api-client-react";
import { Star } from "lucide-react";
import { toast } from "sonner";

export function FeedbackWidget() {
  const { data: user } = useGetCurrentUser();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const submit = useSubmitSellerFeedback();

  const isSeller = user && user.subscriptionTier && user.subscriptionTier !== "free";
  if (!isSeller) return null;

  const handleSubmit = () => {
    if (rating === 0) return;
    submit.mutate(
      { data: { rating, comment } },
      {
        onSuccess: () => {
          setDone(true);
          setTimeout(() => {
            setOpen(false);
            setDone(false);
            setRating(0);
            setComment("");
          }, 2000);
        },
        onError: () => toast.error("Couldn't submit feedback. Try again."),
      },
    );
  };

  return (
    <>
      {/* Floating gold button */}
      <button
        onClick={() => setOpen(true)}
        title="Share feedback"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37] text-[#0B3954] shadow-xl hover:bg-[#c9a430] transition-all hover:scale-105 active:scale-95"
        aria-label="Give feedback"
      >
        <Star className="h-6 w-6 fill-[#0B3954]/30" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#0B3954]">
              Help us build the perfect marketplace
            </DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4AF37]/15">
                <Star className="h-7 w-7 text-[#D4AF37] fill-[#D4AF37]" />
              </div>
              <p className="font-serif text-lg font-semibold text-[#0B3954]">Thank you for your feedback!</p>
              <p className="mt-1 text-sm text-muted-foreground">Your input shapes what we build next.</p>
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              <div>
                <p className="mb-2 text-sm font-medium text-[#0B3954]">How would you rate your experience?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(n)}
                      className="rounded-md p-1 transition-transform hover:scale-110"
                      aria-label={`${n} star${n !== 1 ? "s" : ""}`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          n <= (hovered || rating)
                            ? "fill-[#D4AF37] text-[#D4AF37]"
                            : "fill-none text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-[#0B3954]">What can we improve?</p>
                <Textarea
                  placeholder="Tell us what you love and what we should fix..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none rounded-xl border-[#0B3954]/20 min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || submit.isPending}
                className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
              >
                {submit.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
