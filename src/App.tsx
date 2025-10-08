
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProfileSelector from "@/components/ProfileSelector";
import AdminProtectedPage from "@/components/AdminProtectedPage";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Movies from "./pages/Movies";
import Series from "./pages/Series";
import WatchLater from "./pages/WatchLater";
import Watch from "./pages/Watch";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import ChangeEmail from "./pages/ChangeEmail";
import ForgotEmail from "./pages/ForgotEmail";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Discord from "./pages/Discord";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, selectedProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600/30 border-t-red-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-red-400 animate-pulse"></div>
          </div>
          <div className="text-white text-2xl font-semibold">جارٍ التحميل...</div>
          <div className="text-gray-400">يرجى الانتظار</div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing page - accessible to everyone */}
      <Route path="/home" element={<Home />} />
      
      {/* Password reset and forgot email routes - accessible without authentication */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-email" element={<ForgotEmail />} />
      
      {/* Main page - accessible to everyone */}
      <Route path="/" element={<Index />} />
      
      {/* Login page */}
      <Route path="/login" element={<Login />} />
      
      {/* Discord redirect page */}
      <Route path="/discord" element={<Discord />} />
      
      {/* Protected routes that require authentication */}
      <Route path="/movies" element={<Movies />} />
      <Route path="/series" element={<Series />} />
      <Route path="/watch-later" element={<WatchLater />} />
      <Route path="/watch/:id" element={<Watch />} />
      <Route path="/change-email" element={<ChangeEmail />} />
      <Route path="/settings" element={<Settings />} />
      <Route 
        path="/admin" 
        element={
          <AdminProtectedPage>
            <Admin />
          </AdminProtectedPage>
        } 
      />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
