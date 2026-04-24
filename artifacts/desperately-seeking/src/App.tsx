import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import NewRequest from "@/pages/requests/new";
import RequestDetail from "@/pages/requests/[id]";
import Messages from "@/pages/messages/index";
import ThreadDetail from "@/pages/messages/[id]";
import UserProfile from "@/pages/profile/[id]";
import MyRequests from "@/pages/me/requests";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/requests/new" component={NewRequest} />
      <Route path="/requests/:id" component={RequestDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={ThreadDetail} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/profile/:id" component={UserProfile} />
      <Route path="/me/requests" component={MyRequests} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
