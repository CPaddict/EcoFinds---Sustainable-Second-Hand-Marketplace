
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash, Plus, Minus, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, checkout } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const handleCheckout = async () => {
    if (!isAuthenticated || cartItems.length === 0) {
      return;
    }
    
    setIsCheckingOut(true);
    await checkout();
    setIsCheckingOut(false);
  };

  return (
    <Layout>
      <div className="page-container pb-20">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any products to your cart yet
            </p>
            <Link to="/">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Cart Items</h2>
                </div>
                
                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
                      <div className="flex-shrink-0 w-full md:w-24 h-24 bg-gray-100">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img 
                            src={item.product.images[0]} 
                            alt={item.product.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-xs text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <Link to={`/product/${item.productId}`} className="hover:underline">
                            <h3 className="font-medium">{item.product.title}</h3>
                          </Link>
                          <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          ${item.product.price.toFixed(2)} each
                        </p>
                        
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center border rounded overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))} 
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-4 py-1">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)} 
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  disabled={isCheckingOut || cartItems.length === 0}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? "Processing..." : "Checkout"}
                  {!isCheckingOut && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
