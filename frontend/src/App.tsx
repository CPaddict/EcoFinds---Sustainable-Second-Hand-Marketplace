
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { CartProvider } from "@/contexts/CartContext";

// Pages
import Index from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import ProfilePage from "./pages/ProfilePage";
import MyListingsPage from "./pages/MyListingsPage";
import CartPage from "./pages/CartPage";
import PurchasesPage from "./pages/PurchasesPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFoundPage";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// App with context providers
const AppWithProviders = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const userId = currentUser?.id || null;
  
  return (
    <ProductProvider userId={userId}>
      <CartProvider userId={userId}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* Protected routes */}
          <Route path="/add-product" element={
            <ProtectedRoute>
              <AddProductPage />
            </ProtectedRoute>
          } />
          <Route path="/edit-product/:id" element={
            <ProtectedRoute>
              <EditProductPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/my-listings" element={
            <ProtectedRoute>
              <MyListingsPage />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          } />
          <Route path="/purchases" element={
            <ProtectedRoute>
              <PurchasesPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CartProvider>
    </ProductProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppWithProviders />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
