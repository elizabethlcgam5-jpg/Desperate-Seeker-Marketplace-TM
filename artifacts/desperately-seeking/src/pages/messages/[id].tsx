import { Layout } from "@/components/layout";
import { useGetThread, useSendMessage, useGetCurrentUser } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiUrl } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Send, MoreVertical, BellOff, Bell, Trash2, ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EscrowPanel } from "@/components/escrow-panel";

export default function ThreadDetail() {
  const { id } = useParams();
  const { data: currentUser } = useGetCurrentUser();
  const { data: thread, isLoading } = useGetThread(id as string, {
    query: { enabled: !!id },
  });
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [message, setMessage] = useState("");
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [blockedBy, setBlockedBy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant =
    thread?.participants.find((p) => p.id !== currentUser?.id) ||
    thread?.participants[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

  // Sync local mute/block state from the loaded thread.
  useEffect(() => {
    if (!thread) return;
    setMuted(Boolean(thread.muted));
    setBlocked(Boolean(thread.blocked));
    setBlockedBy(Boolean(thread.blockedBy));
  }, [thread?.muted, thread?.blocked, thread?.blockedBy]);

  // Mark the thread read on open and whenever a new message arrives.
  useEffect(() => {
    if (!id || !thread) return;
    fetch(getApiUrl(`threads/${id}/read`), {
      method: "POST",
      credentials: "include",
    })
      .then(() => queryClient.invalidateQueries())
      .catch(() => {});
  }, [id, thread?.messages?.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessage.mutate(
      {
        threadId: id as string,
        data: { body: message },
      },
      {
        onSuccess: () => {
          setMessage("");
          queryClient.invalidateQueries();
        },
        onError: () => {
          toast.error(
            "Message couldn't be sent. You may have blocked or been blocked by this user.",
          );
        },
      }
    );
  };

  const handleMute = async () => {
    const next = !muted;
    setMuted(next);
    try {
      const res = await fetch(getApiUrl(`threads/${id}/mute`), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ muted: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Conversation muted." : "Conversation unmuted.");
      queryClient.invalidateQueries();
    } catch {
      setMuted(!next);
      toast.error("Couldn't update mute setting. Please try again.");
    }
  };

  const handleDeleteChat = async () => {
    setDeleteDialogOpen(false);
    try {
      const res = await fetch(getApiUrl(`threads/${id}`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      toast.success("Chat deleted.");
      queryClient.invalidateQueries();
      navigate("/messages");
    } catch {
      toast.error("Couldn't delete this chat. Please try again.");
    }
  };

  const handleReportConfirm = async () => {
    setReportDialogOpen(false);
    if (!otherParticipant) return;
    try {
      const res = await fetch(
        getApiUrl(`users/${otherParticipant.id}/report`),
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: reportReason.trim() || "No details provided",
            threadId: id,
          }),
        },
      );
      if (!res.ok) throw new Error();
      setReportReason("");
      toast.success("Report received. Our team will review it confidentially.");
    } catch {
      toast.error("Couldn't submit your report. Please try again.");
    }
  };

  const handleBlockConfirm = async () => {
    setBlockDialogOpen(false);
    if (!otherParticipant) return;
    try {
      const res = await fetch(getApiUrl(`users/${otherParticipant.id}/block`), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setBlocked(true);
      toast.success("User blocked. They can no longer message you.");
      queryClient.invalidateQueries();
    } catch {
      toast.error("Couldn't block this user. Please try again.");
    }
  };

  const handleUnblock = async () => {
    if (!otherParticipant) return;
    try {
      const res = await fetch(getApiUrl(`users/${otherParticipant.id}/block`), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setBlocked(false);
      toast.success("User unblocked.");
      queryClient.invalidateQueries();
    } catch {
      toast.error("Couldn't unblock this user. Please try again.");
    }
  };

  if (isLoading || !thread || !currentUser) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-16 w-full mb-4" />
          <div className="flex-1 bg-card border rounded-2xl p-4 flex flex-col">
            <Skeleton className="h-12 w-2/3 mb-4 rounded-xl" />
            <Skeleton className="h-12 w-2/3 ml-auto mb-4 rounded-xl" />
            <Skeleton className="h-12 w-1/2 mb-4 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col container max-w-4xl mx-auto px-0 md:px-4 py-0 md:py-6 h-[calc(100vh-4rem)] md:h-auto">
        <div className="bg-card border-x border-t md:border md:rounded-t-2xl flex flex-col flex-1 overflow-hidden shadow-sm h-full">

          {/* Header */}
          <div className="p-4 border-b bg-muted/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="md:hidden mr-1">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant?.avatarUrl} alt={otherParticipant?.name} />
                  <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {otherParticipant?.online && (
                  <span
                    className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-card"
                    aria-label="Online"
                    title="Online"
                  />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-base">{otherParticipant?.name}</h2>
                  {muted && (
                    <BellOff
                      className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                      aria-label="Conversation muted"
                    />
                  )}
                </div>
                {otherParticipant?.online ? (
                  <span className="text-xs text-green-600 font-medium">Online</span>
                ) : (
                  <Link href={`/requests/${thread.request.id}`} className="text-xs text-primary hover:underline line-clamp-1">
                    Re: {thread.request.title}
                  </Link>
                )}
              </div>
            </div>

            {/* Safety options menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">Chat options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Conversation controls */}
                <DropdownMenuItem onClick={handleMute} className="gap-2 cursor-pointer">
                  {muted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                  {muted ? "Unmute conversation" : "Mute conversation"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="gap-2 cursor-pointer text-muted-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete chat
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Safety options */}
                <DropdownMenuItem
                  onClick={() => setReportDialogOpen(true)}
                  className="gap-2 cursor-pointer text-amber-700 focus:text-amber-700"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Report user
                </DropdownMenuItem>
                {blocked ? (
                  <DropdownMenuItem
                    onClick={handleUnblock}
                    className="gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Unblock user
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => setBlockDialogOpen(true)}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <ShieldOff className="h-4 w-4" />
                    Block user
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-background/50">
            {thread.messages.map((msg, index) => {
              const isMe = msg.sender.id === currentUser.id;
              const showHeader = index === 0 || thread.messages[index - 1].sender.id !== msg.sender.id;

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showHeader && !isMe && (
                    <span className="text-xs text-muted-foreground ml-12 mb-1">
                      {msg.sender.name} &middot; {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                  )}
                  {showHeader && isMe && (
                    <span className="text-xs text-muted-foreground mr-2 mb-1">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                  )}

                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!isMe && showHeader ? (
                      <Avatar className="h-8 w-8 shrink-0 mb-1">
                        <AvatarImage src={msg.sender.avatarUrl} />
                        <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      !isMe && <div className="w-8 shrink-0" />
                    )}

                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm border'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Escrow payment panel */}
          {currentUser && (
            <EscrowPanel
              role={
                currentUser.subscriptionTier && currentUser.subscriptionTier !== "free"
                  ? "seller"
                  : "buyer"
              }
              price={0}
              sellerName={
                currentUser.subscriptionTier && currentUser.subscriptionTier !== "free"
                  ? undefined
                  : otherParticipant?.name
              }
              buyerName={
                currentUser.subscriptionTier && currentUser.subscriptionTier !== "free"
                  ? otherParticipant?.name
                  : undefined
              }
            />
          )}

          {/* Input */}
          <div className="p-4 bg-card border-t shrink-0">
            {blocked ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                <span>You've blocked this user. Unblock to send messages.</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full shrink-0"
                  onClick={handleUnblock}
                >
                  Unblock
                </Button>
              </div>
            ) : blockedBy ? (
              <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-center text-muted-foreground">
                You can no longer message this user.
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
                  disabled={sendMessage.isPending}
                />
                <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={sendMessage.isPending || !message.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Report User dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {otherParticipant?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Something feel off? Tell us what happened and we'll review this
              report confidentially.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe the issue (optional)…"
            className="min-h-24 resize-none"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Never Mind</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportConfirm}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {otherParticipant?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to message you, and you won't be able to message
              them until you unblock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete chat dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the conversation from your inbox. The other person
              keeps their copy, and a new message will bring it back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChat}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
