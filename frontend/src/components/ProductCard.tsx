
import { Product } from "@/types";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className={`relative ${compact ? 'h-32' : 'h-48'} overflow-hidden bg-gray-100`}>
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-eco-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            ${product.price.toFixed(2)}
          </div>
        </div>
        
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-lg'} truncate`}>
            {product.title}
          </h3>
          <p className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>
            {product.category}
          </p>
          {!compact && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className={compact ? 'p-3 pt-0' : 'p-4 pt-0'}>
          <Button onClick={handleAddToCart} variant="outline" size={compact ? "sm" : "default"} className="w-full">
            <ShoppingCart className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
