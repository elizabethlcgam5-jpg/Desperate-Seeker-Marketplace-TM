import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CheckCircle, Clock, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

type SellerStep = "photo_prompt" | "photo_preview" | "confirmed";
type BuyerView = "confirm" | "issue";

interface PorchPickupFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "seller" | "buyer";
  buyerName?: string;
  sellerName?: string;
  itemTitle?: string;
}

const ISSUE_OPTIONS = [
  "The item wasn't there when I arrived",
  "The item doesn't match the listing",
  "Someone else may have taken it",
  "Other",
];

export function PorchPickupFlow({ open, onOpenChange, role, buyerName, sellerName, itemTitle }: PorchPickupFlowProps) {
  const [sellerStep, setSellerStep] = useState<SellerStep>("photo_prompt");
  const [buyerView, setBuyerView] = useState<BuyerView>("confirm");
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const handlePhotoAction = () => {
    // Simulate photo taken
    setSellerStep("photo_preview");
    toast.success("Photo captured and timestamped.");
  };

  const handleNotifyBuyer = () => {
    setSellerStep("confirmed");
  };

  const handleBuyerConfirm = () => {
    toast.success("Pickup confirmed! Payment has been released to the seller.");
    onOpenChange(false);
  };

  const handleSubmitIssue = () => {
    if (!selectedIssue) {
      toast.error("Please select an issue type before submitting.");
      return;
    }
    setIssueSubmitted(true);
  };

  if (role === "seller") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
          {sellerStep === "photo_prompt" && (
            <>
              <div className="bg-[#0B3954] px-7 py-6 text-white">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl text-white text-left">
                    Almost ready! Snap a quick photo first. 📸
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/70 text-sm mt-2 leading-relaxed">
                  Before we notify your buyer, take a photo of the item on your porch. This protects you both if there's ever a question about pickup.
                </p>
              </div>
              <div className="p-6 space-y-3">
                {itemTitle && (
                  <p className="text-xs text-muted-foreground text-center">Item: <span className="font-medium text-foreground">{itemTitle}</span></p>
                )}
                <Button
                  className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2"
                  onClick={handlePhotoAction}
                >
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#0B3954]/20 text-[#0B3954] gap-2"
                  onClick={handlePhotoAction}
                >
                  <Upload className="h-4 w-4" />
                  Upload from Camera Roll
                </Button>
                <p className="text-center text-[11px] text-muted-foreground pt-1">Photo is required to proceed.</p>
              </div>
            </>
          )}

          {sellerStep === "photo_preview" && (
            <>
              <div className="bg-[#0B3954] px-7 py-6 text-white">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl text-white text-left">
                    Looks good! Ready to notify your buyer?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/70 text-sm mt-2">
                  This photo will be timestamped and saved to this transaction.
                </p>
              </div>
              <div className="p-6 space-y-3">
                <div className="w-full h-40 bg-muted/40 rounded-xl flex items-center justify-center border-2 border-dashed border-border/50">
                  <div className="text-center text-muted-foreground text-sm">
                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    Photo preview
                  </div>
                </div>
                <Button
                  className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0"
                  onClick={handleNotifyBuyer}
                >
                  Yes, Notify Buyer
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-[#0B3954]/20 text-[#0B3954]"
                  onClick={() => setSellerStep("photo_prompt")}
                >
                  Retake Photo
                </Button>
              </div>
            </>
          )}

          {sellerStep === "confirmed" && (
            <>
              <div className="bg-[#0B3954] px-7 py-6 text-white text-center">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl text-white">
                    Your buyer has been notified! 🎉
                  </DialogTitle>
                </DialogHeader>
                <p className="text-white/70 text-sm mt-2 leading-relaxed">
                  They know your item is ready on the porch. You'll get a notification once they confirm pickup.
                </p>
              </div>
              <div className="p-6 text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-[#D4AF37] mx-auto" />
                <Badge className="bg-[#D4AF37]/15 text-[#6b530f] border border-[#D4AF37]/50 text-xs px-3 py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting Buyer Pickup Confirmation
                </Badge>
                <Button
                  variant="outline"
                  className="rounded-full border-[#0B3954]/20 text-[#0B3954] mt-2"
                  onClick={() => onOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Buyer side
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden">
        {!issueSubmitted && buyerView === "confirm" && (
          <>
            <div className="bg-[#0B3954] px-7 py-6 text-white">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-white text-left">
                  Did you grab your item?
                </DialogTitle>
              </DialogHeader>
              <p className="text-white/70 text-sm mt-2">
                Tap below to confirm pickup. This releases payment to the seller.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {itemTitle && (
                <p className="text-xs text-muted-foreground text-center">
                  Item: <span className="font-medium text-foreground">{itemTitle}</span>
                </p>
              )}
              <Button
                className="w-full rounded-full bg-[#D4AF37] text-[#0B3954] font-bold hover:bg-[#c9a430] border-0 gap-2"
                onClick={handleBuyerConfirm}
              >
                <CheckCircle className="h-4 w-4" />
                Yes, I Got It!
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-full border-destructive/40 text-destructive gap-2"
                onClick={() => setBuyerView("issue")}
              >
                <HelpCircle className="h-4 w-4" />
                I Have an Issue
              </Button>
            </div>
          </>
        )}

        {!issueSubmitted && buyerView === "issue" && (
          <>
            <div className="bg-[#0B3954] px-7 py-6 text-white">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-white text-left">
                  Tell us what happened.
                </DialogTitle>
              </DialogHeader>
              <p className="text-white/70 text-sm mt-2">
                We're here to help. Select the issue and our team will review the transaction.
              </p>
            </div>
            <div className="p-6 space-y-3">
              {ISSUE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedIssue(option)}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                    selectedIssue === option
                      ? "border-[#0B3954] bg-[#0B3954]/5 text-[#0B3954] font-medium"
                      : "border-border/60 text-muted-foreground hover:border-[#0B3954]/30"
                  }`}
                >
                  {option}
                </button>
              ))}
              <Button
                className="w-full rounded-full bg-[#0B3954] text-white hover:bg-[#0B3954]/90 border-0 mt-1"
                onClick={handleSubmitIssue}
              >
                Submit Report
              </Button>
              <button
                className="w-full text-xs text-muted-foreground hover:text-[#0B3954] transition-colors"
                onClick={() => setBuyerView("confirm")}
              >
                Go back
              </button>
            </div>
          </>
        )}

        {issueSubmitted && (
          <>
            <div className="bg-[#0B3954] px-7 py-6 text-white text-center">
              <AlertCircle className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
              <DialogHeader>
                <DialogTitle className="font-serif text-xl text-white">
                  Report submitted
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team will review the photo and transaction details and follow up within 24 hours.
              </p>
              <Button
                variant="outline"
                className="rounded-full border-[#0B3954]/20 text-[#0B3954]"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
