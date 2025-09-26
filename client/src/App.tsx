import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Admin from '@/pages/admin';
import NotFound from "@/pages/not-found";
import Profile from "@/pages/profile";
import Claims from "@/pages/claims";
import StationDashboard from "@/pages/station-dashboard";
import { Loader2 } from "lucide-react";
import { Navigate } from "wouter/matcher";

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/station/:stationId" component={StationDashboard} />
      <Route path="/claims" element={<Claims />} />
      <Route path="*" element={<NotFound />} />
    </Switch>
  );
}

function Router() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="fabrika-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;