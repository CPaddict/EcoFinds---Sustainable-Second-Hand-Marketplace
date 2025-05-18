
import { Layout } from "@/components/Layout";
import { useProducts } from "@/contexts/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function MyListingsPage() {
  const { userProducts } = useProducts();

  return (
    <Layout>
      <div className="page-container pb-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link to="/add-product">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
        
        {userProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">No listings yet</h2>
            <p className="text-gray-500 mb-6">
              You haven't created any product listings yet
            </p>
            <Link to="/add-product">
              <Button size="lg">Create Your First Listing</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {userProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
