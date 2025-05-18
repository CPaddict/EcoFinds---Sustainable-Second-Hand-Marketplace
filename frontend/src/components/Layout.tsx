
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, Search, Plus, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-xl text-eco-500 flex items-center">
            <span className="bg-eco-500 text-white p-1 rounded mr-2">Eco</span>
            <span>Finds</span>
          </Link>
          
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {!isMobile && (
                  <Link to="/search">
                    <Button variant="ghost" size="icon">
                      <Search className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                
                <Link to="/cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/add-product">
                  <Button variant="ghost" size="icon">
                    <Plus className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                
                <Button variant="outline" onClick={logout} className="hidden md:flex">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      {isAuthenticated && isMobile && (
        <nav className="fixed bottom-0 w-full bg-white border-t z-10">
          <div className="flex justify-around py-2">
            <Link to="/" className={cn("flex flex-col items-center text-xs p-1", isActive("/") ? "text-eco-500" : "text-gray-500")}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
            <Link to="/search" className={cn("flex flex-col items-center text-xs p-1", isActive("/search") ? "text-eco-500" : "text-gray-500")}>
              <Search className="w-6 h-6" />
              <span>Search</span>
            </Link>
            <Link to="/add-product" className={cn("flex flex-col items-center text-xs p-1", isActive("/add-product") ? "text-eco-500" : "text-gray-500")}>
              <Plus className="w-6 h-6" />
              <span>Add</span>
            </Link>
            <Link to="/cart" className={cn("flex flex-col items-center text-xs p-1", isActive("/cart") ? "text-eco-500" : "text-gray-500")}>
              <ShoppingCart className="w-6 h-6" />
              <span>Cart</span>
            </Link>
            <Link to="/profile" className={cn("flex flex-col items-center text-xs p-1", isActive("/profile") ? "text-eco-500" : "text-gray-500")}>
              <User className="w-6 h-6" />
              <span>Profile</span>
            </Link>
          </div>
        </nav>
      )}
      
      <footer className="bg-eco-900 text-white py-4 mt-auto">
        <div className="container max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} EcoFinds. All rights reserved.</p>
          <p className="text-eco-300 mt-1">Shop sustainably. Live responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
