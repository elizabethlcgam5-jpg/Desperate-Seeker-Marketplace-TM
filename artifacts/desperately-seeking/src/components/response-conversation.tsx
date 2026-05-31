import { useState } from "react";
import { useGetThread, useSendMessage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, Send } from "lucide-react";

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function isVerified(tier: string | null | undefined): boolean {
  return tier != null && tier !== "free";
}

export function ResponseConversation({
  threadId,
  buyerId,
  currentUserId,
}: {
  threadId: string;
  buyerId: string;
  currentUserId: string;
}) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const { data: thread, isLoading } = useGetThread(threadId, {
    query: { enabled: !!threadId },
  });
  const sendMessage = useSendMessage();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = message.trim();
    if (!body) return;
    sendMessage.mutate(
      { threadId, data: { body } },
      {
        onSuccess: () => {
          setMessage("");
          queryClient.invalidateQueries();
        },
        onError: () => {
          toast.error("Couldn't send your message. Please try again.");
        },
      },
    );
  };

  const messages = thread?.messages ?? [];

  return (
    <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        Conversation
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading conversation…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No messages yet. Start the conversation below.
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const isMe = m.sender.id === currentUserId;
            const isBuyerMsg = m.sender.id === buyerId;
            let label: React.ReactNode;
            if (isMe) {
              label = `You (${firstName(m.sender.name)})`;
            } else if (isBuyerMsg) {
              label = `Buyer: ${m.sender.name}`;
            } else {
              label = (
                <span className="inline-flex items-center gap-1">
                  Seller: {m.sender.name}
                  {isVerified(m.sender.subscriptionTier) && (
                    <span className="inline-flex items-center gap-0.5 text-primary">
                      <CheckCircle className="h-3 w-3" />
                      (Verified)
                    </span>
                  )}
                </span>
              );
            }
            return (
              <div
                key={m.id}
                className={`flex gap-2 ${isMe ? "flex-row-reverse text-right" : ""}`}
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={m.sender.avatarUrl} alt={m.sender.name} />
                  <AvatarFallback>{m.sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[80%] ${isMe ? "items-end" : ""}`}>
                  <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
                    {label}
                  </p>
                  <div
                    className={`inline-block rounded-2xl px-3 py-2 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a reply…"
          className="bg-background"
        />
        <Button
          type="submit"
          size="icon"
          disabled={sendMessage.isPending || !message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
