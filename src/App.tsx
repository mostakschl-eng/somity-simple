import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MemberList from "@/pages/admin/MemberList";
import CreateMember from "@/pages/admin/CreateMember";
import MemberProfile from "@/pages/admin/MemberProfile";
import UpdateRecord from "@/pages/admin/UpdateRecord";
import MemberProfilePage from "@/pages/member/MemberProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: 'super_admin' | 'member' }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-xl font-bold text-primary-foreground">স</span>
          </div>
          <p className="text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'super_admin' ? '/admin/dashboard' : '/member/profile'} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function RootRedirect() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/member/profile" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="super_admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute requiredRole="super_admin"><MemberList /></ProtectedRoute>} />
            <Route path="/admin/members/new" element={<ProtectedRoute requiredRole="super_admin"><CreateMember /></ProtectedRoute>} />
            <Route path="/admin/members/:id" element={<ProtectedRoute requiredRole="super_admin"><MemberProfile /></ProtectedRoute>} />
            <Route path="/admin/members/:id/update" element={<ProtectedRoute requiredRole="super_admin"><UpdateRecord /></ProtectedRoute>} />

            {/* Member routes */}
            <Route path="/member/profile" element={<ProtectedRoute requiredRole="member"><MemberProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
