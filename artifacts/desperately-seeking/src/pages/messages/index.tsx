import { Layout } from "@/components/layout";
import { useListThreads, useGetCurrentUser } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function Messages() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: threads, isLoading } = useListThreads();

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
              {threads?.map((thread) => (
                <Link key={thread.id} href={`/messages/${thread.id}`} className="block hover:bg-muted/50 transition-colors p-4 md:p-6 group">
                  <div className="flex gap-4 items-start">
                    <Avatar className="h-12 w-12 border-2 border-transparent group-hover:border-primary/30 transition-colors">
                      <AvatarImage src={thread.otherUser.avatarUrl} alt={thread.otherUser.name} />
                      <AvatarFallback>{thread.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-base truncate pr-4">
                          {thread.otherUser.name}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1 truncate">
                        Re: {thread.requestTitle}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {thread.lastMessage}
                        </p>
                        {thread.unread > 0 && (
                          <Badge className="rounded-full px-2 py-0.5 h-5 bg-primary shrink-0">
                            {thread.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
