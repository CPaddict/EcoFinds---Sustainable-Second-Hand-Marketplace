
import { Layout } from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function PurchasesPage() {
  const { purchaseHistory } = useCart();

  return (
    <Layout>
      <div className="page-container pb-20">
        <h1 className="text-2xl font-bold mb-6">Purchase History</h1>
        
        {purchaseHistory.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">No purchases yet</h2>
            <p className="text-gray-500 mb-6">
              You haven't made any purchases yet
            </p>
            <Link to="/" className="text-eco-500 hover:underline">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {purchaseHistory.map((purchase) => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-32 h-32 bg-gray-100 flex-shrink-0">
                      {purchase.product.images && purchase.product.images.length > 0 ? (
                        <img 
                          src={purchase.product.images[0]} 
                          alt={purchase.product.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex-grow">
                      <div className="flex justify-between">
                        <Link to={`/product/${purchase.productId}`} className="hover:underline">
                          <h3 className="font-medium">{purchase.product.title}</h3>
                        </Link>
                        <span className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(purchase.purchaseDate), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Quantity: {purchase.quantity}</p>
                        <p>Price: ${purchase.product.price.toFixed(2)}/each</p>
                        <p className="font-medium mt-1">
                          Total: ${(purchase.product.price * purchase.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="mt-3 flex gap-3">
                        <Link to={`/product/${purchase.productId}`} className="text-eco-500 hover:underline text-sm">
                          View Product
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link to="#" className="text-eco-500 hover:underline text-sm">
                          Buy Again
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
