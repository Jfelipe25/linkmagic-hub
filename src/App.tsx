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
import { lazy, Suspense } from "react";

// Lazy load — cada ruta carga solo su chunk
const Index = lazy(() => import("./pages/Index"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const PaymentFailed = lazy(() => import("./pages/PaymentFailed"));
const VirtualCardPage = lazy(() => import("./pages/VirtualCardPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Terminos = lazy(() => import("./pages/Terminos"));
const Privacidad = lazy(() => import("./pages/Privacidad"));

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
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
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
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
