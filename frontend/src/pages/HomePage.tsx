
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useProducts } from "@/contexts/ProductContext";
import { ProductCard } from "@/components/ProductCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { Toggle } from "@/components/ui/toggle";
import { ShoppingCart, Store } from "lucide-react";

export default function HomePage() {
  const { 
    filteredProducts, 
    activeCategory, 
    setActiveCategory,
    searchQuery,
    setSearchQuery
  } = useProducts();
  const isMobile = useIsMobile();
  const [isSeller, setIsSeller] = useState(false);
  
  // Reset filters when component mounts
  useEffect(() => {
    setActiveCategory("All");
    setSearchQuery("");
  }, [setActiveCategory, setSearchQuery]);

  return (
    <Layout>
      <div className="page-container pb-20">
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h1 className="text-3xl font-bold">Welcome to EcoFinds</h1>
              
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                <Toggle 
                  pressed={!isSeller} 
                  onPressedChange={() => setIsSeller(false)}
                  className="flex items-center gap-1 text-sm"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Buyer</span>
                </Toggle>
                <Toggle 
                  pressed={isSeller} 
                  onPressedChange={() => setIsSeller(true)}
                  className="flex items-center gap-1 text-sm"
                >
                  <Store className="h-4 w-4" />
                  <span>Seller</span>
                </Toggle>
              </div>
            </div>
            
            <p className="text-gray-600">Discover sustainable and eco-friendly products</p>
            
            {!isMobile && (
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <SearchBar 
                    onSearch={setSearchQuery} 
                    initialValue={searchQuery}
                  />
                </div>
                
                {isSeller && (
                  <Link to="/add-product">
                    <Button>Add Product</Button>
                  </Link>
                )}
              </div>
            )}
            
            <CategoryFilter 
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </div>

          {isSeller ? (
            <div className="bg-eco-50 rounded-lg p-6 text-center border border-eco-200 shadow-sm">
              <h2 className="text-xl font-medium text-eco-700 mb-3">Seller Dashboard</h2>
              <p className="text-eco-600 mb-4">
                Start selling your eco-friendly products today!
              </p>
              <div className="flex justify-center">
                <Link to="/add-product">
                  <Button>
                    <Store className="mr-2 h-4 w-4" />
                    Add New Product
                  </Button>
                </Link>
                <Link to="/my-listings" className="ml-3">
                  <Button variant="outline">View My Listings</Button>
                </Link>
              </div>
            </div>
          ) : (
            filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium text-gray-600">No products found</h2>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search or category filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
