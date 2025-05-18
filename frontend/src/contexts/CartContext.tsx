// src/contexts/CartContext.tsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { CartItem, Product, Purchase } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartContextType {
  cartItems: CartItem[];
  purchaseHistory: Purchase[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>; // productId is number
  updateQuantity: (productId: number, quantity: number) => Promise<void>; // productId is number
  clearCartClientSide: () => void;
  checkout: () => Promise<boolean>;
  fetchPurchaseHistory: () => Promise<void>;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const cartTotal = React.useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + (item.product?.price || 0) * item.quantity, 0
    );
  }, [cartItems]);

  const cartCount = React.useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const formatErrorMessage = (errorObj: any, defaultMessage: string): string => {
    if (!errorObj) return defaultMessage;
    if (typeof errorObj === 'string') return errorObj;
    if (typeof errorObj === 'object' && errorObj !== null) {
      if (errorObj.msg && typeof errorObj.msg === 'string') return errorObj.msg;
      if (errorObj.message && typeof errorObj.message === 'string') return errorObj.message;
      try { return JSON.stringify(errorObj); } catch { return defaultMessage; }
    }
    return defaultMessage;
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !currentUser) { setCartItems([]); return; }
    setIsLoading(true);
    const response = await api.getCart();
    setIsLoading(false);
    if (response && Array.isArray(response) && !response.error) {
      setCartItems(response as CartItem[]);
    } else { 
      const errorMessage = formatErrorMessage(response?.error, "Could not load your cart.");
      if (response?.error) {
        toast({ title: "Error Fetching Cart", description: errorMessage, variant: "destructive" });
      }
      setCartItems([]);
    }
  }, [isAuthenticated, currentUser, toast]);

  const fetchPurchaseHistory = useCallback(async () => {
    if (!isAuthenticated || !currentUser) { setPurchaseHistory([]); return; }
    setIsLoading(true);
    const response = await api.getPurchaseHistory();
    setIsLoading(false);
    if (response && Array.isArray(response) && !response.error) {
      setPurchaseHistory(response as Purchase[]);
    } else {
      const errorMessage = formatErrorMessage(response?.error, "Could not load purchase history.");
      if (response?.error) {
        toast({ title: "Error Fetching Purchases", description: errorMessage, variant: "destructive" });
      }
      setPurchaseHistory([]);
    }
  }, [isAuthenticated, currentUser, toast]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchCart();
      fetchPurchaseHistory();
    } else {
      setCartItems([]);
      setPurchaseHistory([]);
    }
  }, [isAuthenticated, currentUser, fetchCart, fetchPurchaseHistory]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast({ title: "Not Logged In", description: "Please log in to add items to your cart."});
      return;
    }
    setIsLoading(true);
    const response = await api.addToCart(product.id, quantity); // product.id is number
    setIsLoading(false);
    if (response && (response as CartItem).productId && !response.error) {
      await fetchCart(); // Refetch cart
      toast({ title: "Added to cart", description: `${product.title} added to your cart.` });
    } else {
      const errorMessage = formatErrorMessage(response?.error, "Could not add to cart.");
      toast({ title: "Error Adding to Cart", description: errorMessage, variant: "destructive" });
    }
  };

  const removeFromCart = async (productId: number) => { // productId is number
    if (!isAuthenticated) return;
    setIsLoading(true);
    const response = await api.removeFromCart(productId);
    setIsLoading(false);
    if (response && response.cart && !response.error) {
      setCartItems(response.cart);
      toast({ title: "Removed from cart", description: "Item removed from your cart." });
    } else {
      const errorMessage = formatErrorMessage(response?.error, "Could not remove from cart.");
      toast({ title: "Error Removing Item", description: errorMessage, variant: "destructive" });
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => { // productId is number
    if (!isAuthenticated) return;
    if (quantity < 1) { return removeFromCart(productId); }
    setIsLoading(true);
    const response = await api.updateCartItem(productId, quantity);
    setIsLoading(false);
    if (response && response.cart && !response.error) {
      setCartItems(response.cart);
    } else {
      const errorMessage = formatErrorMessage(response?.error, "Could not update quantity.");
      toast({ title: "Error Updating Quantity", description: errorMessage, variant: "destructive" });
    }
  };
  
  const clearCartClientSide = () => { setCartItems([]); };

  const checkout = async (): Promise<boolean> => {
    if (!isAuthenticated || cartItems.length === 0) return false;
    setIsLoading(true);
    const response = await api.checkout();
    setIsLoading(false);
    if (response && response.purchaseId && !response.error) {
      toast({ title: "Checkout complete!", description: "Thank you for your purchase." });
      await fetchCart(); 
      await fetchPurchaseHistory();
      return true;
    } else {
      const errorMessage = formatErrorMessage(response?.error, "Could not complete checkout.");
      toast({ title: "Checkout failed", description: errorMessage, variant: "destructive" });
      return false;
    }
  };

  const value = {
    cartItems, purchaseHistory, isLoading, fetchCart, addToCart, removeFromCart, updateQuantity,
    clearCartClientSide, checkout, fetchPurchaseHistory, cartTotal, cartCount,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) { throw new Error("useCart must be used within a CartProvider"); }
  return context;
};
