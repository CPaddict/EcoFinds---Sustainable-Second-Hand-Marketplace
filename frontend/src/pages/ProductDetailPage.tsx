
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowLeft, Pencil, Trash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getProductById, deleteProduct } = useProducts();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(id ? getProductById(id) : undefined);
  const [quantity, setQuantity] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isOwner = currentUser && product && currentUser.id === product.sellerId;
  
  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
      
      if (!foundProduct) {
        navigate('/not-found', { replace: true });
      }
    }
  }, [id, getProductById, navigate]);
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  const handleDelete = async () => {
    if (!product || !id) return;
    
    setIsDeleting(true);
    const success = await deleteProduct(id);
    setIsDeleting(false);
    
    if (success) {
      navigate('/my-listings');
    }
  };
  
  if (!product) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="page-container">
        <Link to="/" className="inline-flex items-center mb-6 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={16} className="mr-1" />
          Back to listings
        </Link>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.title} 
                className="w-full h-auto object-contain max-h-96" 
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>
                {isOwner && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link to={`/edit-product/${product.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
              
              <div className="text-2xl font-bold text-eco-500 mt-2">
                ${product.price.toFixed(2)}
              </div>
              
              <div className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mt-4">
                {product.category}
              </div>
            </div>
            
            <div className="border-t border-b py-4">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="mr-3">Quantity:</span>
                <div className="flex border rounded overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 flex items-center justify-center min-w-[40px]">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)} 
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAddToCart} className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                
                <Button variant="outline" className="flex-1">
                  <Heart className="mr-2 h-4 w-4" />
                  Add to Wishlist
                </Button>
              </div>
            </div>
            
            <div className="border-t pt-4 text-sm text-gray-500">
              <p>Listed by: {product.sellerName}</p>
              <p>Date listed: {new Date(product.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
