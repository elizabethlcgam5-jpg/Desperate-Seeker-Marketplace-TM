import { Layout } from "@/components/layout";
import { useGetThread, useSendMessage, useGetCurrentUser } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ThreadDetail() {
  const { id } = useParams();
  const { data: currentUser } = useGetCurrentUser();
  const { data: thread, isLoading } = useGetThread(id as string, {
    query: { enabled: !!id },
  });
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [thread?.messages]);

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
      }
    );
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

  const otherParticipant = thread.participants.find(p => p.id !== currentUser.id) || thread.participants[0];

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
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherParticipant.avatarUrl} alt={otherParticipant.name} />
                <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-base">{otherParticipant.name}</h2>
                <Link href={`/requests/${thread.request.id}`} className="text-xs text-primary hover:underline line-clamp-1">
                  Re: {thread.request.title}
                </Link>
              </div>
            </div>
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

          {/* Input */}
          <div className="p-4 bg-card border-t shrink-0">
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
          </div>

        </div>
      </div>
    </Layout>
  );
}
