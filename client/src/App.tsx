import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NavigationProvider } from "@/hooks/useNavigationStore";
import Dashboard from "@/pages/Dashboard";
import InfluencerDiscovery from "@/pages/InfluencerDiscovery";
import Campaigns from "@/pages/Campaigns";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/influencers" component={InfluencerDiscovery} />
      <Route path="/campaigns" component={Campaigns} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NavigationProvider>
          <Toaster />
          <Router />
        </NavigationProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
