import { Layout } from "@/components/layout";
import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useListRequests, 
  useGetOverviewStats, 
  useGetRecentActivity,
  useGetTrendingRequests,
  useListCategories,
  ActivityEvent
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { PenSquare, TrendingUp, Activity, Hash, Target } from "lucide-react";

function ActivityItem({ event }: { event: ActivityEvent }) {
  const getActionText = (kind: string) => {
    switch(kind) {
      case 'request_created': return 'posted a new request';
      case 'response_created': return 'made an offer';
      case 'response_accepted': return 'accepted an offer';
      case 'request_fulfilled': return 'found what they were looking for';
      default: return 'did something';
    }
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
      <img src={event.actor.avatarUrl} alt="" className="w-8 h-8 rounded-full bg-muted object-cover shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-sm leading-snug">
          <span className="font-medium text-foreground">{event.actor.name}</span>{" "}
          <span className="text-muted-foreground">{getActionText(event.kind)}</span>
        </p>
        <p className="text-xs text-muted-foreground/80">
          {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: requests, isLoading: requestsLoading } = useListRequests({ status: 'open', sort: 'newest' });
  const { data: stats } = useGetOverviewStats();
  const { data: activity } = useGetRecentActivity();
  const { data: trending } = useGetTrendingRequests();
  const { data: categories } = useListCategories();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 py-16 md:py-24 border-b">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center space-y-6">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 mb-4 py-1.5 px-4">
            <Target className="w-4 h-4 mr-2" />
            The Buyer-First Marketplace
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground tracking-tight text-balance">
            Don't search. <span className="text-primary italic">Just ask.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop scrolling through endless listings. Describe exactly what you're looking for, 
            and let sellers come to you with photos, prices, and details.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/requests/new">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 rounded-full shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
                <PenSquare className="mr-2 h-5 w-5" />
                Post a Request
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 rounded-full bg-background">
              Browse Open Requests
            </Button>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold font-serif text-primary">{stats.openRequests}</span>
                <span className="text-sm text-muted-foreground mt-1">Open Requests</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold font-serif text-foreground">{stats.totalResponses}</span>
                <span className="text-sm text-muted-foreground mt-1">Offers Made</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold font-serif text-secondary">{stats.fulfilledThisWeek}</span>
                <span className="text-sm text-muted-foreground mt-1">Matches This Week</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold font-serif text-foreground">{stats.activeSellers}</span>
                <span className="text-sm text-muted-foreground mt-1">Active Sellers</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Latest Requests
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {requestsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  </div>
                ))
              ) : requests?.length === 0 ? (
                <div className="col-span-2 py-12 text-center bg-muted/30 rounded-xl border border-dashed">
                  <p className="text-lg font-medium text-foreground mb-2">No requests right now</p>
                  <p className="text-muted-foreground mb-6">Be the first to ask for something!</p>
                  <Link href="/requests/new">
                    <Button>Post a Request</Button>
                  </Link>
                </div>
              ) : (
                requests?.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            {/* Trending */}
            {trending && trending.length > 0 && (
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Trending Requests
                </h3>
                <div className="space-y-4">
                  {trending.map(req => (
                    <Link key={req.id} href={`/requests/${req.id}`} className="block group">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {req.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.responseCount} offers &middot; {req.budgetMax ? `Up to $${req.budgetMax}` : 'Open budget'}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories && categories.length > 0 && (
              <div className="bg-card rounded-xl p-6 border shadow-sm">
                <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-secondary" />
                  Popular Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <Badge key={cat.category} variant="secondary" className="font-normal bg-muted hover:bg-muted/80 text-foreground cursor-pointer">
                      {cat.category} <span className="ml-1.5 opacity-50">{cat.count}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {activity && activity.length > 0 && (
              <div>
                <h3 className="text-lg font-bold font-serif mb-4">Neighborhood Activity</h3>
                <div className="bg-card rounded-xl p-4 border shadow-sm">
                  {activity.map(event => (
                    <ActivityItem key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}
import { Badge } from "@/components/ui/badge";
