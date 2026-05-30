import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import NewRequest from "@/pages/requests/new";
import EditRequest from "@/pages/requests/edit";
import Post from "@/pages/post";
import RequestDetail from "@/pages/requests/[id]";
import Messages from "@/pages/messages/index";
import ThreadDetail from "@/pages/messages/[id]";
import UserProfile from "@/pages/profile/[id]";
import MyRequests from "@/pages/me/requests";
import MyPosts from "@/pages/me/posts";
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
import ListingDetail from "@/pages/listings/[id]";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import HowItWorks from "@/pages/how-it-works";
import HelpCenter from "@/pages/help/index";
import HelpHowItWorks from "@/pages/help/how-it-works";
import HelpSellerRules from "@/pages/help/seller-rules";
import HelpBuyerRules from "@/pages/help/buyer-rules";
import HelpWhyDifferent from "@/pages/help/why-different";
import HelpSafetyTips from "@/pages/help/safety-tips";
import HelpSafetyPayments from "@/pages/help/safety-payments";
import HelpProhibitedItems from "@/pages/help/prohibited-items";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Contact from "@/pages/contact";
import AdminDashboard from "@/pages/admin";
import Welcome from "@/pages/welcome";

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
      <Route path="/requests/:id/edit" component={EditRequest} />
      <Route path="/requests/:id" component={RequestDetail} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={ThreadDetail} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/profile/:id" component={UserProfile} />
      <Route path="/me/posts" component={MyPosts} />
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
      <Route path="/listings/:id" component={ListingDetail} />
      <Route path="/about" component={About} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/help/how-it-works" component={HelpHowItWorks} />
      <Route path="/help/seller-rules" component={HelpSellerRules} />
      <Route path="/help/buyer-rules" component={HelpBuyerRules} />
      <Route path="/help/why-different" component={HelpWhyDifferent} />
      <Route path="/help/safety-tips" component={HelpSafetyTips} />
      <Route path="/help/safety-payments" component={HelpSafetyPayments} />
      <Route path="/help/prohibited-items" component={HelpProhibitedItems} />
      <Route path="/faq" component={FAQ} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/welcome" component={Welcome} />
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
