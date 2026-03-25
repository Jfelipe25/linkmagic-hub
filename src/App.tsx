import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";

const PixelPageView = () => {
  const location = useLocation();
  useEffect(() => {
    (window as any).fbq?.('track', 'PageView');
  }, [location.pathname]);
  return null;
};
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import PublicProfile from "./pages/PublicProfile";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailed from "./pages/PaymentFailed";
import VirtualCardPage from "./pages/VirtualCardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
      <LanguageProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PixelPageView />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/u/:slug" element={<PublicProfile />} />
            <Route path="/card/:slug" element={<VirtualCardPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pago/exitoso" element={<PaymentSuccess />} />
            <Route path="/pago/pendiente" element={<PaymentPending />} />
            <Route path="/pago/fallido" element={<PaymentFailed />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
