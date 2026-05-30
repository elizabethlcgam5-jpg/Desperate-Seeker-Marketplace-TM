import { Layout } from "@/components/layout";
import { useListThreads, useGetCurrentUser } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Inbox, BellOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Messages() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: threads, isLoading } = useListThreads({
    query: { refetchInterval: 15_000 },
  });
  const totalUnread = (threads ?? []).reduce(
    (sum, t) => sum + (t.unread ?? 0),
    0,
  );

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Inbox</h1>
            <p className="text-muted-foreground">Your active conversations</p>
          </div>
        </div>

        {totalUnread > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            You have {totalUnread} new message{totalUnread > 1 ? "s" : ""}.
          </div>
        )}

        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex-1">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : threads?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8">
              <Inbox className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm">
                When you accept an offer or someone accepts yours, you can chat with them here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {threads?.map((thread) => {
                const isUnread = thread.unread > 0;
                return (
                <Link key={thread.id} href={`/messages/${thread.id}`} className={`block transition-colors p-4 md:p-6 group ${isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/50"}`}>
                  <div className="flex gap-4 items-start">
                    {/* Unread dot */}
                    <div className="pt-5 shrink-0">
                      <span className={`block h-2.5 w-2.5 rounded-full ${isUnread ? "bg-primary" : "bg-transparent"}`} />
                    </div>
                    <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary/30 transition-colors">
                      <AvatarImage src={thread.otherUser.avatarUrl} alt={thread.otherUser.name} />
                      <AvatarFallback>{thread.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`text-base truncate pr-4 flex items-center gap-1.5 ${isUnread ? "font-bold" : "font-semibold"}`}>
                          {thread.otherUser.name}
                          {thread.muted && (
                            <BellOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1 truncate">
                        Re: {thread.requestTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate flex-1 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {thread.lastMessage}
                        </p>
                        {isUnread && (
                          <Badge className="rounded-full px-2 py-0.5 h-5 bg-primary shrink-0">
                            {thread.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
