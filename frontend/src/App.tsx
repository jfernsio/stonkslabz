import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Markets from "./pages/Markets";
import Trade from "./pages/Trade";
import Watchlist from "./pages/Watchlist";
import IPOCalendar from "./pages/IPOCalendar";
import InsiderActivity from "./pages/InsiderActivity";
import AIInsights from "./pages/AIInsights";
import News from "./pages/News";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* App routes with layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/ipo" element={<IPOCalendar />} />
            <Route path="/insider" element={<InsiderActivity />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/news" element={<News />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
