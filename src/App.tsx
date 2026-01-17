import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentHome from "./pages/student/StudentHome";
import { StudentCart } from "./pages/student/StudentCart";
import { StudentOrders } from "./pages/student/StudentOrders";
import { StudentProfile } from "./pages/student/StudentProfile";
import { StudentLogin } from "./pages/student/StudentLogin";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminMenu } from "./pages/admin/AdminMenu";
import { AdminSales } from "./pages/admin/AdminSales";

const queryClient = new QueryClient();

// Redirect based on user role
const RoleBasedRedirect = () => {
  const { role } = useAuth();
  
  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === 'student') {
    return <Navigate to="/student" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <MenuProvider>
            <CartProvider>
              <OrderProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/student/login" element={<StudentLogin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* Student Routes */}
                    <Route
                      path="/student"
                      element={
                        <ProtectedRoute requiredRole="student">
                          <StudentHome />
                        </ProtectedRoute>
                      }
                    />
                  <Route
                    path="/student/cart"
                    element={
                      <ProtectedRoute requiredRole="student">
                        <StudentCart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/orders"
                    element={
                      <ProtectedRoute requiredRole="student">
                        <StudentOrders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute requiredRole="student">
                        <StudentProfile />
                      </ProtectedRoute>
                    }
                  />
                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/menu"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminMenu />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/sales"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminSales />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </OrderProvider>
          </CartProvider>
        </MenuProvider>
      </WebSocketProvider>
    </AuthProvider>
  </BrowserRouter>
</QueryClientProvider>
);

export default App;
