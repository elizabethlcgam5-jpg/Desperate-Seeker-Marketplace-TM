import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

interface StartSellingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHECKLIST = [
  "Free to list your first item",
  "Built-in chat with buyers",
  "Secure in-app payments",
  "Upgrade anytime for unlimited listings",
];

export function StartSellingModal({ open, onOpenChange }: StartSellingModalProps) {
  const [_, setLocation] = useLocation();

  const handleCreateListing = () => {
    onOpenChange(false);
    setLocation("/listings/new");
  };

  const handleSeePlans = () => {
    onOpenChange(false);
    setLocation("/pricing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="bg-[#0B3954] px-7 py-7 text-white">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-white text-left leading-snug mb-1">
              Start Selling — It's Free! 🎉
            </DialogTitle>
            <DialogDescription className="text-white/70 text-left text-sm">
              List your first item at no cost.
            </DialogDescription>
          </DialogHeader>
          <p className="text-white/55 text-xs mt-3 leading-relaxed">
            No subscription needed to get started. Create your listing, connect with buyers, and make your first sale — all for free. When you're ready to level up, our plans start at just $1.99/month.
          </p>
        </div>

        {/* Checklist */}
        <div className="px-7 py-5 bg-[#FDF5E6]">
          <ul className="space-y-2.5">
            {CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[#0B3954]/80">
                <CheckCircle className="h-4 w-4 text-[#D4AF37] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="px-7 pb-7 pt-4 space-y-2.5">
          <Button
            className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 h-11"
            onClick={handleCreateListing}
          >
            Create My First Listing
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full border-[#0B3954]/20 text-[#0B3954] h-11"
            onClick={handleSeePlans}
          >
            See Subscription Plans
          </Button>
          <div className="text-center pt-1">
            <button
              className="text-xs text-muted-foreground hover:text-[#0B3954] transition-colors underline underline-offset-2"
              onClick={() => onOpenChange(false)}
            >
              Not Right Now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
