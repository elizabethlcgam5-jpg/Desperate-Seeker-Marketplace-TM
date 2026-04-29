import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import NewRequest from "@/pages/requests/new";
import Post from "@/pages/post";
import RequestDetail from "@/pages/requests/[id]";
import Messages from "@/pages/messages/index";
import ThreadDetail from "@/pages/messages/[id]";
import UserProfile from "@/pages/profile/[id]";
import MyRequests from "@/pages/me/requests";
import Analytics from "@/pages/me/analytics";
import Inventory from "@/pages/me/inventory";
import SellerDashboard from "@/pages/me/dashboard";
import MyListingsPage from "@/pages/me/listings";
import BuyerRequests from "@/pages/buyer-requests";
import Pricing from "@/pages/pricing";
import CheckoutSuccess from "@/pages/checkout/success";
import Browse from "@/pages/browse";
import Login from "@/pages/login";
import Seller from "@/pages/seller";
import NewListing from "@/pages/listings/new";

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
      <Route path="/browse" component={Browse} />
      <Route path="/requests/new" component={NewRequest} />
      <Route path="/requests/:id" component={RequestDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={ThreadDetail} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/profile/:id" component={UserProfile} />
      <Route path="/me/requests" component={MyRequests} />
      <Route path="/me/analytics" component={Analytics} />
      <Route path="/me/inventory" component={Inventory} />
      <Route path="/me/dashboard" component={SellerDashboard} />
      <Route path="/me/listings" component={MyListingsPage} />
      <Route path="/buyer-requests" component={BuyerRequests} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/post" component={Post} />
      <Route path="/login" component={Login} />
      <Route path="/seller" component={Seller} />
      <Route path="/listings/new" component={NewListing} />
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
