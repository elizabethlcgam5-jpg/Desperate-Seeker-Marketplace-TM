import { Layout } from "@/components/layout";
import { useListRequests, useGetCurrentUser } from "@workspace/api-client-react";
import { RequestCard } from "@/components/request-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyRequests() {
  const { data: currentUser } = useGetCurrentUser();
  const { data: requests, isLoading } = useListRequests(
    { buyerId: currentUser?.id },
    { query: { enabled: !!currentUser?.id } }
  );

  const openRequests = requests?.filter(r => r.status === 'open') || [];
  const pastRequests = requests?.filter(r => r.status !== 'open') || [];

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-secondary/10 rounded-2xl">
            <ClipboardList className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">Manage everything you're looking for</p>
          </div>
        </div>

        <Tabs defaultValue="open" className="w-full">
          <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="open">Open ({openRequests.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastRequests.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="open" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            ) : openRequests.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                <p className="text-lg font-medium mb-2">No open requests</p>
                <p className="text-muted-foreground">You aren't looking for anything right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {openRequests.map(req => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Skeleton className="h-[200px] w-full rounded-xl" />
              </div>
            ) : pastRequests.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No past requests.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {pastRequests.map(req => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
